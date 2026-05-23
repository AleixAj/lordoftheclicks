export type LocationId = string;
export type EnemyId = string;
export type CompanionId = string;
export type ItemId = string;
export type QuestId = string;

export type EquipSlot = 'weapon' | 'armor' | 'accessory';
export type EnemyType =
  | 'naturaleza'
  | 'bestia'
  | 'orco'
  | 'uruk_hai'
  | 'espectro'
  | 'humano'
  | 'troll'
  | 'mordor'
  | 'criatura_antigua'
  | 'espiritual';

/** Rank of an encounter: normal mob, mid-zone semi-boss, or zone-final boss. */
export type EnemyTier = 'normal' | 'semi' | 'boss';

export interface Enemy {
  id: EnemyId;
  name: string;
  hp: number;
  gold: number;
  xp: number;
  /** Gameplay family used by equipment bonuses (e.g. +35% vs orcos). */
  enemyType: EnemyType;
  /** @deprecated kept for backwards compatibility; prefer `tier`. */
  isBoss?: boolean;
  /** Optional sprite path (relative to /public). Falls back to a default placeholder. */
  sprite?: string;
}

export interface Location {
  id: LocationId;
  name: string;
  desc: string;
  enemies: EnemyId[];
  killsNeeded: number;
  /** Mid-zone champion the player can challenge with the semi-boss button. */
  semiBoss?: EnemyId;
  boss?: EnemyId;
  /** Pool kills required to unlock the semi-boss button. Defaults to `floor(killsNeeded/2)`. */
  semiBossAt?: number;
  /** Pool kills required (plus a defeated semi-boss) to unlock the boss button. Defaults to `killsNeeded`. */
  bossAt?: number;
  /** Seconds the player has to defeat the semi-boss before it escapes. Defaults to 30. */
  semiBossTimeLimit?: number;
  /** Seconds the player has to defeat the boss before it escapes. Defaults to 30. */
  bossTimeLimit?: number;
  companions?: CompanionId[];
  /**
   * Rest-zone gate: if defined, the next location is unlocked only when
   * every companion in this list has been recruited. If undefined, rest
   * zones fall back to unlocking the next location on first visit
   * (legacy behaviour).
   */
  unlockGate?: CompanionId[];
  isRest?: boolean;
  isFinal?: boolean;
  /** Coordinate on the map image as percentage `[x, y]`. */
  pos: readonly [number, number];
  /** Optional background image (relative to /public). */
  background?: string;
  /** Optional CSS `background-position` (e.g. `center 70%`, `center bottom`). */
  backgroundPosition?: string;
  /** Optional CSS `background-size` (`cover` by default, `contain` to see full image). */
  backgroundSize?: string;
}

export interface Companion {
  id: CompanionId;
  name: string;
  title: string;
  baseDps: number;
  unlockAt: LocationId;
  color: string;
  /** Gold cost to recruit. `0` means they join automatically (starting party). */
  recruitCost: number;
  /** Optional portrait sprite (relative to /public). Falls back to a placeholder. */
  portrait?: string;
  /**
   * Relative portrait scale inside the recruit card (1 = full size).
   * Use values below 1 for shorter races (hobbits, dwarves) so they don't
   * appear as tall as humans/elves when placed side-by-side.
   */
  portraitScale?: number;
  /**
   * Optional focus for the small circular avatar in the "Comunidad" list.
   * `x`/`y` are percentages (0–100) for `object-position` and the zoom
   * origin. `scale` is the zoom factor (default 1.65). Use this to land
   * each face inside the round avatar even if the portrait is offset.
   */
  portraitFocus?: { x?: number; y?: number; scale?: number };
}

export interface ShopItem {
  id: ItemId;
  name: string;
  cost: number;
  loc: LocationId;
  desc?: string;
  /** Damage bonus (weapons). */
  dmg?: number;
  /** Defense bonus, contributes to DPS (armors). */
  def?: number;
  /** Click damage bonus (accessories). */
  bonus?: number;
  /** Percentage damage multiplier against enemy types (`0.35` = +35%). */
  bonusVs?: Partial<Record<EnemyType, number>>;
}

export type QuestType = 'kills_at' | 'reach' | 'boss';

export interface QuestReward {
  gold?: number;
  mithril?: number;
}

export interface Quest {
  id: QuestId;
  name: string;
  desc: string;
  type: QuestType;
  /** Where the quest objective takes place (kills_at, boss target, reach destination). */
  loc: LocationId;
  /**
   * Where the player picks the quest up from the "!" badge. Defaults to `loc`.
   * For `reach` quests this should be the PREVIOUS zone so the player is
   * given a destination to travel to.
   */
  pickupLoc?: LocationId;
  need: number;
  reward: QuestReward;
}

export interface EnemyInstance {
  id: EnemyId;
  name: string;
  hp: number;
  maxHp: number;
  enemyType: EnemyType;
  tier: EnemyTier;
  /** @deprecated mirrors `tier === 'boss'`; kept for legacy callers. */
  isBoss: boolean;
}

export interface CompanionState {
  unlocked: boolean;
  level: number;
}

export interface EquippedItems {
  weapon: ItemId | null;
  armor: ItemId | null;
  accessory: ItemId | null;
}

/**
 * An in-progress challenge against a zone's semi-boss or boss.
 * Cleared when the encounter resolves (victory, escape on timeout, or travel).
 */
export interface BossFightState {
  tier: 'semi' | 'boss';
  locId: LocationId;
  /** Wall-clock ms when the fight started (Date.now). */
  startedAt: number;
  /** Wall-clock ms after which the enemy escapes if not defeated. */
  deadlineMs: number;
}

export interface GameState {
  locIdx: number;
  gold: number;
  mithril: number;
  xp: number;
  level: number;
  clickDmg: number;
  enemy: EnemyInstance | null;
  /** Non-null while the player is actively challenging a semi-boss or boss. */
  bossFight: BossFightState | null;
  companions: Record<CompanionId, CompanionState>;
  equipped: EquippedItems;
  owned: ItemId[];
  locKills: Record<LocationId, number>;
  totalKills: number;
  unlockedLocs: LocationId[];
  bossDefeated: Record<LocationId, boolean>;
  semiBossDefeated: Record<LocationId, boolean>;
  questProgress: Record<QuestId, number>;
  questsDone: QuestId[];
  /**
   * Quests the player has explicitly picked up. Only accepted quests
   * make progress and appear in the active list. Quests are discovered
   * by visiting their target location and clicking the "!" badge on the
   * map marker.
   */
  questsAccepted: QuestId[];
}
