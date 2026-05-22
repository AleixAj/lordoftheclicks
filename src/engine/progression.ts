import { LOCATIONS, QUESTS } from '@/data';
import type {
  CompanionId,
  CompanionState,
  Location,
  LocationId,
  QuestId,
} from '@/types/game';

const DEFAULT_SEMI_TIME_LIMIT_S = 30;
const DEFAULT_BOSS_TIME_LIMIT_S = 60;

/** Pool kills the player must reach in a zone before the semi-boss button unlocks. */
export function semiBossKillThreshold(loc: Location): number {
  return loc.semiBossAt ?? Math.floor(loc.killsNeeded / 2);
}

/** Pool kills required (with the semi-boss already defeated) before the boss button unlocks. */
export function bossKillThreshold(loc: Location): number {
  return loc.bossAt ?? loc.killsNeeded;
}

/** Time limit (in seconds) for a semi-boss or boss encounter. */
export function fightTimeLimitS(loc: Location, tier: 'semi' | 'boss'): number {
  if (tier === 'semi') return loc.semiBossTimeLimit ?? DEFAULT_SEMI_TIME_LIMIT_S;
  return loc.bossTimeLimit ?? DEFAULT_BOSS_TIME_LIMIT_S;
}

export function unlockNextLocation(unlockedLocs: LocationId[], locIdx: number): LocationId[] {
  const nextLoc = LOCATIONS[locIdx + 1];
  if (!nextLoc || unlockedLocs.includes(nextLoc.id)) return unlockedLocs;
  return [...unlockedLocs, nextLoc.id];
}

export function updateReachQuestProgress(
  questProgress: Record<QuestId, number>,
  questsDone: QuestId[],
  unlockedLocs: LocationId[],
  questsAccepted: readonly QuestId[],
): Record<QuestId, number> {
  let changed = false;
  const next = { ...questProgress };
  for (const q of QUESTS) {
    if (questsDone.includes(q.id)) continue;
    // Only accepted quests track progress.
    if (!questsAccepted.includes(q.id)) continue;
    if (q.type === 'reach' && unlockedLocs.includes(q.loc) && next[q.id] !== 1) {
      next[q.id] = 1;
      changed = true;
    }
  }
  return changed ? next : questProgress;
}

/**
 * A rest-zone "unlock gate" is met when every companion listed in
 * `loc.unlockGate` has been recruited. Used to gate progression behind
 * meaningful recruitment milestones (e.g. La Comarca → Bosque Viejo
 * requires Frodo + Sam).
 */
export function isUnlockGateMet(
  gate: readonly CompanionId[] | undefined,
  companions: Record<CompanionId, CompanionState>,
): boolean {
  if (!gate || gate.length === 0) return false;
  return gate.every((id) => companions[id]?.unlocked);
}
