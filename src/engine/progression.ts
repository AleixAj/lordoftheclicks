import { LOCATIONS, QUESTS } from '@/data';
import type { GameState, LocationId, QuestId } from '@/types/game';

export function unlockNextLocation(unlockedLocs: LocationId[], locIdx: number): LocationId[] {
  const nextLoc = LOCATIONS[locIdx + 1];
  if (!nextLoc || unlockedLocs.includes(nextLoc.id)) return unlockedLocs;
  return [...unlockedLocs, nextLoc.id];
}

export function updateReachQuestProgress(
  questProgress: Record<QuestId, number>,
  questsDone: QuestId[],
  unlockedLocs: LocationId[],
): Record<QuestId, number> {
  let changed = false;
  const next = { ...questProgress };
  for (const q of QUESTS) {
    if (questsDone.includes(q.id)) continue;
    if (q.type === 'reach' && unlockedLocs.includes(q.loc) && next[q.id] !== 1) {
      next[q.id] = 1;
      changed = true;
    }
  }
  return changed ? next : questProgress;
}

export function unlockCompanionsForLocations(state: GameState): GameState {
  const comps = { ...state.companions };
  let changed = false;
  for (const locId of state.unlockedLocs) {
    const l = LOCATIONS.find((x) => x.id === locId);
    if (!l?.companions) continue;
    for (const cid of l.companions) {
      if (!comps[cid]) {
        comps[cid] = { unlocked: true, level: 1 };
        changed = true;
      }
    }
  }
  return changed ? { ...state, companions: comps } : state;
}
