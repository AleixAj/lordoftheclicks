import { describe, expect, it } from 'vitest';
import { dealDamage } from '../combat';
import { spawnInitial } from '../spawn';
import { LOCATIONS } from '@/data';
import type { GameState } from '@/types/game';

/**
 * Pick the first location that actually spawns enemies — rest locations
 * (e.g. La Comarca / Rivendel) are skipped to keep tests resilient to
 * content tweaks at the start of the journey.
 */
const COMBAT_IDX = LOCATIONS.findIndex((l) => !l.isRest && l.enemies.length > 0);

function freshState(locIdx = COMBAT_IDX): GameState {
  return {
    locIdx,
    gold: 0,
    mithril: 0,
    xp: 0,
    level: 1,
    clickDmg: 2,
    enemy: spawnInitial(locIdx, () => 0),
    companions: {},
    equipped: { weapon: null, armor: null, accessory: null },
    owned: [],
    locKills: {},
    totalKills: 0,
    unlockedLocs: [LOCATIONS[locIdx].id],
    bossDefeated: {},
    questProgress: {},
    questsDone: [],
  };
}

describe('combat.dealDamage', () => {
  it('reduces enemy hp without killing if damage is small', () => {
    const before = freshState();
    const enemyHpBefore = before.enemy!.hp;
    const after = dealDamage(before, 1);
    expect(after.enemy!.hp).toBe(enemyHpBefore - 1);
    expect(after.totalKills).toBe(0);
  });

  it('spawns a new enemy and awards gold/xp on kill', () => {
    const before = freshState();
    const overkill = before.enemy!.hp + 50;
    const after = dealDamage(before, overkill, () => 0);
    expect(after.totalKills).toBe(1);
    expect(after.gold).toBeGreaterThan(0);
    expect(after.xp).toBeGreaterThanOrEqual(0);
    expect(after.enemy).not.toBeNull();
  });

  it('unlocks next location once killsNeeded is reached', () => {
    let state = freshState(COMBAT_IDX);
    const killsNeeded = LOCATIONS[COMBAT_IDX].killsNeeded;
    for (let i = 0; i < killsNeeded; i++) {
      state = dealDamage(state, state.enemy!.hp + 999, () => 0);
    }
    expect(state.unlockedLocs).toContain(LOCATIONS[COMBAT_IDX + 1].id);
  });
});
