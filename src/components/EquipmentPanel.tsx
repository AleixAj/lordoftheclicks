import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS } from '@/data';
import { useGameStore } from '@/engine/store';
import type { EquipSlot, ShopItem } from '@/types/game';
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
    { key: 'weapon', label: 'Arma', items: SHOP_WEAPONS.filter((w) => state.owned.includes(w.id)), stat: 'dmg' },
    { key: 'armor', label: 'Armadura', items: SHOP_ARMOR.filter((a) => state.owned.includes(a.id)), stat: 'def' },
    { key: 'accessory', label: 'Accesorio', items: SHOP_ACCESS.filter((a) => state.owned.includes(a.id)), stat: 'bonus' },
  ];

  return (
    <Panel title="Equipamiento" bodyClassName="px-2 py-1.5">
      {slots.map((slot) => {
        const equipped = slot.items.find((it) => it.id === state.equipped[slot.key]);
        return (
          <div key={slot.key} className="py-1.5 border-b border-black/5">
            <div className="text-[10px] font-[Cinzel] text-[#6b5840] tracking-wider uppercase mb-0.5">
              {slot.label}
            </div>
            {equipped ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#1e1a14] border border-[#7a6a30] rounded flex items-center justify-center text-[13px]">
                  ⚔
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-[#c9a44a]">{equipped.name}</div>
                  <div className="text-[10px] text-[#6b5840]">
                    +{equipped[slot.stat]} {slot.key === 'weapon' ? 'daño' : slot.key === 'armor' ? 'defensa' : 'bonus'}
                  </div>
                </div>
                {slot.items.length > 1 && (
                  <select
                    className="text-[10px] bg-[#d2bc90] border border-[#7a6a30] rounded px-1 max-w-[90px]"
                    value={equipped.id}
                    onChange={(e) => equipItem(slot.key, e.target.value)}
                  >
                    {slot.items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} (+{it[slot.stat]})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="text-[11px] italic text-[#6b5840] opacity-60">— vacío —</div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
