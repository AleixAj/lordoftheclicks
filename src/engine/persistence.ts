import type { GameState } from '@/types/game';
import { calcClickDamage } from './formulas';
import { spawnInitial } from './spawn';

// Bumped to v4 after inserting Eregion, Pelargir and Ithilien into the
// location array (and reverting Fangorn back to combat). Old `locIdx` values
// would point to the wrong location, so we invalidate the previous saves.
const SAVE_KEY = 'lotc_save_v4';

export function createInitialState(): GameState {
  return {
    locIdx: 0,
    gold: 0,
    mithril: 0,
    xp: 0,
    level: 1,
    clickDmg: 2,
    enemy: spawnInitial(0),
    companions: {},
    equipped: { weapon: null, armor: null, accessory: null },
    owned: [],
    locKills: {},
    totalKills: 0,
    unlockedLocs: ['comarca'],
    bossDefeated: {},
    questProgress: {},
    questsDone: [],
  };
}

export function loadGame(): GameState {
  if (typeof window === 'undefined') return createInitialState();
  const saved = window.localStorage.getItem(SAVE_KEY);
  if (!saved) return createInitialState();
  try {
    const parsed = JSON.parse(saved) as GameState;
    // Light migration: rehydrate derived values to stay consistent across version bumps.
    return {
      ...parsed,
      clickDmg: calcClickDamage({ level: parsed.level, equipped: parsed.equipped }),
    };
  } catch {
    return createInitialState();
  }
}

export function saveGame(state: GameState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function resetSave(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SAVE_KEY);
}
