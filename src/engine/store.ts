/**
 * Single source of truth for the game's runtime state.
 *
 * This module is the only React-aware piece of the engine: it wraps the
 * pure helpers in `formulas`, `combat`, `spawn`, `progression` and
 * `persistence` behind a flat Zustand store so components dispatch
 * actions instead of mutating state.
 *
 * State shape:
 *  - `state`: persisted `GameState` (saved to localStorage by `useGameLoop`).
 *  - Top-level booleans (`shaking`, `deadAnim`, `goldBurst`, `fightFailed`,
 *    `forgeUnlockFlash`) are transient UI flags that don't need to survive
 *    a reload and are kept outside `state` on purpose.
 *
 * Conventions:
 *  - Actions read `get().state`, validate preconditions, and replace the
 *    state via `set(...)`. They never mutate.
 *  - `applyPostMutations` runs after every state-changing action so reach
 *    quests stay consistent without scattering the logic across actions.
 *  - Dev cheats are colocated here (rather than in a separate module) so
 *    they share the same invariants as real actions and the auto-save
 *    pipeline picks them up automatically.
 */
import { create } from 'zustand';
import {
  COMPANIONS,
  LOCATIONS,
  QUESTS,
  SHOP_ACCESS,
  SHOP_ARMOR,
  SHOP_WEAPONS,
  UPGRADES,
} from '@/data';
import type {
  CompanionState,
  EquipSlot,
  GameState,
  ItemId,
  LocationId,
  QuestId,
  CompanionId,
  UpgradeId,
} from '@/types/game';
import {
  calcClickDamage,
  calcClickDamageAgainstEnemy,
  calcDpsAgainstEnemy,
  companionUpgradeCost,
  upgradeCost,
} from './formulas';
import { dealDamage } from './combat';
import { spawnBoss, spawnFromPool, spawnSemiBoss } from './spawn';
import {
  bossKillThreshold,
  companionLevelCapForLocation,
  fightTimeLimitForFight,
  isUnlockGateMet,
  semiBossKillThreshold,
  unlockNextLocation,
  updateReachQuestProgress,
} from './progression';
import { createInitialState, loadGame, resetSave, saveGame } from './persistence';

interface FloatingDamage {
  id: number;
  value: number;
  x: number;
  y: number;
  crit: boolean;
}

interface GameStore {
  state: GameState;
  dmgNums: FloatingDamage[];
  shaking: boolean;
  deadAnim: boolean;
  goldBurst: boolean;
  /** Transient UI flag: set briefly after a semi/boss escapes on timeout. */
  fightFailed: 'semi' | 'boss' | null;
  /** Transient UI flag: set briefly when the Forja is first unlocked (Rivendel visit). */
  forgeUnlockFlash: boolean;

  clickEnemy: () => void;
  tick: () => void;
  travelTo: (locIdx: number) => void;
  /** Start a semi-boss or boss encounter if all conditions are met. */
  startBossFight: (tier: 'semi' | 'boss') => void;
  /** Called by the game loop when the fight's deadline expires (loss). */
  failBossFight: () => void;
  /** Player-initiated abandon (X button). Silent: no failure flash. */
  abandonBossFight: () => void;
  buyItem: (slot: EquipSlot, itemId: ItemId) => void;
  equipItem: (slot: EquipSlot, itemId: ItemId) => void;
  recruitCompanion: (companionId: CompanionId) => void;
  levelUpCompanion: (companionId: CompanionId) => void;
  /** Pick up every pending quest anchored at `locId` (the "!" badge on the map). */
  acceptQuests: (locId: LocationId) => void;
  claimQuest: (questId: QuestId) => void;
  buyUpgrade: (upgradeId: UpgradeId) => void;
  /** Refunds every mithril spent in the Forja and clears all upgrade ranks. */
  resetUpgrades: () => void;
  /** Marks the Forja as opened so the unlock highlight stops glowing. */
  markForgeSeen: () => void;
  /** Dismisses the transient Forja-unlocked flash banner. */
  dismissForgeUnlockFlash: () => void;
  /** Dismisses the boss/semi-boss escape banner. */
  dismissFightFailed: () => void;
  resetGame: () => void;
  /** Dev cheat: unlock every location and complete `reach` quests. */
  unlockAll: () => void;
  /** Dev cheat: fully simulate a finished playthrough. */
  completeAll: () => void;
  /** Dev cheat: mark current zone as cleared (boss + semi) and unlock the next one. */
  completeCurrentZone: () => void;
  /** Dev cheat: add a large amount of gold to the wallet. */
  giveGold: (amount?: number) => void;
}

// Module-scope counter: guarantees a unique React key for every floating
// number even when several pop in the same frame.
let dmgIdSeq = 0;

/**
 * Spawns a floating damage number near the enemy and auto-removes it
 * after 800ms (matches the CSS fade-out animation in `battle.module.css`).
 * Coordinates are jittered so repeated clicks don't stack on top of each other.
 */
function pushDamageNumber(
  set: (fn: (s: GameStore) => Partial<GameStore>) => void,
  value: number,
  crit: boolean,
) {
  const id = ++dmgIdSeq;
  const offsetX = (Math.random() - 0.5) * 60;
  const offsetY = Math.random() * -20;
  set((s) => ({
    dmgNums: [...s.dmgNums, { id, value, x: 50 + offsetX, y: 40 + offsetY, crit }],
  }));
  window.setTimeout(() => {
    set((s) => ({ dmgNums: s.dmgNums.filter((d) => d.id !== id) }));
  }, 800);
}

/**
 * Cross-cutting normalization run after every state mutation. Today it
 * only credits "reach" quests when `visitedLocs` changes; centralising it
 * here means individual actions don't have to remember to do it.
 */
function applyPostMutations(state: GameState): GameState {
  return {
    ...state,
    questProgress: updateReachQuestProgress(
      state.questProgress,
      state.questsDone,
      state.visitedLocs,
      state.questsAccepted,
    ),
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: applyPostMutations(loadGame()),
  dmgNums: [],
  shaking: false,
  deadAnim: false,
  goldBurst: false,
  fightFailed: null,
  forgeUnlockFlash: false,

  clickEnemy: () => {
    const current = get().state;
    if (!current.enemy) return;
    const baseDmg = calcClickDamageAgainstEnemy(current, current.enemy);
    const isCrit = Math.random() < 0.1;
    const finalDmg = isCrit ? baseDmg * 2 : baseDmg;

    pushDamageNumber(set, Math.round(finalDmg), isCrit);

    set({ shaking: true });
    window.setTimeout(() => set({ shaking: false }), 150);

    const willKill = current.enemy.hp - finalDmg <= 0;
    const nextState = applyPostMutations(dealDamage(current, finalDmg));

    if (willKill) {
      // Keep the dying enemy on screen during the death animation so the
      // new enemy doesn't inherit the fade-out. Rewards (gold, xp, kills)
      // are already in nextState; we temporarily pin the enemy to the dead
      // one (hp 0) until the animation finishes.
      const dyingEnemy = { ...current.enemy, hp: 0 };
      set({ state: { ...nextState, enemy: dyingEnemy }, deadAnim: true, goldBurst: true });
      window.setTimeout(() => {
        set({ state: nextState, deadAnim: false, goldBurst: false });
      }, 500);
    } else {
      set({ state: nextState });
    }
  },

  tick: () => {
    const current = get().state;
    if (!current.enemy) return;
    const dps = calcDpsAgainstEnemy(current, current.enemy);
    if (dps <= 0) return;
    const damagePerTick = dps / 4;
    set({ state: applyPostMutations(dealDamage(current, damagePerTick)) });
  },

  travelTo: (locIdx) => {
    const current = get().state;
    const loc = LOCATIONS[locIdx];
    if (!loc || !current.unlockedLocs.includes(loc.id)) return;

    let unlockedLocs = current.unlockedLocs;
    // Mark the destination as visited so reach quests for this location
    // can be credited. visitedLocs is the source of truth for reach quests,
    // separate from unlockedLocs (which can grow without a physical visit).
    const visitedLocs = current.visitedLocs.includes(loc.id)
      ? current.visitedLocs
      : [...current.visitedLocs, loc.id];

    // Rest zones without an explicit `unlockGate` auto-unlock the next
    // location on first visit. Gated zones (e.g. La Comarca) only advance
    // through the recruit action.
    if (loc.isRest && !loc.unlockGate) {
      unlockedLocs = unlockNextLocation(unlockedLocs, locIdx);
    }

    const enemy = loc.isRest ? null : spawnFromPool(loc);

    // First visit to Rivendel unlocks the Forja and fires a transient
    // "unlocked" notice in the top-right corner. The notice auto-dismisses
    // after 5s; the button's highlight stays until the player opens the
    // Forja for the first time (see `markForgeSeen`).
    const unlocksForge = loc.id === 'rivendel' && !current.forgeUnlocked;

    set({
      state: applyPostMutations({
        ...current,
        locIdx,
        enemy,
        bossFight: null,
        unlockedLocs,
        visitedLocs,
        forgeUnlocked: current.forgeUnlocked || unlocksForge,
      }),
      fightFailed: null,
      ...(unlocksForge ? { forgeUnlockFlash: true } : {}),
    });
  },

  startBossFight: (tier) => {
    const current = get().state;
    // Already fighting the requested tier? Nothing to do. Different tier is
    // allowed and silently swaps the encounter (no "failed" flash) so the
    // player can switch between semi-boss and boss without abandoning first.
    if (current.bossFight && current.bossFight.tier === tier) return;
    const loc = LOCATIONS[current.locIdx];
    if (!loc || loc.isRest) return;

    const kills = current.locKills[loc.id] ?? 0;
    // Rematches are allowed: once you've cleared the zone you can keep
    // re-challenging the semi/boss as long as the kill thresholds are met.
    if (tier === 'semi') {
      if (!loc.semiBoss) return;
      if (kills < semiBossKillThreshold(loc)) return;
    } else {
      if (!loc.boss) return;
      // If the zone has a semi-boss, it must have been defeated at least once.
      if (loc.semiBoss && !current.semiBossDefeated[loc.id]) return;
      if (kills < bossKillThreshold(loc)) return;
    }

    const enemy = tier === 'semi' ? spawnSemiBoss(loc) : spawnBoss(loc);
    if (!enemy) return;

    const now = Date.now();
    set({
      state: {
        ...current,
        enemy,
        bossFight: {
          tier,
          locId: loc.id,
          startedAt: now,
          deadlineMs:
            now + fightTimeLimitForFight(loc, tier, current.equipped, current.upgrades) * 1000,
        },
      },
      fightFailed: null,
    });
  },

  failBossFight: () => {
    const current = get().state;
    if (!current.bossFight) return;
    const loc = LOCATIONS[current.locIdx];
    const pool = loc ? spawnFromPool(loc) : null;
    const failedTier = current.bossFight.tier;
    set({
      state: { ...current, enemy: pool, bossFight: null },
      fightFailed: failedTier,
    });
  },

  abandonBossFight: () => {
    const current = get().state;
    if (!current.bossFight) return;
    const loc = LOCATIONS[current.locIdx];
    const pool = loc ? spawnFromPool(loc) : null;
    set({
      state: { ...current, enemy: pool, bossFight: null },
      fightFailed: null,
    });
  },

  buyItem: (slot, itemId) => {
    const current = get().state;
    if (current.owned.includes(itemId)) return;
    const list = slot === 'weapon' ? SHOP_WEAPONS : slot === 'armor' ? SHOP_ARMOR : SHOP_ACCESS;
    const item = list.find((x) => x.id === itemId);
    if (!item || current.gold < item.cost) return;

    const equipped = { ...current.equipped, [slot]: itemId };
    const nextState: GameState = {
      ...current,
      gold: current.gold - item.cost,
      owned: [...current.owned, itemId],
      equipped,
    };
    nextState.clickDmg = calcClickDamage(nextState);
    set({ state: nextState });
  },

  equipItem: (slot, itemId) => {
    const current = get().state;
    if (!current.owned.includes(itemId)) return;
    const nextState: GameState = { ...current, equipped: { ...current.equipped, [slot]: itemId } };
    nextState.clickDmg = calcClickDamage(nextState);
    set({ state: nextState });
  },

  recruitCompanion: (companionId) => {
    const current = get().state;
    const c = COMPANIONS.find((x) => x.id === companionId);
    if (!c) return;
    if (current.companions[companionId]?.unlocked) return;
    // Must be present in the current zone's recruit list to be available.
    // Most companions join in rest zones, but Fangorn intentionally offers
    // Bárbol while still being a combat location.
    const loc = LOCATIONS[current.locIdx];
    if (!loc?.companions?.includes(companionId)) return;
    if (current.gold < c.recruitCost) return;
    // Optional gate: some allies (e.g. Rey de los Muertos) only join after
    // the boss of a specific location is defeated.
    if (c.requireBossDefeated && !current.bossDefeated[c.requireBossDefeated]) return;

    const nextCompanions = {
      ...current.companions,
      [companionId]: { unlocked: true, level: 1 },
    };

    // If this rest zone has an unlock gate and recruiting this companion
    // completes it, advance the world map automatically.
    let unlockedLocs = current.unlockedLocs;
    const questProgress = current.questProgress;
    if (loc.unlockGate && isUnlockGateMet(loc.unlockGate, nextCompanions)) {
      unlockedLocs = unlockNextLocation(unlockedLocs, current.locIdx);
      // Do NOT call updateReachQuestProgress here: the newly unlocked
      // location hasn't been visited yet, so any "reach X" quest targeting
      // it must wait until the player actually travels there.
    }

    set({
      state: {
        ...current,
        gold: current.gold - c.recruitCost,
        companions: nextCompanions,
        unlockedLocs,
        questProgress,
      },
    });
  },

  levelUpCompanion: (companionId) => {
    const current = get().state;
    const cs = current.companions[companionId];
    if (!cs?.unlocked) return;
    const cap = companionLevelCapForLocation(current.locIdx, current.upgrades);
    if (cs.level >= cap) return;
    const cost = companionUpgradeCost(cs.level, current.upgrades);
    if (current.gold < cost) return;
    set({
      state: {
        ...current,
        gold: current.gold - cost,
        companions: {
          ...current.companions,
          [companionId]: { ...cs, level: cs.level + 1 },
        },
      },
    });
  },

  acceptQuests: (locId) => {
    const current = get().state;
    // Can only discover quests in zones you've reached.
    if (!current.unlockedLocs.includes(locId)) return;

    const newlyAccepted = QUESTS.filter(
      (q) =>
        (q.pickupLoc ?? q.loc) === locId &&
        !current.questsAccepted.includes(q.id) &&
        !current.questsDone.includes(q.id),
    );
    if (newlyAccepted.length === 0) return;

    const questsAccepted = [...current.questsAccepted, ...newlyAccepted.map((q) => q.id)];

    // No backfill: kills_at and boss quests must be completed AFTER pickup.
    // Reach quests, however, are credited via applyPostMutations because
    // discovering the "!" in a zone implies the player is already there.
    set({
      state: applyPostMutations({
        ...current,
        questsAccepted,
      }),
    });
  },

  claimQuest: (questId) => {
    const current = get().state;
    const q = QUESTS.find((x) => x.id === questId);
    if (!q || current.questsDone.includes(questId)) return;
    const prog = current.questProgress[questId] ?? 0;
    if (prog < q.need) return;
    set({
      state: {
        ...current,
        gold: current.gold + (q.reward.gold ?? 0),
        questsDone: [...current.questsDone, questId],
      },
    });
  },

  buyUpgrade: (upgradeId) => {
    const current = get().state;
    const upgrade = UPGRADES.find((candidate) => candidate.id === upgradeId);
    if (!upgrade) return;
    const currentRank = current.upgrades[upgradeId] ?? 0;
    if (currentRank >= upgrade.maxRank) return;
    for (const [requiredId, requiredRank] of Object.entries(upgrade.requires ?? {})) {
      if (requiredRank === undefined) continue;
      if ((current.upgrades[requiredId] ?? 0) < requiredRank) return;
    }
    const cost = upgradeCost(upgradeId, currentRank);
    if (current.mithril < cost) return;

    const nextState: GameState = {
      ...current,
      mithril: current.mithril - cost,
      upgrades: {
        ...current.upgrades,
        [upgradeId]: currentRank + 1,
      },
    };
    nextState.clickDmg = calcClickDamage(nextState);
    set({ state: nextState });
  },

  resetUpgrades: () => {
    const current = get().state;
    let refund = 0;
    for (const upgrade of UPGRADES) {
      const rank = current.upgrades[upgrade.id] ?? 0;
      for (let r = 0; r < rank; r++) {
        refund += upgradeCost(upgrade.id, r);
      }
    }
    if (refund === 0 && Object.keys(current.upgrades).length === 0) return;
    const nextState: GameState = {
      ...current,
      mithril: current.mithril + refund,
      upgrades: {},
    };
    nextState.clickDmg = calcClickDamage(nextState);
    set({ state: nextState });
  },

  markForgeSeen: () => {
    const current = get().state;
    if (current.forgeSeen) return;
    set({ state: { ...current, forgeSeen: true } });
  },

  dismissForgeUnlockFlash: () => {
    if (!get().forgeUnlockFlash) return;
    set({ forgeUnlockFlash: false });
  },

  dismissFightFailed: () => {
    if (!get().fightFailed) return;
    set({ fightFailed: null });
  },

  resetGame: () => {
    resetSave();
    set({ state: applyPostMutations(createInitialState()) });
  },

  unlockAll: () => {
    const current = get().state;
    const allIds = LOCATIONS.map((l) => l.id);
    // Bypass the kill-count gates so semi/boss buttons become clickable in
    // every zone, and pre-flag each semi as defeated so the boss isn't
    // blocked behind it. Defeats are kept as visual ✓ marks only — both
    // encounters remain re-fightable.
    const locKills = { ...current.locKills };
    const semiBossDefeated = { ...current.semiBossDefeated };
    for (const loc of LOCATIONS) {
      if (!loc.semiBoss && !loc.boss) continue;
      const needed = bossKillThreshold(loc);
      locKills[loc.id] = Math.max(locKills[loc.id] ?? 0, needed);
      if (loc.semiBoss) semiBossDefeated[loc.id] = true;
    }
    set({
      state: applyPostMutations({
        ...current,
        unlockedLocs: allIds,
        forgeUnlocked: true,
        forgeSeen: true,
        locKills,
        semiBossDefeated,
      }),
    });
  },

  giveGold: (amount = 1_000_000) => {
    const current = get().state;
    set({
      state: {
        ...current,
        gold: current.gold + amount,
        mithril: current.mithril + amount,
      },
    });
  },

  completeCurrentZone: () => {
    const current = get().state;
    const loc = LOCATIONS[current.locIdx];
    if (!loc) return;

    // Mark the zone as fully cleared: boss + semi defeated, kill count
    // bumped to the target, next location unlocked. Also push every
    // accepted quest anchored here to its `need` value so the player can
    // claim them straight from the panel.
    const bossDefeated = { ...current.bossDefeated };
    const semiBossDefeated = { ...current.semiBossDefeated };
    if (loc.boss) bossDefeated[loc.id] = true;
    if (loc.semiBoss) semiBossDefeated[loc.id] = true;

    const locKills = {
      ...current.locKills,
      [loc.id]: Math.max(current.locKills[loc.id] ?? 0, loc.killsNeeded),
    };

    const questProgress = { ...current.questProgress };
    for (const q of QUESTS) {
      if (q.loc !== loc.id) continue;
      if (current.questsDone.includes(q.id)) continue;
      if (!current.questsAccepted.includes(q.id)) continue;
      questProgress[q.id] = q.need;
    }

    const unlockedLocs = unlockNextLocation(current.unlockedLocs, current.locIdx);

    // Refresh the on-screen enemy with a fresh pool mob (or null for rest
    // zones) so the player isn't staring at a dead/boss sprite afterwards.
    const enemy = loc.isRest ? null : spawnFromPool(loc);

    set({
      state: applyPostMutations({
        ...current,
        enemy,
        bossFight: null,
        bossDefeated,
        semiBossDefeated,
        locKills,
        questProgress,
        unlockedLocs,
      }),
      fightFailed: null,
    });
  },

  completeAll: () => {
    const allLocIds = LOCATIONS.map((l) => l.id);

    const locKills: Record<LocationId, number> = {};
    const bossDefeated: Record<LocationId, boolean> = {};
    const semiBossDefeated: Record<LocationId, boolean> = {};
    for (const l of LOCATIONS) {
      locKills[l.id] = l.killsNeeded;
      if (l.boss) bossDefeated[l.id] = true;
      if (l.semiBoss) semiBossDefeated[l.id] = true;
    }

    const companions: Record<CompanionId, CompanionState> = {};
    for (const c of COMPANIONS) companions[c.id] = { unlocked: true, level: 1 };

    const allItems = [...SHOP_WEAPONS, ...SHOP_ARMOR, ...SHOP_ACCESS];
    const owned: ItemId[] = allItems.map((i) => i.id);

    const questProgress: Record<QuestId, number> = {};
    const questsDone: QuestId[] = [];
    for (const q of QUESTS) {
      questProgress[q.id] = q.need;
      questsDone.push(q.id);
    }

    const totalKills = LOCATIONS.reduce((sum, l) => sum + l.killsNeeded, 0);

    const baseState: GameState = {
      locIdx: 0,
      gold: 999_999,
      mithril: 9_999,
      xp: 0,
      level: 50,
      clickDmg: 1,
      enemy: null,
      bossFight: null,
      companions,
      equipped: { weapon: null, armor: null, accessory: null },
      owned,
      locKills,
      totalKills,
      unlockedLocs: allLocIds,
      visitedLocs: allLocIds,
      bossDefeated,
      semiBossDefeated,
      questProgress,
      questsDone,
      questsAccepted: QUESTS.map((q) => q.id),
      upgrades: Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade.maxRank])),
      forgeUnlocked: true,
      forgeSeen: true,
    };
    baseState.clickDmg = calcClickDamage(baseState);
    baseState.enemy = spawnFromPool(LOCATIONS[0]);

    set({ state: applyPostMutations(baseState) });
  },
}));

export {
  calcActiveEnemyTypeBonusPct,
  calcClickDamage,
  calcClickDamageAgainstEnemy,
  calcDps,
  calcDpsAgainstEnemy,
  companionUpgradeCost,
  upgradeCost,
  upgradeEffectValue,
} from './formulas';
export { xpForLevel } from './formulas';
export type { LocationId };
export { saveGame };
