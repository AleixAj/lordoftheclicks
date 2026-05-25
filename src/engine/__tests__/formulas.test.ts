import { describe, expect, it } from 'vitest';
import {
  applyLevelUps,
  applyRewardMultiplier,
  armorFightTimeBonusS,
  calcClickDamage,
  calcClickDamageAgainstEnemy,
  calcDps,
  calcDpsAgainstEnemy,
  calcEnemyTypeMultiplier,
  companionUpgradeCost,
  mithrilRewardForTier,
  upgradeCost,
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
    visitedLocs: ['comarca'],
    bossDefeated: {},
    semiBossDefeated: {},
    questProgress: {},
    questsDone: [],
    questsAccepted: [],
    upgrades: {},
    forgeUnlocked: false,
    forgeSeen: false,
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

  it('forge upgrades affect click damage and companion costs', () => {
    const base = makeState({ level: 5 });
    const upgraded = makeState({ level: 5, upgrades: { golpe_elfico: 2, forja_ligera: 2 } });
    expect(calcClickDamage(upgraded)).toBeGreaterThan(calcClickDamage(base));
    expect(companionUpgradeCost(5, upgraded.upgrades)).toBeLessThan(companionUpgradeCost(5));
  });

  it('mithril rewards only apply to semi-bosses and bosses', () => {
    expect(mithrilRewardForTier('normal', 10, {}, true)).toBe(0);
    expect(mithrilRewardForTier('semi', 10, {}, true)).toBeGreaterThan(0);
    expect(mithrilRewardForTier('boss', 10, {}, true)).toBeGreaterThan(
      mithrilRewardForTier('semi', 10, {}, true),
    );
    expect(upgradeCost('golpe_elfico', 0)).toBeGreaterThan(0);
  });

  it('calcClickDamage adds weapon and accessory bonuses', () => {
    const base = calcClickDamage(makeState({ level: 5 }));
    expect(base).toBe(6);

    const withWeapon = calcClickDamage(
      makeState({ level: 5, equipped: { weapon: 'hadhafang', armor: null, accessory: null } }),
    );
    expect(withWeapon).toBeGreaterThan(base);

    const withBoth = calcClickDamage(
      makeState({
        level: 5,
        equipped: { weapon: 'hadhafang', armor: null, accessory: 'palantir' },
      }),
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

  it('calcDps ignores equipped armor', () => {
    const base = makeState({
      companions: { frodo: { unlocked: true, level: 2 } },
    });
    const withArmor = makeState({
      companions: { frodo: { unlocked: true, level: 2 } },
      equipped: { weapon: null, armor: 'capa_elfica', accessory: null },
      owned: ['capa_elfica'],
    });
    expect(calcDps(withArmor)).toBe(calcDps(base));
  });

  it('armorFightTimeBonusS adds 1s per 5 armor def', () => {
    expect(armorFightTimeBonusS({ weapon: null, armor: null, accessory: null })).toBe(0);
    expect(armorFightTimeBonusS({ weapon: null, armor: 'capa_elfica', accessory: null })).toBe(1);
    expect(armorFightTimeBonusS({ weapon: null, armor: 'armadura_negra', accessory: null })).toBe(
      5,
    );
  });

  it('calcEnemyTypeMultiplier sums equipped percentage bonuses', () => {
    const state = makeState({
      equipped: { weapon: 'dardo', armor: null, accessory: 'lembas' },
    });

    expect(calcEnemyTypeMultiplier(state.equipped, 'orco')).toBeCloseTo(1.4);
    expect(calcEnemyTypeMultiplier(state.equipped, 'espectro')).toBeCloseTo(1.25);
  });

  it('applies enemy type bonuses to click and DPS damage', () => {
    const state = makeState({
      level: 5,
      equipped: { weapon: 'dardo', armor: null, accessory: null },
      companions: { frodo: { unlocked: true, level: 2 } },
    });
    const enemy = {
      id: 'orco_moria',
      name: 'Orco',
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

  it('applyRewardMultiplier adds equipped item goldPct on top of upgrades', () => {
    const base = applyRewardMultiplier(100, {}, 'gold_pct');
    const withPipa = applyRewardMultiplier(100, {}, 'gold_pct', {
      weapon: null,
      armor: null,
      accessory: 'pipa_fumar',
    });
    expect(base).toBe(100);
    expect(withPipa).toBe(105);
  });

  it('applyRewardMultiplier ignores goldPct for xp_pct effect', () => {
    const xpWithPipa = applyRewardMultiplier(100, {}, 'xp_pct', {
      weapon: null,
      armor: null,
      accessory: 'pipa_fumar',
    });
    expect(xpWithPipa).toBe(100);
  });
});
