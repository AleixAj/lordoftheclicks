import type { GameState } from '@/types/game';
import { calcClickDamage } from './formulas';
import { spawnInitial } from './spawn';

// Bumped to v10 after gating the Forja behind a Rivendel visit. Adds the
// `forgeUnlocked` / `forgeSeen` flags used by the unlock notice and the
// header button highlight.
const SAVE_KEY = 'lotc_save_v10';

export function createInitialState(): GameState {
  return {
    locIdx: 0,
    gold: 0,
    mithril: 0,
    xp: 0,
    level: 1,
    clickDmg: 2,
    enemy: spawnInitial(0),
    bossFight: null,
    companions: {},
    equipped: { weapon: null, armor: null, accessory: null },
    owned: [],
    locKills: {},
    totalKills: 0,
    unlockedLocs: ['comarca'],
    bossDefeated: {},
    semiBossDefeated: {},
    questProgress: {},
    questsDone: [],
    questsAccepted: [],
    upgrades: {},
    forgeUnlocked: false,
    forgeSeen: false,
  };
}

export function loadGame(): GameState {
  if (typeof window === 'undefined') return createInitialState();
  const saved = window.localStorage.getItem(SAVE_KEY);
  if (!saved) return createInitialState();
  try {
    const parsed = JSON.parse(saved) as Partial<GameState>;
    // Light migration: rehydrate derived values and fill in any field that
    // may be missing in older save snapshots within the same SAVE_KEY.
    const base = createInitialState();
    // Quests in old saves were implicitly accepted. Preserve that for any
    // quest the player has already completed or made progress on, so the
    // active list doesn't suddenly empty out for returning players.
    const legacyAccepted = parsed.questsAccepted ?? [
      ...(parsed.questsDone ?? []),
      ...Object.entries(parsed.questProgress ?? {})
        .filter(([, v]) => (v ?? 0) > 0)
        .map(([k]) => k),
    ];
    const questsAccepted = Array.from(new Set(legacyAccepted));

    // Legacy saves predate the Rivendel gate. Default the new flags to
    // false so every player goes through the unlock flow once; visiting
    // Rivendel (a rest zone) is a quick, lossless tap on the map.
    const forgeUnlocked = parsed.forgeUnlocked ?? false;
    const forgeSeen = parsed.forgeSeen ?? false;

    return {
      ...base,
      ...parsed,
      semiBossDefeated: parsed.semiBossDefeated ?? {},
      questsAccepted,
      upgrades: parsed.upgrades ?? {},
      forgeUnlocked,
      forgeSeen,
      // Boss fights are real-time: a save mid-fight would carry a stale
      // deadline. Always reset on load.
      bossFight: null,
      clickDmg: calcClickDamage({
        level: parsed.level ?? base.level,
        equipped: parsed.equipped ?? base.equipped,
        upgrades: parsed.upgrades ?? {},
      }),
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
