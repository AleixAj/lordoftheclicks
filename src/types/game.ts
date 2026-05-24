export type LocationId = string;
export type EnemyId = string;
export type CompanionId = string;
export type ItemId = string;
export type QuestId = string;
export type UpgradeId = string;

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
  | 'criatura_antigua';

/** Rank of an encounter: normal mob, mid-zone semi-boss, or zone-final boss. */
export type EnemyTier = 'normal' | 'semi' | 'boss';

export interface Enemy {
  id: EnemyId;
  name: string;
  hp: number;
  gold: number;
  xp: number;
  /**
   * Gameplay family used by equipment bonuses (e.g. +35% vs orcos).
   * Optional: enemies without a type take no equipment damage bonuses
   * and don't display a type pill (used for final/unique foes).
   */
  enemyType?: EnemyType;
  /** @deprecated kept for backwards compatibility; prefer `tier`. */
  isBoss?: boolean;
  /** Optional sprite path (relative to /public). Falls back to a default placeholder. */
  sprite?: string;
  /**
   * Optional colored halo around the sprite, in CSS pixels of blur radius.
   * Used to mark etereal / supernatural enemies (e.g. the King of the
   * Dead). 0 / undefined disables the glow.
   */
  glow?: number;
  /**
   * Comma-separated RGB triplet for the halo color (e.g. `'102, 217, 217'`
   * for turquoise). Defaults to white when omitted.
   */
  glowColor?: string;
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
  /**
   * Combat zones can opt-in to a local merchant. Adds the same Combate/Tienda
   * toggle used in rest stops. Rest zones imply a shop already, so this is
   * only needed for non-rest locations (e.g. Fangorn, where Bárbol trades).
   */
  hasShop?: boolean;
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
   * Vertical offset applied to the portrait, in percent of the wrapper
   * height. Positive values push the figure downward so a tall portrait
   * can be scaled up without clipping at the top of the card.
   */
  portraitOffsetY?: number;
  /**
   * Optional focus for the small circular avatar in the "Comunidad" list.
   * `x`/`y` are percentages (0–100) for `object-position` and the zoom
   * origin. `scale` is the zoom factor (default 1.65). Use this to land
   * each face inside the round avatar even if the portrait is offset.
   */
  portraitFocus?: { x?: number; y?: number; scale?: number };
  /**
   * Optional gate: this companion can only be recruited after the player
   * has defeated the boss of the given location. Used for "earned" allies
   * like the King of the Dead, where the recruit only happens once the
   * juramento is broken (the boss is beaten).
   */
  requireBossDefeated?: LocationId;
  /**
   * Optional colored halo around the recruited portrait, in CSS pixels of
   * blur radius. Used to hint elven/etereal characters. Subtle ≈ 8–10,
   * strong ≈ 22–26. Only applies once the companion is recruited so the
   * silhouette state still hides their identity.
   */
  portraitGlow?: number;
  /**
   * Comma-separated RGB triplet for the halo color (e.g. `'102, 217, 217'`
   * for turquoise). Defaults to white when omitted.
   */
  portraitGlowColor?: string;
}

export interface ShopItem {
  id: ItemId;
  name: string;
  cost: number;
  loc: LocationId;
  desc?: string;
  /** Damage bonus (weapons). */
  dmg?: number;
  /** Armor stat: +1s on semi/boss fights per 5 points (see `armorFightTimeBonusS`). */
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

export type UpgradeEffect =
  | 'click_damage_pct'
  | 'gold_pct'
  | 'xp_pct'
  | 'fight_time_s'
  | 'companion_cap'
  | 'companion_cost_pct'
  | 'mithril_flat';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  shortName: string;
  desc: string;
  maxRank: number;
  baseCost: number;
  costGrowth: number;
  effect: UpgradeEffect;
  valuePerRank: number;
  requires?: Partial<Record<UpgradeId, number>>;
  position: { x: number; y: number };
  branch: 'core' | 'damage' | 'wealth' | 'wisdom' | 'time' | 'companions' | 'mithril';
}

export interface EnemyInstance {
  id: EnemyId;
  name: string;
  hp: number;
  maxHp: number;
  enemyType?: EnemyType;
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
  /** Permanent upgrades bought in the Forja de Rivendel. */
  upgrades: Record<UpgradeId, number>;
  /** True once the player has visited Rivendel for the first time. Unlocks the Forge UI. */
  forgeUnlocked: boolean;
  /** True once the player has opened the Forge modal at least once. Used to stop the unlock-glow highlight. */
  forgeSeen: boolean;
}
