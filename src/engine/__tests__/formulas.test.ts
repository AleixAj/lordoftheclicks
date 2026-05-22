import { describe, expect, it } from 'vitest';
import {
  applyLevelUps,
  calcClickDamage,
  calcClickDamageAgainstEnemy,
  calcDps,
  calcDpsAgainstEnemy,
  calcEnemyTypeMultiplier,
  companionUpgradeCost,
  xpForLevel,
} from '../formulas';
import type { GameState } from '@/types/game';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    locIdx: 0,
    gold: 0,
    mithril: 0,
    xp: 0,
    level: 1,
    clickDmg: 2,
    enemy: null,
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
    ...overrides,
  };
}

describe('formulas', () => {
  it('xpForLevel grows monotonically', () => {
    expect(xpForLevel(1)).toBeLessThan(xpForLevel(2));
    expect(xpForLevel(2)).toBeLessThan(xpForLevel(5));
  });

  it('companionUpgradeCost grows exponentially', () => {
    expect(companionUpgradeCost(1)).toBe(15);
    expect(companionUpgradeCost(2)).toBeGreaterThan(companionUpgradeCost(1));
  });

  it('calcClickDamage adds weapon and accessory bonuses', () => {
    const base = calcClickDamage(makeState({ level: 5 }));
    expect(base).toBe(6);

    const withWeapon = calcClickDamage(
      makeState({ level: 5, equipped: { weapon: 'anduril', armor: null, accessory: null } }),
    );
    expect(withWeapon).toBeGreaterThan(base);

    const withBoth = calcClickDamage(
      makeState({ level: 5, equipped: { weapon: 'anduril', armor: null, accessory: 'palantir' } }),
    );
    expect(withBoth).toBeGreaterThan(withWeapon);
  });

  it('calcDps sums companion DPS scaled by level', () => {
    const state = makeState({
      companions: {
        frodo: { unlocked: true, level: 3 },
        sam: { unlocked: true, level: 2 },
      },
    });
    expect(calcDps(state)).toBeGreaterThan(0);
  });

  it('calcEnemyTypeMultiplier sums equipped percentage bonuses', () => {
    const state = makeState({
      equipped: { weapon: 'dardo', armor: null, accessory: 'lembas' },
    });

    expect(calcEnemyTypeMultiplier(state.equipped, 'orco')).toBeCloseTo(1.5);
    expect(calcEnemyTypeMultiplier(state.equipped, 'espectro')).toBeCloseTo(1.15);
  });

  it('applies enemy type bonuses to click and DPS damage', () => {
    const state = makeState({
      level: 5,
      equipped: { weapon: 'dardo', armor: null, accessory: null },
      companions: { frodo: { unlocked: true, level: 2 } },
    });
    const enemy = {
      id: 'trasgo',
      name: 'Trasgo',
      hp: 100,
      maxHp: 100,
      enemyType: 'orco' as const,
      tier: 'normal' as const,
      isBoss: false,
    };

    expect(calcClickDamageAgainstEnemy(state, enemy)).toBeGreaterThan(calcClickDamage(state));
    expect(calcDpsAgainstEnemy(state, enemy)).toBeGreaterThan(calcDps(state));
  });

  it('applyLevelUps consumes xp and increments level', () => {
    const result = applyLevelUps(1000, 1);
    expect(result.level).toBeGreaterThan(1);
    expect(result.xp).toBeLessThan(xpForLevel(result.level));
  });
});
