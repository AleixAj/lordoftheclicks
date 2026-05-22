import { ENEMIES, LOCATIONS, QUESTS } from '@/data';
import type { GameState } from '@/types/game';
import { applyLevelUps, calcClickDamage } from './formulas';
import { unlockNextLocation, updateReachQuestProgress } from './progression';
import { spawnBoss, spawnFromPool } from './spawn';

/**
 * Apply `amount` of damage to the current enemy and progress the state if it dies.
 * This is a pure reducer-style function: no side effects, easy to unit test.
 */
export function dealDamage(state: GameState, amount: number, rng: () => number = Math.random): GameState {
  if (!state.enemy) return state;

  const newHp = state.enemy.hp - amount;
  if (newHp > 0) {
    return { ...state, enemy: { ...state.enemy, hp: newHp } };
  }

  const tmpl = ENEMIES[state.enemy.id];
  const goldEarned = tmpl?.gold ?? 1;
  const xpEarned = tmpl?.xp ?? 1;
  const mithrilEarned = state.enemy.isBoss ? Math.floor(goldEarned / 3) : 0;

  const loc = LOCATIONS[state.locIdx];
  const locId = loc?.id ?? '';
  const newKills = { ...state.locKills, [locId]: (state.locKills[locId] ?? 0) + 1 };
  const newTotal = state.totalKills + 1;
  const { xp: newXp, level: newLevel } = applyLevelUps(state.xp + xpEarned, state.level);

  const newBoss = { ...state.bossDefeated };
  if (state.enemy.isBoss) newBoss[locId] = true;

  const reachedKills = newKills[locId] ?? 0;
  let newUnlocked = [...state.unlockedLocs];
  if (loc && reachedKills >= loc.killsNeeded && state.locIdx < LOCATIONS.length - 1) {
    newUnlocked = unlockNextLocation(newUnlocked, state.locIdx);
  }

  let qp: Record<string, number> = { ...state.questProgress };
  for (const q of QUESTS) {
    if (state.questsDone.includes(q.id)) continue;
    if (q.type === 'kills_at' && q.loc === locId) qp[q.id] = (qp[q.id] ?? 0) + 1;
    if (q.type === 'boss' && state.enemy.isBoss && q.loc === locId) qp[q.id] = 1;
  }
  qp = updateReachQuestProgress(qp, state.questsDone, newUnlocked);

  let nextEnemy = null;
  if (loc?.boss && !newBoss[locId] && reachedKills >= loc.killsNeeded - 1) {
    nextEnemy = spawnBoss(loc);
  } else if (loc) {
    nextEnemy = spawnFromPool(loc, rng);
  }

  return {
    ...state,
    gold: state.gold + goldEarned,
    mithril: state.mithril + mithrilEarned,
    xp: newXp,
    level: newLevel,
    clickDmg: calcClickDamage({ level: newLevel, equipped: state.equipped }),
    enemy: nextEnemy,
    locKills: newKills,
    totalKills: newTotal,
    unlockedLocs: newUnlocked,
    bossDefeated: newBoss,
    questProgress: qp,
  };
}
