/**
 * Factories that turn enemy templates from `@/data` into fresh
 * `EnemyInstance` runtime objects. Pure: `rng` is injectable so the
 * pool draw is deterministic in tests.
 */
import { ENEMIES, LOCATIONS } from '@/data';
import type { EnemyInstance, EnemyTier, Location } from '@/types/game';

/**
 * Clones template stats into a fresh instance. `maxHp` is captured here
 * so the HP bar can render relative to the spawn value (templates may
 * later be patched without breaking ongoing fights).
 */
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

/**
 * Draws a random pool mob for the current location. Returns `null` for
 * rest zones and for combat zones with an empty pool.
 */
export function spawnFromPool(
  loc: Location,
  rng: () => number = Math.random,
): EnemyInstance | null {
  if (loc.isRest || loc.enemies.length === 0) return null;
  const eid = loc.enemies[Math.floor(rng() * loc.enemies.length)];
  return makeInstance(eid, 'normal');
}

/** Creates the zone's semi-boss instance, or `null` if the zone has none. */
export function spawnSemiBoss(loc: Location): EnemyInstance | null {
  if (!loc.semiBoss) return null;
  return makeInstance(loc.semiBoss, 'semi');
}

/** Creates the zone's final boss instance, or `null` if the zone has none. */
export function spawnBoss(loc: Location): EnemyInstance | null {
  if (!loc.boss) return null;
  return makeInstance(loc.boss, 'boss');
}

/**
 * Used by the persistence layer on initial state creation. Falls back to
 * `null` if the saved `locIdx` is out of range (older saves with shorter
 * `LOCATIONS` arrays).
 */
export function spawnInitial(locIdx: number, rng?: () => number): EnemyInstance | null {
  const loc = LOCATIONS[locIdx];
  if (!loc) return null;
  return spawnFromPool(loc, rng);
}
