import { ENEMIES, LOCATIONS } from '@/data';
import type { EnemyInstance, EnemyTier, Location } from '@/types/game';

function makeInstance(eid: string, tier: EnemyTier): EnemyInstance | null {
  const tmpl = ENEMIES[eid];
  if (!tmpl) return null;
  return {
    id: eid,
    name: tmpl.name,
    hp: tmpl.hp,
    maxHp: tmpl.hp,
    enemyType: tmpl.enemyType,
    tier,
    isBoss: tier === 'boss',
  };
}

export function spawnFromPool(loc: Location, rng: () => number = Math.random): EnemyInstance | null {
  if (loc.isRest || loc.enemies.length === 0) return null;
  const eid = loc.enemies[Math.floor(rng() * loc.enemies.length)];
  return makeInstance(eid, 'normal');
}

export function spawnSemiBoss(loc: Location): EnemyInstance | null {
  if (!loc.semiBoss) return null;
  return makeInstance(loc.semiBoss, 'semi');
}

export function spawnBoss(loc: Location): EnemyInstance | null {
  if (!loc.boss) return null;
  return makeInstance(loc.boss, 'boss');
}

export function spawnInitial(locIdx: number, rng?: () => number): EnemyInstance | null {
  const loc = LOCATIONS[locIdx];
  if (!loc) return null;
  return spawnFromPool(loc, rng);
}
