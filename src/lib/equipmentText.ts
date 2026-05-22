import type { EnemyType, EquipSlot, ShopItem } from '@/types/game';

export const ENEMY_TYPE_LABELS: Record<EnemyType, string> = {
  naturaleza: 'Naturaleza',
  bestia: 'Bestias',
  orco: 'Orcos',
  uruk_hai: 'Uruk-hai',
  espectro: 'Espectros',
  humano: 'Humanos',
  troll: 'Trolls',
  mordor: 'Mordor',
  criatura_antigua: 'Criaturas antiguas',
  espiritual: 'Espiritual',
};

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
  armor: 'defensa',
  accessory: 'bonus click',
};

export function formatBonusVs(item: Pick<ShopItem, 'bonusVs'>): string | null {
  if (!item.bonusVs) return null;
  const parts = Object.entries(item.bonusVs)
    .filter(([, value]) => typeof value === 'number' && value > 0)
    .map(
      ([type, value]) =>
        `+${Math.round(value * 100)}% vs ${ENEMY_TYPE_LABELS[type as EnemyType]}`,
    );
  return parts.length ? parts.join(' · ') : null;
}
