export type LocationId = string;
export type EnemyId = string;
export type CompanionId = string;
export type ItemId = string;
export type QuestId = string;

export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export interface Enemy {
  id: EnemyId;
  name: string;
  hp: number;
  gold: number;
  xp: number;
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
  boss?: EnemyId;
  companions?: CompanionId[];
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
  loc: LocationId;
  need: number;
  reward: QuestReward;
}

export interface EnemyInstance {
  id: EnemyId;
  name: string;
  hp: number;
  maxHp: number;
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

export interface GameState {
  locIdx: number;
  gold: number;
  mithril: number;
  xp: number;
  level: number;
  clickDmg: number;
  enemy: EnemyInstance | null;
  companions: Record<CompanionId, CompanionState>;
  equipped: EquippedItems;
  owned: ItemId[];
  locKills: Record<LocationId, number>;
  totalKills: number;
  unlockedLocs: LocationId[];
  bossDefeated: Record<LocationId, boolean>;
  questProgress: Record<QuestId, number>;
  questsDone: QuestId[];
}
