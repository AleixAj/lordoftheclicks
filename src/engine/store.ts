import { create } from 'zustand';
import { COMPANIONS, LOCATIONS, SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS, QUESTS } from '@/data';
import type {
  CompanionState,
  EquipSlot,
  GameState,
  ItemId,
  LocationId,
  QuestId,
  CompanionId,
} from '@/types/game';
import {
  calcClickDamage,
  calcClickDamageAgainstEnemy,
  calcDpsAgainstEnemy,
  companionUpgradeCost,
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

let dmgIdSeq = 0;

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

function applyPostMutations(state: GameState): GameState {
  return {
    ...state,
    questProgress: updateReachQuestProgress(
      state.questProgress,
      state.questsDone,
      state.unlockedLocs,
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
    set({ state: nextState });

    if (willKill) {
      set({ deadAnim: true, goldBurst: true });
      window.setTimeout(() => set({ deadAnim: false, goldBurst: false }), 500);
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
    let questProgress = current.questProgress;
    // Rest zones without an explicit `unlockGate` keep the legacy behaviour
    // of auto-unlocking the next location on first visit. Zones with a
    // gate (e.g. La Comarca → requires Frodo + Sam) only advance through
    // the recruit action.
    if (loc.isRest && !loc.unlockGate) {
      unlockedLocs = unlockNextLocation(unlockedLocs, locIdx);
      questProgress = updateReachQuestProgress(
        questProgress,
        current.questsDone,
        unlockedLocs,
        current.questsAccepted,
      );
    }

    const enemy = loc.isRest ? null : spawnFromPool(loc);

    set({
      state: applyPostMutations({
        ...current,
        locIdx,
        enemy,
        bossFight: null,
        unlockedLocs,
        questProgress,
      }),
      fightFailed: null,
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
          deadlineMs: now + fightTimeLimitForFight(loc, tier, current.equipped) * 1000,
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
    // Auto-clear the flash message so the UI feedback is short and unobtrusive.
    window.setTimeout(() => {
      if (get().fightFailed === failedTier) set({ fightFailed: null });
    }, 2200);
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
    let questProgress = current.questProgress;
    if (loc.unlockGate && isUnlockGateMet(loc.unlockGate, nextCompanions)) {
      unlockedLocs = unlockNextLocation(unlockedLocs, current.locIdx);
      questProgress = updateReachQuestProgress(
        questProgress,
        current.questsDone,
        unlockedLocs,
        current.questsAccepted,
      );
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
    const cap = companionLevelCapForLocation(current.locIdx);
    if (cs.level >= cap) return;
    const cost = companionUpgradeCost(cs.level);
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
        mithril: current.mithril + (q.reward.mithril ?? 0),
        questsDone: [...current.questsDone, questId],
      },
    });
  },

  resetGame: () => {
    resetSave();
    set({ state: applyPostMutations(createInitialState()) });
  },

  unlockAll: () => {
    const current = get().state;
    const allIds = LOCATIONS.map((l) => l.id);
    set({
      state: applyPostMutations({
        ...current,
        unlockedLocs: allIds,
      }),
    });
  },

  giveGold: (amount = 1_000_000) => {
    const current = get().state;
    set({ state: { ...current, gold: current.gold + amount } });
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
    for (const c of COMPANIONS) companions[c.id] = { unlocked: true, level: 10 };

    const allItems = [...SHOP_WEAPONS, ...SHOP_ARMOR, ...SHOP_ACCESS];
    const owned: ItemId[] = allItems.map((i) => i.id);

    const bestOf = <T extends { id: ItemId; dmg?: number; def?: number; bonus?: number }>(
      list: readonly T[],
      key: 'dmg' | 'def' | 'bonus',
    ): ItemId | null => {
      if (!list.length) return null;
      return list.reduce((a, b) => ((a[key] ?? 0) >= (b[key] ?? 0) ? a : b)).id;
    };

    const equipped = {
      weapon: bestOf(SHOP_WEAPONS, 'dmg'),
      armor: bestOf(SHOP_ARMOR, 'def'),
      accessory: bestOf(SHOP_ACCESS, 'bonus'),
    };

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
      equipped,
      owned,
      locKills,
      totalKills,
      unlockedLocs: allLocIds,
      bossDefeated,
      semiBossDefeated,
      questProgress,
      questsDone,
      questsAccepted: QUESTS.map((q) => q.id),
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
} from './formulas';
export { xpForLevel } from './formulas';
export type { LocationId };
export { saveGame };
