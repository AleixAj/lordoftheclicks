import { describe, expect, it } from 'vitest';
import { dealDamage } from '../combat';
import { spawnBoss, spawnInitial, spawnSemiBoss } from '../spawn';
import { ENEMIES, LOCATIONS } from '@/data';
import type { BossFightState, GameState } from '@/types/game';

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
    bossFight: null,
    companions: {},
    equipped: { weapon: null, armor: null, accessory: null },
    owned: [],
    locKills: {},
    totalKills: 0,
    unlockedLocs: [LOCATIONS[locIdx].id],
    bossDefeated: {},
    semiBossDefeated: {},
    questProgress: {},
    questsDone: [],
    questsAccepted: [],
  };
}

function makeBossFight(tier: 'semi' | 'boss', locId: string): BossFightState {
  const now = Date.now();
  return { tier, locId, startedAt: now, deadlineMs: now + 30_000 };
}

describe('combat.dealDamage', () => {
  it('reduces enemy hp without killing if damage is small', () => {
    const before = freshState();
    const enemyHpBefore = before.enemy!.hp;
    const after = dealDamage(before, 1);
    expect(after.enemy!.hp).toBe(enemyHpBefore - 1);
    expect(after.totalKills).toBe(0);
  });

  it('enemy instances carry their enemy type for equipment bonuses', () => {
    const before = freshState();
    expect(before.enemy!.enemyType).toBe(ENEMIES[before.enemy!.id].enemyType);
  });

  it('spawns a new pool enemy and awards gold/xp on a pool kill', () => {
    const before = freshState();
    const overkill = before.enemy!.hp + 50;
    const after = dealDamage(before, overkill, () => 0);
    expect(after.totalKills).toBe(1);
    expect(after.gold).toBeGreaterThan(0);
    expect(after.xp).toBeGreaterThanOrEqual(0);
    expect(after.enemy).not.toBeNull();
    expect(after.bossFight).toBeNull();
  });

  it('does NOT unlock the next location simply by reaching killsNeeded with pool mobs', () => {
    let state = freshState(COMBAT_IDX);
    const killsNeeded = LOCATIONS[COMBAT_IDX].killsNeeded;
    for (let i = 0; i < killsNeeded; i++) {
      state = dealDamage(state, state.enemy!.hp + 999, () => 0);
    }
    expect(state.unlockedLocs).not.toContain(LOCATIONS[COMBAT_IDX + 1].id);
  });

  it('does not increment locKills when the active enemy is a boss fight', () => {
    const loc = LOCATIONS[COMBAT_IDX];
    if (!loc.semiBoss) return;
    const semi = spawnSemiBoss(loc, () => 0);
    expect(semi).not.toBeNull();

    const before: GameState = {
      ...freshState(COMBAT_IDX),
      enemy: semi!,
      bossFight: makeBossFight('semi', loc.id),
    };
    const after = dealDamage(before, semi!.hp + 999, () => 0);

    expect(after.totalKills).toBe(0);
    expect(after.locKills[loc.id] ?? 0).toBe(0);
    expect(after.semiBossDefeated[loc.id]).toBe(true);
    expect(after.bossFight).toBeNull();
    // After the semi-boss falls a fresh pool mob takes over.
    expect(after.enemy).not.toBeNull();
    expect(after.enemy!.tier).toBe('normal');
  });

  it('defeating the zone boss unlocks the next location and clears the fight', () => {
    const loc = LOCATIONS[COMBAT_IDX];
    if (!loc.boss) return;
    const boss = spawnBoss(loc, () => 0);
    expect(boss).not.toBeNull();

    const before: GameState = {
      ...freshState(COMBAT_IDX),
      enemy: boss!,
      bossFight: makeBossFight('boss', loc.id),
    };
    const after = dealDamage(before, boss!.hp + 999, () => 0);

    expect(after.bossDefeated[loc.id]).toBe(true);
    expect(after.unlockedLocs).toContain(LOCATIONS[COMBAT_IDX + 1].id);
    expect(after.bossFight).toBeNull();
    expect(ENEMIES[boss!.id]).toBeDefined();
  });
});
