import { xpForLevel } from '@/engine/store';
import type { GameState } from '@/types/game';

interface CurrencyBarProps {
  state: GameState;
}

export function CurrencyBar({ state }: CurrencyBarProps) {
  const xpNeeded = xpForLevel(state.level);
  const xpPct = (state.xp / xpNeeded) * 100;

  return (
    <div className="flex gap-1 justify-center">
      <Currency
        iconSrc="/gold-button.png"
        iconAlt="Oro"
        value={state.gold.toLocaleString()}
        label="Oro"
      />
      <Currency
        iconSrc="/mithril-button.png"
        iconAlt="Mithril"
        value={state.mithril.toLocaleString()}
        label="Mithril"
      />
      <Currency iconSrc="/level-button.png" iconAlt="Nivel" value={`Nivel ${state.level}`}>
        <div className="w-20 h-[5px] bg-[#2a1010] rounded mt-1 overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-[#6a80a8] to-[#8aaad0] transition-[width]"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </Currency>
      <Currency
        iconSrc="/kills-button.png"
        iconAlt="Enemigos derrotados"
        value={state.totalKills.toLocaleString()}
        label="Enemigos"
      />
    </div>
  );
}

interface CurrencyProps {
  iconSrc: string;
  iconAlt: string;
  value: string;
  label?: string;
  children?: React.ReactNode;
}

function Currency({ iconSrc, iconAlt, value, label, children }: CurrencyProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 flex-1 max-w-[200px] bg-[#1e1a14] border border-[#7a6a30] rounded">
      <img
        src={iconSrc}
        alt={iconAlt}
        className="w-[32px] h-[32px] object-contain shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        draggable={false}
      />
      <div className="leading-tight">
        <div className="font-[Cinzel] font-bold text-[14px] text-[#c9a44a]">{value}</div>
        {label && <div className="text-[10px] text-[#888] uppercase tracking-wide">{label}</div>}
        {children}
      </div>
    </div>
  );
}
