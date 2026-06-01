/**
 * Pure calculation helpers shared between the engine and the UI.
 *
 * Every export here is a deterministic function of its arguments — no
 * `Date.now`, no `Math.random` (callers inject `rng` where needed), no
 * access to the store. This keeps the gameplay math trivially unit
 * testable (see `__tests__/formulas.test.ts`) and lets components reuse
 * the exact same formulas as the engine for previews (e.g. shop tooltips
 * showing "+15 daño click" before buying).
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

/**
 * Upper bound on `bonusVs` multipliers (e.g. +135% becomes the cap).
 * Prevents endgame stacking from trivialising whole zones once the
 * player owns multiple themed items.
 */
const ENEMY_TYPE_MULTIPLIER_CAP = 2.35;

/**
 * XP required to advance from `level` to `level + 1`. Exponential curve
 * (base × 1.6^(level−1)) so the early game flies by and late levels
 * pace the player against the rest of the progression.
 */
export function xpForLevel(level: number): number {
  return Math.floor(20 * Math.pow(1.6, level - 1));
}

/** Rank of a Forja upgrade in the current save (0 if never bought). */
export function upgradeRank(
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  id: UpgradeId,
): number {
  return upgrades?.[id] ?? 0;
}

/**
 * Mithril cost of the *next* rank of an upgrade. Geometric growth so
 * dumping mithril into a single branch isn't strictly optimal late game.
 * Returns `Infinity` for unknown ids so callers fail closed.
 */
export function upgradeCost(id: UpgradeId, rank: number): number {
  const upgrade = UPGRADES.find((candidate) => candidate.id === id);
  if (!upgrade) return Infinity;
  return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costGrowth, rank));
}

/**
 * Total bonus from every upgrade that targets a given `effect`. Each
 * upgrade contributes `rank × valuePerRank`. Used by formulas that
 * apply a single perk type (click damage, gold %, fight time…).
 */
export function upgradeEffectValue(
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  effect: UpgradeEffect,
): number {
  return UPGRADES.filter((upgrade) => upgrade.effect === effect).reduce(
    (sum, upgrade) => sum + upgradeRank(upgrades, upgrade.id) * upgrade.valuePerRank,
    0,
  );
}

/**
 * Gold cost to push a companion from `companionLevel` to the next level.
 * Forja can shave up to 50% off via `companion_cost_pct`; the floor of 1
 * ensures the action is never free even with extreme stacking.
 */
export function companionUpgradeCost(
  companionLevel: number,
  upgrades?: Partial<Record<UpgradeId, number>>,
): number {
  const base = Math.floor(15 * Math.pow(1.4, companionLevel - 1));
  const reduction = Math.max(-0.5, upgradeEffectValue(upgrades, 'companion_cost_pct'));
  return Math.max(1, Math.floor(base * (1 + reduction)));
}

/**
 * Click damage with NO enemy-type adjustments. Equals:
 *   (1 + level + weapon.dmg + accessory.bonus) × (1 + Forja click_damage_pct)
 */
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

/** Resolves the equipped item ids into their full `ShopItem` records. */
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

/**
 * Damage multiplier vs a given enemy type from stacked `bonusVs` perks.
 * Returns `1` for typeless enemies (final/unique foes like the Eye of
 * Sauron) and is clamped to `ENEMY_TYPE_MULTIPLIER_CAP`.
 */
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

/** Same as `calcEnemyTypeMultiplier` but expressed as a rounded percentage for UI labels. */
export function calcActiveEnemyTypeBonusPct(
  equipped: EquippedItems,
  enemyType: EnemyType | undefined,
): number {
  return Math.round((calcEnemyTypeMultiplier(equipped, enemyType) - 1) * 100);
}

/** Click damage scaled by the enemy-type multiplier; used by the actual hit pipeline. */
export function calcClickDamageAgainstEnemy(
  state: Pick<GameState, 'level' | 'equipped'> & Partial<Pick<GameState, 'upgrades'>>,
  enemy: Pick<EnemyInstance, 'enemyType'>,
): number {
  return calcClickDamage(state) * calcEnemyTypeMultiplier(state.equipped, enemy.enemyType);
}

/**
 * Total companion DPS (sum of `baseDps × level` for every unlocked ally).
 * Locked or zero-level companions contribute nothing. Defensive about
 * malformed save data: levels ≤ 0 are coerced to 1.
 */
export function calcDps(state: Pick<GameState, 'companions'>): number {
  let dps = 0;
  for (const c of COMPANIONS) {
    const cs = state.companions[c.id];
    if (!cs?.unlocked) continue;
    const level = typeof cs.level === 'number' && cs.level > 0 ? cs.level : 1;
    dps += c.baseDps * level;
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

/** Companion DPS adjusted by the equipment's anti-type multiplier. */
export function calcDpsAgainstEnemy(
  state: Pick<GameState, 'companions' | 'equipped'>,
  enemy: Pick<EnemyInstance, 'enemyType'>,
): number {
  return calcDps(state) * calcEnemyTypeMultiplier(state.equipped, enemy.enemyType);
}

/**
 * Consumes XP and advances levels until the remainder fits below the
 * threshold for the new level. Loop-based so a huge XP payload (e.g.
 * boss kill at low level) can yield multiple levels in one call.
 */
export function applyLevelUps(xp: number, level: number): { xp: number; level: number } {
  let nextXp = xp;
  let nextLevel = level;
  while (nextXp >= xpForLevel(nextLevel)) {
    nextXp -= xpForLevel(nextLevel);
    nextLevel++;
  }
  return { xp: nextXp, level: nextLevel };
}

/**
 * Sums an additive percentage perk (`goldPct`, ...) across all equipped
 * items. Returns 0 when nothing relevant is equipped so callers can safely
 * add it on top of Forja upgrades.
 */
export function equippedRewardBonus(equipped: EquippedItems | undefined, key: 'goldPct'): number {
  if (!equipped) return 0;
  return getEquippedItems(equipped).reduce((sum, item) => sum + (item[key] ?? 0), 0);
}

/**
 * Applies an additive reward modifier (Forja % + equipped item %) to a
 * base amount of gold or XP. Bonuses stack additively (not multiplicatively)
 * to keep stacking intuitive and capping easier.
 */
export function applyRewardMultiplier(
  amount: number,
  upgrades: Partial<Record<UpgradeId, number>> | undefined,
  effect: 'gold_pct' | 'xp_pct',
  equipped?: EquippedItems,
): number {
  const itemBonus = effect === 'gold_pct' ? equippedRewardBonus(equipped, 'goldPct') : 0;
  return Math.max(0, Math.floor(amount * (1 + upgradeEffectValue(upgrades, effect) + itemBonus)));
}

/**
 * Mithril dropped on a semi/boss kill. Scales with `locIdx` (deeper
 * zones drop more), doubles the first-clear bonus for bosses, and
 * stacks with the Forja `mithril_flat` upgrade. Normal mobs never drop.
 */
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
