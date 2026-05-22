import { describe, expect, it } from 'vitest';
import {
  isUnlockGateMet,
  unlockNextLocation,
  updateReachQuestProgress,
} from '../progression';
import { LOCATIONS, QUESTS } from '@/data';

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

  it('updateReachQuestProgress completes accepted reach quests for unlocked locations', () => {
    // Pick any defined `reach` quest dynamically so the test stays valid as
    // content evolves (quest ids and target locations may shift over time).
    const reachQuest = QUESTS.find((q) => q.type === 'reach');
    expect(reachQuest, 'expected at least one reach quest in content').toBeDefined();
    const result = updateReachQuestProgress({}, [], [reachQuest!.loc], [reachQuest!.id]);
    expect(result[reachQuest!.id]).toBe(1);
  });

  it('updateReachQuestProgress ignores reach quests the player has not accepted', () => {
    const reachQuest = QUESTS.find((q) => q.type === 'reach');
    expect(reachQuest).toBeDefined();
    const result = updateReachQuestProgress({}, [], [reachQuest!.loc], []);
    expect(result[reachQuest!.id]).toBeUndefined();
  });

  it('isUnlockGateMet returns true only when every gate companion is unlocked', () => {
    const gate = ['frodo', 'sam'] as const;
    expect(isUnlockGateMet(gate, {})).toBe(false);
    expect(isUnlockGateMet(gate, { frodo: { unlocked: true, level: 1 } })).toBe(false);
    expect(
      isUnlockGateMet(gate, {
        frodo: { unlocked: true, level: 1 },
        sam: { unlocked: true, level: 1 },
      }),
    ).toBe(true);
    // An unlocked: false companion should NOT satisfy the gate.
    expect(
      isUnlockGateMet(gate, {
        frodo: { unlocked: true, level: 1 },
        sam: { unlocked: false, level: 1 },
      }),
    ).toBe(false);
    // Undefined/empty gate is treated as never met.
    expect(isUnlockGateMet(undefined, {})).toBe(false);
    expect(isUnlockGateMet([], {})).toBe(false);
  });
});
