/**
 * Pure calculation helpers shared across the engine and the UI.
 * Keeping them isolated makes them trivially unit-testable.
 */
import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS, UPGRADES } from '@/data';
import { COMPANIONS } from '@/data/companions';
import type {
  EnemyInstance,
  EnemyTier,
  EnemyType,
  EquippedItems,
  GameState,
  ShopItem,
  UpgradeEffect,
  UpgradeId,
} from '@/types/game';

const ENEMY_TYPE_MULTIPLIER_CAP = 2.35;

export function xpForLevel(level: number): number {
  return Math.floor(20 * Math.pow(1.6, level - 1));
}

export function upgradeRank(
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  id: UpgradeId,
): number {
  return upgrades?.[id] ?? 0;
}

export function upgradeCost(id: UpgradeId, rank: number): number {
  const upgrade = UPGRADES.find((candidate) => candidate.id === id);
  if (!upgrade) return Infinity;
  return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costGrowth, rank));
}

export function upgradeEffectValue(
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  effect: UpgradeEffect,
): number {
  return UPGRADES.filter((upgrade) => upgrade.effect === effect).reduce(
    (sum, upgrade) => sum + upgradeRank(upgrades, upgrade.id) * upgrade.valuePerRank,
    0,
  );
}

export function companionUpgradeCost(
  companionLevel: number,
  upgrades?: Partial<Record<UpgradeId, number>>,
): number {
  const base = Math.floor(15 * Math.pow(1.4, companionLevel - 1));
  const reduction = Math.max(-0.5, upgradeEffectValue(upgrades, 'companion_cost_pct'));
  return Math.max(1, Math.floor(base * (1 + reduction)));
}

export function calcClickDamage(
  state: Pick<GameState, 'level' | 'equipped'> & Partial<Pick<GameState, 'upgrades'>>,
): number {
  let dmg = 1 + state.level;
  if (state.equipped.weapon) {
    const w = SHOP_WEAPONS.find((x) => x.id === state.equipped.weapon);
    if (w?.dmg) dmg += w.dmg;
  }
  if (state.equipped.accessory) {
    const a = SHOP_ACCESS.find((x) => x.id === state.equipped.accessory);
    if (a?.bonus) dmg += a.bonus;
  }
  return dmg * (1 + upgradeEffectValue(state.upgrades, 'click_damage_pct'));
}

export function getEquippedItems(equipped: EquippedItems): ShopItem[] {
  const items: ShopItem[] = [];
  if (equipped.weapon) {
    const item = SHOP_WEAPONS.find((x) => x.id === equipped.weapon);
    if (item) items.push(item);
  }
  if (equipped.armor) {
    const item = SHOP_ARMOR.find((x) => x.id === equipped.armor);
    if (item) items.push(item);
  }
  if (equipped.accessory) {
    const item = SHOP_ACCESS.find((x) => x.id === equipped.accessory);
    if (item) items.push(item);
  }
  return items;
}

export function calcEnemyTypeMultiplier(
  equipped: EquippedItems,
  enemyType: EnemyType | undefined,
): number {
  if (!enemyType) return 1;
  const bonus = getEquippedItems(equipped).reduce(
    (sum, item) => sum + (item.bonusVs?.[enemyType] ?? 0),
    0,
  );
  return Math.min(1 + bonus, ENEMY_TYPE_MULTIPLIER_CAP);
}

export function calcActiveEnemyTypeBonusPct(
  equipped: EquippedItems,
  enemyType: EnemyType | undefined,
): number {
  return Math.round((calcEnemyTypeMultiplier(equipped, enemyType) - 1) * 100);
}

export function calcClickDamageAgainstEnemy(
  state: Pick<GameState, 'level' | 'equipped'> & Partial<Pick<GameState, 'upgrades'>>,
  enemy: Pick<EnemyInstance, 'enemyType'>,
): number {
  return calcClickDamage(state) * calcEnemyTypeMultiplier(state.equipped, enemy.enemyType);
}

export function calcDps(state: Pick<GameState, 'companions'>): number {
  let dps = 0;
  for (const c of COMPANIONS) {
    const cs = state.companions[c.id];
    if (cs?.unlocked) dps += c.baseDps * cs.level;
  }
  return dps;
}

/** +1 second on semi/boss fights per this many points of armor `def` in item data. */
export const ARMOR_DEF_PER_FIGHT_SECOND = 5;

/** Extra seconds on timed semi/boss fights from equipped armor. */
export function armorFightTimeBonusS(equipped: EquippedItems): number {
  if (!equipped.armor) return 0;
  const armor = SHOP_ARMOR.find((x) => x.id === equipped.armor);
  if (!armor?.def) return 0;
  return Math.floor(armor.def / ARMOR_DEF_PER_FIGHT_SECOND);
}

export function calcDpsAgainstEnemy(
  state: Pick<GameState, 'companions' | 'equipped'>,
  enemy: Pick<EnemyInstance, 'enemyType'>,
): number {
  return calcDps(state) * calcEnemyTypeMultiplier(state.equipped, enemy.enemyType);
}

export function applyLevelUps(xp: number, level: number): { xp: number; level: number } {
  let nextXp = xp;
  let nextLevel = level;
  while (nextXp >= xpForLevel(nextLevel)) {
    nextXp -= xpForLevel(nextLevel);
    nextLevel++;
  }
  return { xp: nextXp, level: nextLevel };
}

export function applyRewardMultiplier(
  amount: number,
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  effect: 'gold_pct' | 'xp_pct',
): number {
  return Math.max(0, Math.floor(amount * (1 + upgradeEffectValue(upgrades, effect))));
}

export function mithrilRewardForTier(
  tier: EnemyTier,
  locIdx: number,
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  firstClear: boolean,
): number {
  if (tier === 'normal') return 0;
  const progress = Math.max(0, locIdx);
  const base = tier === 'boss' ? 4 + Math.floor(progress / 2) : 2 + Math.floor(progress / 4);
  const firstClearBonus = firstClear ? (tier === 'boss' ? 2 : 1) : 0;
  const forgeBonus = upgradeEffectValue(upgrades, 'mithril_flat');
  return Math.max(0, Math.round(base + firstClearBonus + forgeBonus));
}
