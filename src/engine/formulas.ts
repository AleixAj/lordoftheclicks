/**
 * Pure calculation helpers shared across the engine and the UI.
 * Keeping them isolated makes them trivially unit-testable.
 */
import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS } from '@/data';
import { COMPANIONS } from '@/data/companions';
import type { EnemyInstance, EnemyType, EquippedItems, GameState, ShopItem } from '@/types/game';

const ENEMY_TYPE_MULTIPLIER_CAP = 2.35;

export function xpForLevel(level: number): number {
  return Math.floor(20 * Math.pow(1.6, level - 1));
}

export function companionUpgradeCost(companionLevel: number): number {
  return Math.floor(15 * Math.pow(1.4, companionLevel - 1));
}

export function calcClickDamage(state: Pick<GameState, 'level' | 'equipped'>): number {
  let dmg = 1 + state.level;
  if (state.equipped.weapon) {
    const w = SHOP_WEAPONS.find((x) => x.id === state.equipped.weapon);
    if (w?.dmg) dmg += w.dmg;
  }
  if (state.equipped.accessory) {
    const a = SHOP_ACCESS.find((x) => x.id === state.equipped.accessory);
    if (a?.bonus) dmg += a.bonus;
  }
  return dmg;
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
  enemyType: EnemyType,
): number {
  const bonus = getEquippedItems(equipped).reduce(
    (sum, item) => sum + (item.bonusVs?.[enemyType] ?? 0),
    0,
  );
  return Math.min(1 + bonus, ENEMY_TYPE_MULTIPLIER_CAP);
}

export function calcActiveEnemyTypeBonusPct(
  equipped: EquippedItems,
  enemyType: EnemyType,
): number {
  return Math.round((calcEnemyTypeMultiplier(equipped, enemyType) - 1) * 100);
}

export function calcClickDamageAgainstEnemy(
  state: Pick<GameState, 'level' | 'equipped'>,
  enemy: Pick<EnemyInstance, 'enemyType'>,
): number {
  return calcClickDamage(state) * calcEnemyTypeMultiplier(state.equipped, enemy.enemyType);
}

export function calcDps(state: Pick<GameState, 'companions' | 'equipped'>): number {
  let dps = 0;
  for (const c of COMPANIONS) {
    const cs = state.companions[c.id];
    if (cs?.unlocked) dps += c.baseDps * cs.level;
  }
  if (state.equipped.armor) {
    const a = SHOP_ARMOR.find((x) => x.id === state.equipped.armor);
    if (a?.def) dps += a.def;
  }
  return dps;
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
