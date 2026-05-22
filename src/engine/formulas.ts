/**
 * Pure calculation helpers shared across the engine and the UI.
 * Keeping them isolated makes them trivially unit-testable.
 */
import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS } from '@/data';
import { COMPANIONS } from '@/data/companions';
import type { GameState } from '@/types/game';

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

export function applyLevelUps(xp: number, level: number): { xp: number; level: number } {
  let nextXp = xp;
  let nextLevel = level;
  while (nextXp >= xpForLevel(nextLevel)) {
    nextXp -= xpForLevel(nextLevel);
    nextLevel++;
  }
  return { xp: nextXp, level: nextLevel };
}
