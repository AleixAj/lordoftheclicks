import { describe, expect, it } from 'vitest';
import {
  COMPANIONS,
  ENEMIES,
  LOCATIONS,
  QUESTS,
  SHOP_ACCESS,
  SHOP_ARMOR,
  SHOP_WEAPONS,
} from '@/data';
import type { EnemyType } from '@/types/game';

const ENEMY_TYPES: readonly EnemyType[] = [
  'naturaleza',
  'bestia',
  'orco',
  'uruk_hai',
  'espectro',
  'humano',
  'troll',
  'mordor',
  'criatura_antigua',
];

describe('content integrity', () => {
  const locationIds = new Set(LOCATIONS.map((l) => l.id));
  const enemyIds = new Set(Object.keys(ENEMIES));
  const companionIds = new Set(COMPANIONS.map((c) => c.id));
  const validEnemyTypes = new Set(ENEMY_TYPES);

  it('all enemy references in locations exist', () => {
    for (const loc of LOCATIONS) {
      for (const enemy of loc.enemies) expect(enemyIds.has(enemy), `${loc.id}:${enemy}`).toBe(true);
      if (loc.semiBoss) expect(enemyIds.has(loc.semiBoss), `${loc.id}:${loc.semiBoss}`).toBe(true);
      if (loc.boss) expect(enemyIds.has(loc.boss), `${loc.id}:${loc.boss}`).toBe(true);
      for (const companion of loc.companions ?? []) {
        expect(companionIds.has(companion), `${loc.id}:${companion}`).toBe(true);
      }
      for (const gate of loc.unlockGate ?? []) {
        expect(companionIds.has(gate), `${loc.id}:${gate}`).toBe(true);
      }
    }
  });

  it('all enemies have a valid enemy type (or none)', () => {
    for (const enemy of Object.values(ENEMIES)) {
      if (enemy.enemyType === undefined) continue;
      expect(validEnemyTypes.has(enemy.enemyType), enemy.id).toBe(true);
    }
  });

  it('shop items reference valid locations and enemy type bonuses', () => {
    const items = [...SHOP_WEAPONS, ...SHOP_ARMOR, ...SHOP_ACCESS];
    for (const item of items) {
      expect(locationIds.has(item.loc), item.id).toBe(true);
      for (const type of Object.keys(item.bonusVs ?? {})) {
        expect(validEnemyTypes.has(type as EnemyType), `${item.id}:${type}`).toBe(true);
      }
    }
  });

  it('quests reference valid objective and pickup locations', () => {
    for (const quest of QUESTS) {
      expect(locationIds.has(quest.loc), `${quest.id}:loc`).toBe(true);
      if (quest.pickupLoc) {
        expect(locationIds.has(quest.pickupLoc), `${quest.id}:pickupLoc`).toBe(true);
      }
    }
  });
});
