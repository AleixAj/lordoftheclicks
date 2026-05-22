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
import { calcClickDamage, calcDps, companionUpgradeCost } from './formulas';
import { dealDamage } from './combat';
import { spawnFromPool, spawnBoss } from './spawn';
import {
  unlockCompanionsForLocations,
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

  clickEnemy: () => void;
  tick: () => void;
  travelTo: (locIdx: number) => void;
  buyItem: (slot: EquipSlot, itemId: ItemId) => void;
  equipItem: (slot: EquipSlot, itemId: ItemId) => void;
  levelUpCompanion: (companionId: CompanionId) => void;
  claimQuest: (questId: QuestId) => void;
  resetGame: () => void;
  /** Dev cheat: unlock every location and complete `reach` quests. */
  unlockAll: () => void;
  /** Dev cheat: fully simulate a finished playthrough. */
  completeAll: () => void;
}

let dmgIdSeq = 0;

function pushDamageNumber(set: (fn: (s: GameStore) => Partial<GameStore>) => void, value: number, crit: boolean) {
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
  let next = unlockCompanionsForLocations(state);
  next = {
    ...next,
    questProgress: updateReachQuestProgress(next.questProgress, next.questsDone, next.unlockedLocs),
  };
  return next;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: applyPostMutations(loadGame()),
  dmgNums: [],
  shaking: false,
  deadAnim: false,
  goldBurst: false,

  clickEnemy: () => {
    const current = get().state;
    if (!current.enemy) return;
    const baseDmg = calcClickDamage(current);
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
    const dps = calcDps(current);
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
    if (loc.isRest) {
      unlockedLocs = unlockNextLocation(unlockedLocs, locIdx);
      questProgress = updateReachQuestProgress(questProgress, current.questsDone, unlockedLocs);
    }

    const enemy = loc.isRest ? null : spawnFromPool(loc) ?? spawnBoss(loc);

    set({
      state: applyPostMutations({
        ...current,
        locIdx,
        enemy,
        unlockedLocs,
        questProgress,
      }),
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

  levelUpCompanion: (companionId) => {
    const current = get().state;
    const cs = current.companions[companionId];
    if (!cs?.unlocked) return;
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

  completeAll: () => {
    const allLocIds = LOCATIONS.map((l) => l.id);

    const locKills: Record<LocationId, number> = {};
    const bossDefeated: Record<LocationId, boolean> = {};
    for (const l of LOCATIONS) {
      locKills[l.id] = l.killsNeeded;
      if (l.boss) bossDefeated[l.id] = true;
    }

    const companions: Record<CompanionId, CompanionState> = {};
    for (const c of COMPANIONS) companions[c.id] = { unlocked: true, level: 10 };

    const allItems = [...SHOP_WEAPONS, ...SHOP_ARMOR, ...SHOP_ACCESS];
    const owned: ItemId[] = allItems.map((i) => i.id);

    const bestOf = <T extends { id: ItemId } & Record<string, unknown>>(
      list: readonly T[],
      key: 'dmg' | 'def' | 'bonus',
    ): ItemId | null => {
      if (!list.length) return null;
      return list.reduce((a, b) => (Number(a[key] ?? 0) >= Number(b[key] ?? 0) ? a : b)).id;
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
      companions,
      equipped,
      owned,
      locKills,
      totalKills,
      unlockedLocs: allLocIds,
      bossDefeated,
      questProgress,
      questsDone,
    };
    baseState.clickDmg = calcClickDamage(baseState);
    baseState.enemy = spawnFromPool(LOCATIONS[0]);

    set({ state: applyPostMutations(baseState) });
  },
}));

export { calcClickDamage, calcDps, companionUpgradeCost } from './formulas';
export { xpForLevel } from './formulas';
export type { LocationId };
export { saveGame };
