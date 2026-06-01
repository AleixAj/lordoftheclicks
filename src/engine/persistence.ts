/**
 * Save layer.
 *
 * Persistence strategy:
 *  - Auto-save is debounced and triggered by `useGameLoop` whenever
 *    `state` changes (see hook).
 *  - The active schema is keyed by `SAVE_KEY`. When the shape of
 *    `GameState` changes in a way that requires a migration, bump the
 *    version in the key (e.g. `lotc_save_v11` → `lotc_save_v12`) and
 *    handle the legacy key inside `loadGame`.
 *  - `loadGame` is forgiving: missing fields fall back to defaults and
 *    parse errors return a fresh state rather than wiping the player's
 *    progress mid-session.
 *
 * Manual export/import:
 *  - The player can download a base64-wrapped backup and reimport it
 *    later. The wrapper records `app`, `fileVersion` and the original
 *    `SAVE_KEY` so future builds can recognise (and migrate) old files.
 */
import { ENEMIES, LOCATIONS, QUESTS } from '@/data';
import type { CompanionId, CompanionState, GameState } from '@/types/game';
import { calcClickDamage } from './formulas';
import { spawnFromPool, spawnInitial } from './spawn';

// v11: fixed visitedLocs migration — old v10 saves incorrectly populated
// visitedLocs from unlockedLocs, which caused reach quests to complete the
// moment a gate was unlocked rather than when the player physically traveled
// there. When migrating from v10 we always reset visitedLocs to ['comarca'].
const SAVE_KEY = 'lotc_save_v11';
const LEGACY_KEY = 'lotc_save_v10';
const SAVE_FILE_APP = 'lord-of-the-clicks';
const SAVE_FILE_VERSION = 1;

interface SaveBackupFile {
  app: typeof SAVE_FILE_APP;
  fileVersion: typeof SAVE_FILE_VERSION;
  saveKey: typeof SAVE_KEY;
  exportedAt: string;
  state: GameState;
}

// btoa/atob only handle Latin-1, so we round-trip through TextEncoder to
// keep accented characters (Khamûl, Mûmakil, Grishnákh…) intact in the
// downloadable save file.
function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = window.atob(value.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Filesystem-safe timestamp (drops `:` so Windows accepts the file name).
function saveFileName(): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `lord-of-the-clicks-save-${stamp}.txt`;
}

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

/** Fresh save with the opening enemy already spawned in La Comarca. */
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

/**
 * Reads the persisted state and applies migrations. Never throws:
 * malformed JSON or missing keys fall back to a brand-new save so a
 * single bad write can't soft-lock the player out of the game.
 */
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
    // Stale id from legacy saves (e.g. enemy renamed in code). Respawn from
    // the current zone pool so combat lookups in ENEMIES don't return undefined.
    if (enemy && !ENEMIES[enemy.id] && loc && !loc.isRest && loc.enemies.length > 0) {
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

/** Writes the current state under the active `SAVE_KEY`. SSR-safe (no-op on the server). */
export function saveGame(state: GameState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

/**
 * Triggers a browser download of the current state wrapped in a small
 * envelope (`app`, `fileVersion`, `saveKey`, `exportedAt`). The wrapper
 * lets future builds recognise the file even after the SAVE_KEY bumps.
 */
export function downloadSaveFile(state: GameState): void {
  if (typeof window === 'undefined') return;
  const backup: SaveBackupFile = {
    app: SAVE_FILE_APP,
    fileVersion: SAVE_FILE_VERSION,
    saveKey: SAVE_KEY,
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([encodeBase64(JSON.stringify(backup))], {
    type: 'text/plain;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = saveFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Restores a save from a user-provided backup file. Throws on any
 * mismatch (wrong app marker, malformed payload) so the caller can
 * surface a user-friendly error instead of silently corrupting the save.
 */
export async function importSaveFile(file: File): Promise<void> {
  if (typeof window === 'undefined') return;
  const raw = await file.text();
  const decoded = decodeBase64(raw);
  const parsed = JSON.parse(decoded) as Partial<SaveBackupFile>;
  if (parsed.app !== SAVE_FILE_APP || !parsed.state || typeof parsed.state !== 'object') {
    throw new Error('Invalid save file');
  }
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(parsed.state));
  window.localStorage.removeItem(LEGACY_KEY);
}

/** Wipes both the current and legacy save keys. Used by `resetGame`. */
export function resetSave(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SAVE_KEY);
  window.localStorage.removeItem(LEGACY_KEY);
}
