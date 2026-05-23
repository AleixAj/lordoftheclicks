import type { EnemyType, EquipSlot, ShopItem } from '@/types/game';

export const ENEMY_TYPE_LABELS: Record<EnemyType, string> = {
  naturaleza: 'Naturaleza',
  bestia: 'Bestia',
  orco: 'Orco',
  uruk_hai: 'Uruk-hai',
  espectro: 'Espectro',
  humano: 'Humano',
  troll: 'Troll',
  mordor: 'Mordor',
  criatura_antigua: 'Criatura antigua',
};

export const ENEMY_TYPE_ABBR: Record<EnemyType, string> = {
  naturaleza: 'Nat',
  bestia: 'Bes',
  orco: 'Orc',
  uruk_hai: 'Uruk',
  espectro: 'Esp',
  humano: 'Hum',
  troll: 'Trl',
  mordor: 'Mor',
  criatura_antigua: 'Ant',
};

export const ENEMY_TYPE_COLORS: Record<EnemyType, { bg: string; border: string; text: string }> = {
  naturaleza: { bg: 'rgba(73, 122, 49, 0.2)', border: '#5f8f3f', text: '#264a18' },
  bestia: { bg: 'rgba(132, 82, 34, 0.2)', border: '#9a6631', text: '#573313' },
  orco: { bg: 'rgba(72, 105, 57, 0.24)', border: '#647f3f', text: '#2f421e' },
  uruk_hai: { bg: 'rgba(120, 42, 35, 0.2)', border: '#963d35', text: '#5a1d18' },
  espectro: { bg: 'rgba(73, 91, 142, 0.2)', border: '#5a6fa2', text: '#263a70' },
  humano: { bg: 'rgba(170, 122, 49, 0.22)', border: '#ad7a2f', text: '#66400c' },
  troll: { bg: 'rgba(82, 82, 82, 0.22)', border: '#777', text: '#333' },
  mordor: { bg: 'rgba(136, 37, 27, 0.22)', border: '#9f3024', text: '#64170f' },
  criatura_antigua: { bg: 'rgba(98, 72, 130, 0.22)', border: '#73548e', text: '#43275c' },
};

export interface BonusVsEntry {
  type: EnemyType;
  label: string;
  abbr: string;
  /** Single-letter compact abbreviation, used in dense grids on mobile. */
  abbr1: string;
  pct: number;
  color: { bg: string; border: string; text: string };
}

export const SLOT_ICONS: Record<EquipSlot, string> = {
  weapon: '⚔',
  armor: '⛨',
  accessory: '✦',
};

export const SLOT_LABELS: Record<EquipSlot, string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  accessory: 'Accesorio',
};

export const STAT_LABELS: Record<EquipSlot, string> = {
  weapon: 'daño',
  armor: 's en semi/jefe',
  accessory: 'bonus click',
};

/** +1 second on semi/boss fights per this many points of armor `def` in item data. */
export const ARMOR_DEF_PER_FIGHT_SECOND = 5;

/** Extra seconds on timed semi/boss fights from armor `def` value in data. */
export function armorFightTimeBonusS(def: number | undefined): number {
  if (!def || def <= 0) return 0;
  return Math.floor(def / ARMOR_DEF_PER_FIGHT_SECOND);
}

/** Display line for armor stat in shop/equipment UI. */
export function formatArmorStatLine(def: number | undefined): string {
  const secs = armorFightTimeBonusS(def);
  return `+${secs}s en semi/jefe`;
}

export function getBonusVsEntries(item: Pick<ShopItem, 'bonusVs'>): BonusVsEntry[] {
  if (!item.bonusVs) return [];
  return Object.entries(item.bonusVs)
    .filter((entry): entry is [EnemyType, number] => typeof entry[1] === 'number' && entry[1] > 0)
    .map(([type, value]) => ({
      type,
      label: ENEMY_TYPE_LABELS[type],
      abbr: ENEMY_TYPE_ABBR[type],
      abbr1: ENEMY_TYPE_LABELS[type].charAt(0).toUpperCase(),
      pct: Math.round(value * 100),
      color: ENEMY_TYPE_COLORS[type],
    }));
}

export function formatBonusVs(item: Pick<ShopItem, 'bonusVs'>): string | null {
  const parts = getBonusVsEntries(item).map((bonus) => `+${bonus.pct}% vs ${bonus.label}`);
  return parts.length ? parts.join(' · ') : null;
}
