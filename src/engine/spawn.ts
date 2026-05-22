import { ENEMIES, LOCATIONS } from '@/data';
import type { EnemyInstance, Location } from '@/types/game';

export function spawnFromPool(loc: Location, rng: () => number = Math.random): EnemyInstance | null {
  if (loc.isRest || loc.enemies.length === 0) return null;
  const eid = loc.enemies[Math.floor(rng() * loc.enemies.length)];
  const tmpl = ENEMIES[eid];
  if (!tmpl) return null;
  return { id: eid, name: tmpl.name, hp: tmpl.hp, maxHp: tmpl.hp, isBoss: false };
}

export function spawnBoss(loc: Location): EnemyInstance | null {
  if (!loc.boss) return null;
  const tmpl = ENEMIES[loc.boss];
  if (!tmpl) return null;
  return { id: loc.boss, name: tmpl.name, hp: tmpl.hp, maxHp: tmpl.hp, isBoss: true };
}

export function spawnInitial(locIdx: number, rng?: () => number): EnemyInstance | null {
  const loc = LOCATIONS[locIdx];
  if (!loc) return null;
  return spawnFromPool(loc, rng);
}
