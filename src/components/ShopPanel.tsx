import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS } from '@/data';
import { useGameStore } from '@/engine/store';
import { SLOT_ICONS, formatArmorStatLine } from '@/lib/equipmentText';
import styles from '@/styles/panel.module.css';
import type { EquipSlot, ShopItem } from '@/types/game';
import { BonusVsChips } from './BonusVsChips';
import { Panel } from './Panel';

export function ShopPanel() {
  const state = useGameStore((s) => s.state);
  const buy = useGameStore((s) => s.buyItem);
  const equip = useGameStore((s) => s.equipItem);

  const visited = state.unlockedLocs;
  const weapons = SHOP_WEAPONS.filter((w) => visited.includes(w.loc));
  const armor = SHOP_ARMOR.filter((a) => visited.includes(a.loc));
  const access = SHOP_ACCESS.filter((a) => visited.includes(a.loc));

  const hasAny = weapons.length || armor.length || access.length;

  return (
    <Panel className="flex-1" title="Tienda" bodyClassName={styles.scrollBody}>
      {!hasAny ? (
        <div className={styles.emptyState}>
          Explora nuevos lugares para
          <br />
          desbloquear objetos
        </div>
      ) : (
        <>
          <Section
            title="Armas"
            items={weapons}
            slot="weapon"
            statKey="dmg"
            state={state}
            onBuy={buy}
            onEquip={equip}
          />
          <Section
            title="Armaduras"
            items={armor}
            slot="armor"
            statKey="def"
            state={state}
            onBuy={buy}
            onEquip={equip}
          />
          <Section
            title="Accesorios"
            items={access}
            slot="accessory"
            statKey="bonus"
            state={state}
            onBuy={buy}
            onEquip={equip}
          />
        </>
      )}
    </Panel>
  );
}

interface SectionProps {
  title: string;
  items: readonly ShopItem[];
  slot: EquipSlot;
  statKey: keyof Pick<ShopItem, 'dmg' | 'def' | 'bonus'>;
  state: import('@/types/game').GameState;
  onBuy: (slot: EquipSlot, id: string) => void;
  onEquip: (slot: EquipSlot, id: string) => void;
}

function Section({ title, items, slot, statKey, state, onBuy, onEquip }: SectionProps) {
  if (!items.length) return null;
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {items.map((item) => {
        const owned = state.owned.includes(item.id);
        const equipped = state.equipped[slot] === item.id;
        const afford = state.gold >= item.cost;
        return (
          <div
            key={item.id}
            className={`${styles.card} ${owned && !equipped ? styles.cardMuted : ''} ${equipped ? styles.cardComplete : ''}`}
          >
            <div className={styles.itemIcon}>{SLOT_ICONS[slot]}</div>
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <div className={`${styles.itemName} ${owned ? styles.itemNameGold : ''}`}>
                  {item.name}
                </div>
                {equipped && <span className={styles.statusBadge}>Equipado</span>}
              </div>
              <div className={styles.meta}>
                {slot === 'armor'
                  ? formatArmorStatLine(item.def)
                  : `+${item[statKey]} ${slot === 'weapon' ? 'daño' : 'bonus'}`}
                {item.desc && <span className="italic"> · {item.desc}</span>}
              </div>
              <BonusVsChips item={item} />
            </div>
            {owned ? (
              equipped ? (
                <span className={styles.statusBadge}>✓</span>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => onEquip(slot, item.id)}
                >
                  Equipar
                </button>
              )
            ) : (
              <button
                type="button"
                className={`${styles.button} ${!afford ? styles.buttonDisabled : ''}`}
                onClick={() => afford && onBuy(slot, item.id)}
                disabled={!afford}
              >
                {item.cost}g
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
