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
      <Currency icon="G" iconClass="from-[#c9a44a] to-[#e8c55a] text-[#2a1800]" value={state.gold.toLocaleString()} label="Oro" />
      <Currency icon="M" iconClass="from-[#8ab0d0] to-[#b8d8f0] text-[#102030]" value={state.mithril.toLocaleString()} label="Mithril" />
      <Currency icon="★" iconClass="from-[#6a80a8] to-[#8aaad0] text-white text-[11px]" value={`Nivel ${state.level}`}>
        <div className="w-20 h-[5px] bg-[#2a1010] rounded mt-1 overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-[#6a80a8] to-[#8aaad0] transition-[width]"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </Currency>
      <Currency icon="†" iconClass="from-[#8a3030] to-[#b84040] text-[#ffd0d0] text-[15px]" value={state.totalKills.toLocaleString()} label="Enemigos" />
    </div>
  );
}

interface CurrencyProps {
  icon: string;
  iconClass: string;
  value: string;
  label?: string;
  children?: React.ReactNode;
}

function Currency({ icon, iconClass, value, label, children }: CurrencyProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 flex-1 max-w-[200px] bg-[#1e1a14] border border-[#7a6a30] rounded">
      <div
        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-bold font-[Cinzel] bg-gradient-to-br ${iconClass}`}
      >
        {icon}
      </div>
      <div className="leading-tight">
        <div className="font-[Cinzel] font-bold text-[14px] text-[#c9a44a]">{value}</div>
        {label && <div className="text-[10px] text-[#888] uppercase tracking-wide">{label}</div>}
        {children}
      </div>
    </div>
  );
}
