import { describe, expect, it } from 'vitest';
import {
  companionLevelCapForLocation,
  fightTimeLimitForFight,
  isUnlockGateMet,
  unlockNextLocation,
  updateReachQuestProgress,
} from '../progression';
import { LOCATIONS, QUESTS } from '@/data';

describe('progression', () => {
  it('fightTimeLimitForFight adds armor bonus to semi/boss timer', () => {
    const loc = LOCATIONS.find((l) => l.boss)!;
    const equipped = { weapon: null, armor: 'capa_elfica' as const, accessory: null };
    expect(fightTimeLimitForFight(loc, 'boss', equipped)).toBe(31);
    expect(fightTimeLimitForFight(loc, 'semi', equipped)).toBe(31);
  });

  it('caps companion training by adventure progress', () => {
    expect(companionLevelCapForLocation(0)).toBe(5);
    expect(companionLevelCapForLocation(2)).toBe(8);
    expect(companionLevelCapForLocation(4)).toBe(12);
    expect(companionLevelCapForLocation(9)).toBe(15);
    expect(companionLevelCapForLocation(13)).toBe(18);
    expect(companionLevelCapForLocation(18)).toBe(21);
    expect(companionLevelCapForLocation(23)).toBe(24);
    expect(companionLevelCapForLocation(28)).toBe(28);
    expect(companionLevelCapForLocation(32)).toBe(30);
  });

  it('keeps the previous companion cap before reaching the next milestone', () => {
    expect(companionLevelCapForLocation(1)).toBe(5);
    expect(companionLevelCapForLocation(3)).toBe(8);
    expect(companionLevelCapForLocation(8)).toBe(12);
    expect(companionLevelCapForLocation(12)).toBe(15);
    expect(companionLevelCapForLocation(17)).toBe(18);
  });

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
