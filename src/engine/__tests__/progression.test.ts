import { describe, expect, it } from 'vitest';
import {
  unlockCompanionsForLocations,
  unlockNextLocation,
  updateReachQuestProgress,
} from '../progression';
import { LOCATIONS } from '@/data';
import type { GameState } from '@/types/game';

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    locIdx: 0,
    gold: 0,
    mithril: 0,
    xp: 0,
    level: 1,
    clickDmg: 2,
    enemy: null,
    companions: {},
    equipped: { weapon: null, armor: null, accessory: null },
    owned: [],
    locKills: {},
    totalKills: 0,
    unlockedLocs: ['comarca'],
    bossDefeated: {},
    questProgress: {},
    questsDone: [],
    ...overrides,
  };
}

describe('progression', () => {
  it('unlockNextLocation adds the next location id', () => {
    const next = unlockNextLocation(['comarca'], 0);
    expect(next).toContain(LOCATIONS[1].id);
  });

  it('unlockNextLocation is idempotent', () => {
    const initial = ['comarca', LOCATIONS[1].id];
    const next = unlockNextLocation(initial, 0);
    expect(next).toBe(initial);
  });

  it('updateReachQuestProgress completes reach quests for unlocked locations', () => {
    const result = updateReachQuestProgress(
      {},
      [],
      ['comarca', 'bree', 'cima_vientos', 'rivendel'],
    );
    expect(result.q5).toBe(1);
  });

  it('unlockCompanionsForLocations grants companions from visited locations', () => {
    const result = unlockCompanionsForLocations(state({ unlockedLocs: ['comarca'] }));
    expect(result.companions.frodo).toEqual({ unlocked: true, level: 1 });
    expect(result.companions.sam).toEqual({ unlocked: true, level: 1 });
  });
});
