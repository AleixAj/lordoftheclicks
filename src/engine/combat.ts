import { ENEMIES, LOCATIONS, QUESTS } from '@/data';
import type { GameState } from '@/types/game';
import {
  applyLevelUps,
  applyRewardMultiplier,
  calcClickDamage,
  mithrilRewardForTier,
} from './formulas';
import { unlockNextLocation, updateReachQuestProgress } from './progression';
import { spawnFromPool } from './spawn';

/**
 * Apply `amount` of damage to the current enemy and progress the state if it dies.
 * Pure reducer-style function: no side effects, easy to unit test.
 *
 * Encounter rules:
 *  - Pool mobs spawn automatically when no fight is active.
 *  - The semi-boss / boss only appear when the player explicitly starts a
 *    fight via the store (`startBossFight`), which sets `state.bossFight`.
 *  - Pool kills count toward `locKills`; semi/boss kills do not.
 *  - Defeating the zone-final boss is what unlocks the next location.
 *  - If a semi/boss dies the active `bossFight` is cleared so a new pool
 *    mob can spawn.
 */
export function dealDamage(
  state: GameState,
  amount: number,
  rng: () => number = Math.random,
): GameState {
  if (!state.enemy) return state;

  const newHp = state.enemy.hp - amount;
  if (newHp > 0) {
    return { ...state, enemy: { ...state.enemy, hp: newHp } };
  }

  const tmpl = ENEMIES[state.enemy.id];
  const baseGold = tmpl?.gold ?? 1;
  const baseXp = tmpl?.xp ?? 1;
  const enemyTier = state.enemy.tier;

  const loc = LOCATIONS[state.locIdx];
  const locId = loc?.id ?? '';
  const wasBossFight = state.bossFight != null;
  const firstClear =
    enemyTier === 'boss'
      ? !state.bossDefeated[locId]
      : enemyTier === 'semi'
        ? !state.semiBossDefeated[locId]
        : false;
  const goldEarned = applyRewardMultiplier(baseGold, state.upgrades, 'gold_pct', state.equipped);
  const xpEarned = applyRewardMultiplier(baseXp, state.upgrades, 'xp_pct', state.equipped);
  const mithrilEarned = mithrilRewardForTier(enemyTier, state.locIdx, state.upgrades, firstClear);

  // Pool kills increment locKills. Semi/boss kills don't (they're gated by it).
  const newKills = wasBossFight
    ? state.locKills
    : { ...state.locKills, [locId]: (state.locKills[locId] ?? 0) + 1 };
  const newTotal = wasBossFight ? state.totalKills : state.totalKills + 1;

  const { xp: newXp, level: newLevel } = applyLevelUps(state.xp + xpEarned, state.level);

  // Track defeats by id so a semi-boss kill doesn't accidentally complete
  // the zone-final boss flag.
  const newBoss = { ...state.bossDefeated };
  const newSemiBoss = { ...state.semiBossDefeated };
  if (loc?.boss && state.enemy.id === loc.boss) newBoss[locId] = true;
  if (loc?.semiBoss && state.enemy.id === loc.semiBoss) newSemiBoss[locId] = true;

  // Defeating the zone-final boss unlocks the next location.
  let newUnlocked = [...state.unlockedLocs];
  if (loc?.boss && state.enemy.id === loc.boss && state.locIdx < LOCATIONS.length - 1) {
    newUnlocked = unlockNextLocation(newUnlocked, state.locIdx);
  }

  let qp: Record<string, number> = { ...state.questProgress };
  for (const q of QUESTS) {
    if (state.questsDone.includes(q.id)) continue;
    // Quests must be explicitly picked up before they track progress.
    if (!state.questsAccepted.includes(q.id)) continue;
    if (q.type === 'kills_at' && q.loc === locId && !wasBossFight) {
      qp[q.id] = (qp[q.id] ?? 0) + 1;
    }
    if (q.type === 'boss' && q.loc === locId && loc?.boss && state.enemy.id === loc.boss) {
      qp[q.id] = 1;
    }
  }
  qp = updateReachQuestProgress(qp, state.questsDone, state.visitedLocs, state.questsAccepted);

  // After any kill, fall back to a fresh pool mob (or null if at rest).
  const nextEnemy = loc ? spawnFromPool(loc, rng) : null;

  return {
    ...state,
    gold: state.gold + goldEarned,
    mithril: state.mithril + mithrilEarned,
    xp: newXp,
    level: newLevel,
    clickDmg: calcClickDamage({
      level: newLevel,
      equipped: state.equipped,
      upgrades: state.upgrades,
    }),
    enemy: nextEnemy,
    bossFight: null,
    locKills: newKills,
    totalKills: newTotal,
    unlockedLocs: newUnlocked,
    bossDefeated: newBoss,
    semiBossDefeated: newSemiBoss,
    questProgress: qp,
  };
}
