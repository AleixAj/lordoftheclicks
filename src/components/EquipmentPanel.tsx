import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS } from '@/data';
import { useGameStore } from '@/engine/store';
import { SLOT_ICONS, formatItemStatLine } from '@/lib/equipmentText';
import styles from '@/styles/panel.module.css';
import type { EquipSlot, ShopItem } from '@/types/game';
import { BonusVsChips } from './BonusVsChips';
import { Panel } from './Panel';

interface SlotDef {
  key: EquipSlot;
  label: string;
  items: readonly ShopItem[];
  stat: keyof Pick<ShopItem, 'dmg' | 'def' | 'bonus'>;
}

export function EquipmentPanel() {
  const state = useGameStore((s) => s.state);
  const equipItem = useGameStore((s) => s.equipItem);

  const slots: SlotDef[] = [
    {
      key: 'weapon',
      label: 'Arma',
      items: SHOP_WEAPONS.filter((w) => state.owned.includes(w.id)),
      stat: 'dmg',
    },
    {
      key: 'armor',
      label: 'Armadura',
      items: SHOP_ARMOR.filter((a) => state.owned.includes(a.id)),
      stat: 'def',
    },
    {
      key: 'accessory',
      label: 'Accesorio',
      items: SHOP_ACCESS.filter((a) => state.owned.includes(a.id)),
      stat: 'bonus',
    },
  ];

  return (
    <Panel title="Equipamiento" bodyClassName={styles.scrollBody}>
      {slots.map((slot) => {
        const equipped = slot.items.find((it) => it.id === state.equipped[slot.key]);
        return (
          <div key={slot.key} className={styles.section}>
            <div className={styles.sectionTitle}>{slot.label}</div>
            {equipped ? (
              <div className={styles.card}>
                <EquippedItem slot={slot} item={equipped} />
                {slot.items.length > 1 && (
                  <select
                    className={styles.select}
                    value={equipped.id}
                    onChange={(e) => equipItem(slot.key, e.target.value)}
                  >
                    {slot.items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({formatItemStatLine(it, slot.key, slot.stat)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>Ranura vacía</div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

interface EquippedItemProps {
  slot: SlotDef;
  item: ShopItem;
}

function EquippedItem({ slot, item }: EquippedItemProps) {
  return (
    <>
      <div className={styles.itemIcon}>{SLOT_ICONS[slot.key]}</div>
      <div className={styles.content}>
        <div className={`${styles.itemName} ${styles.itemNameGold}`}>{item.name}</div>
        <div className={styles.meta}>{formatItemStatLine(item, slot.key, slot.stat)}</div>
        <BonusVsChips item={item} />
      </div>
    </>
  );
}
