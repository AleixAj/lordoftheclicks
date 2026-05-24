import { LOCATIONS, QUESTS } from '@/data';
import type { CompanionId, CompanionState, GameState } from '@/types/game';
import { calcClickDamage } from './formulas';
import { spawnFromPool, spawnInitial } from './spawn';

// v11: fixed visitedLocs migration — old v10 saves incorrectly populated
// visitedLocs from unlockedLocs, which caused reach quests to complete the
// moment a gate was unlocked rather than when the player physically traveled
// there. When migrating from v10 we always reset visitedLocs to ['comarca'].
const SAVE_KEY = 'lotc_save_v11';
const LEGACY_KEY = 'lotc_save_v10';

/** True when localStorage already holds a save for this profile. */
export function hasExistingSave(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.localStorage.getItem(SAVE_KEY) != null || window.localStorage.getItem(LEGACY_KEY) != null
  );
}

/** Rehydrate companion ranks from older/partial save snapshots. */
function normalizeCompanions(
  raw: Partial<Record<CompanionId, Partial<CompanionState>>> | undefined,
): Record<CompanionId, CompanionState> {
  if (!raw) return {};
  const out: Record<CompanionId, CompanionState> = {};
  for (const [id, cs] of Object.entries(raw)) {
    if (!cs?.unlocked) continue;
    const level = typeof cs.level === 'number' && cs.level > 0 ? cs.level : 1;
    out[id as CompanionId] = { unlocked: true, level };
  }
  return out;
}

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
    visitedLocs: ['comarca'],
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
  const rawV11 = window.localStorage.getItem(SAVE_KEY);
  const rawV10 = rawV11 == null ? window.localStorage.getItem(LEGACY_KEY) : null;
  const saved = rawV11 ?? rawV10;
  // Flag used below to reset the buggy visitedLocs field that the v10
  // migration introduced by copying it wholesale from unlockedLocs.
  const isV10Migration = rawV11 == null && rawV10 != null;
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

    const locIdx = parsed.locIdx ?? base.locIdx;
    const loc = LOCATIONS[locIdx];
    let enemy = parsed.enemy ?? base.enemy;
    // Mid-fight saves clear bossFight but may still carry a semi/boss sprite.
    // Respawn a pool mob so the player isn't stuck on an elite with no timer.
    if (
      enemy &&
      (enemy.tier === 'semi' || enemy.tier === 'boss') &&
      loc &&
      !loc.isRest &&
      loc.enemies.length > 0
    ) {
      enemy = spawnFromPool(loc);
    }

    // v10 migration: reconstruct visitedLocs from locIdx (the player must have
    // physically traveled through every zone up to their current position since
    // the world map is strictly linear). This is more accurate than ['comarca']
    // for players already deep into the game, and more accurate than copying
    // unlockedLocs which included gate-unlocked zones that were never visited.
    const visitedLocs = isV10Migration
      ? LOCATIONS.slice(0, locIdx + 1).map((l) => l.id)
      : (parsed.visitedLocs ?? ['comarca']);

    // v10 migration: the old code incorrectly set questProgress for reach
    // quests when a gate was unlocked (recruiting companions), not on travel.
    // Reset any reach quest that is not yet claimed AND whose target is not in
    // the reconstructed visitedLocs, so it is re-earned by actual travel.
    const parsedQuestProgress = { ...(parsed.questProgress ?? {}) };
    if (isV10Migration) {
      const claimedSet = new Set(parsed.questsDone ?? []);
      for (const q of QUESTS) {
        if (q.type === 'reach' && !visitedLocs.includes(q.loc) && !claimedSet.has(q.id)) {
          parsedQuestProgress[q.id] = 0;
        }
      }
    }

    return {
      ...base,
      ...parsed,
      locIdx,
      enemy,
      companions: normalizeCompanions(parsed.companions),
      semiBossDefeated: parsed.semiBossDefeated ?? {},
      questsAccepted,
      upgrades: parsed.upgrades ?? {},
      forgeUnlocked,
      forgeSeen,
      visitedLocs,
      questProgress: parsedQuestProgress,
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
  window.localStorage.removeItem(LEGACY_KEY);
}
