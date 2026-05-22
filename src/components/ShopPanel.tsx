import { SHOP_ACCESS, SHOP_ARMOR, SHOP_WEAPONS } from '@/data';
import { useGameStore } from '@/engine/store';
import type { EquipSlot, ShopItem } from '@/types/game';
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
    <Panel className="flex-1" title="Tienda" bodyClassName="overflow-y-auto px-2 py-1.5">
      {!hasAny ? (
        <div className="text-[12px] text-[#6b5840] text-center p-3">
          Explora nuevos lugares para
          <br />
          desbloquear objetos
        </div>
      ) : (
        <>
          <Section title="Armas" items={weapons} slot="weapon" statKey="dmg" state={state} onBuy={buy} onEquip={equip} />
          <Section title="Armaduras" items={armor} slot="armor" statKey="def" state={state} onBuy={buy} onEquip={equip} />
          <Section title="Accesorios" items={access} slot="accessory" statKey="bonus" state={state} onBuy={buy} onEquip={equip} />
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
    <div className="mb-2">
      <div className="text-[10px] font-[Cinzel] text-[#6b5840] tracking-wider uppercase mb-1">{title}</div>
      {items.map((item) => {
        const owned = state.owned.includes(item.id);
        const equipped = state.equipped[slot] === item.id;
        const afford = state.gold >= item.cost;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 py-1 border-b border-black/5 ${owned ? 'opacity-60' : ''}`}
          >
            <div className="flex-1">
              <div className={`text-[12px] font-semibold ${owned ? 'text-[#3a7a3a]' : 'text-[#2c1c10]'}`}>
                {item.name}
                {equipped && <span className="text-[9px] text-[#c9a44a] ml-1">EQUIP</span>}
              </div>
              <div className="text-[10px] text-[#6b5840]">
                +{item[statKey]} {slot === 'weapon' ? 'daño' : slot === 'armor' ? 'def' : 'bonus'}
                {item.desc && <span className="italic"> · {item.desc}</span>}
              </div>
            </div>
            {owned ? (
              equipped ? (
                <span className="text-[10px] text-[#3a7a3a]">✓</span>
              ) : (
                <button
                  type="button"
                  className="text-[10px] font-[Cinzel] font-bold px-2 py-0.5 rounded bg-gradient-to-b from-[#c9a44a] to-[#a08030] border border-[#8a7020] text-[#1a1000] uppercase tracking-wide hover:brightness-110"
                  onClick={() => onEquip(slot, item.id)}
                >
                  Equipar
                </button>
              )
            ) : (
              <button
                type="button"
                className={`text-[10px] font-[Cinzel] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                  afford
                    ? 'bg-gradient-to-b from-[#c9a44a] to-[#a08030] border-[#8a7020] text-[#1a1000] hover:brightness-110'
                    : 'bg-black/10 border-black/15 text-[#6b5840] cursor-not-allowed'
                }`}
                onClick={() => afford && onBuy(slot, item.id)}
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
