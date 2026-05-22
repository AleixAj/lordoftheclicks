import { COMPANIONS, LOCATIONS } from '@/data';
import { companionUpgradeCost, useGameStore } from '@/engine/store';
import { Panel } from './Panel';

export function CompanionsPanel() {
  const state = useGameStore((s) => s.state);
  const levelUp = useGameStore((s) => s.levelUpCompanion);

  const unlocked = COMPANIONS.filter((c) => state.companions[c.id]?.unlocked);
  const locked = COMPANIONS.filter((c) => !state.companions[c.id]?.unlocked);

  return (
    <Panel
      className="flex-1"
      title="La Comunidad"
      headerExtra={
        <span className="text-[10px] opacity-70 normal-case tracking-normal">
          {unlocked.length}/{COMPANIONS.length}
        </span>
      }
      bodyClassName="overflow-y-auto px-2 py-1.5"
    >
      {unlocked.map((c) => {
        const cs = state.companions[c.id];
        const cost = companionUpgradeCost(cs.level);
        const canAfford = state.gold >= cost;
        const dps = (c.baseDps * cs.level).toFixed(1);
        return (
          <div key={c.id} className="flex items-center gap-2 py-1 border-b border-black/5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-[Cinzel] font-bold text-white text-[13px] shadow"
              style={{ background: c.color }}
            >
              {c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-[Cinzel] font-semibold text-[#2c1c10]">
                {c.name}
                <span className="text-[10px] text-[#6b5840] font-[Crimson_Pro] font-normal ml-1">
                  Nv.{cs.level}
                </span>
              </div>
              <div className="text-[11px] text-[#6b5840]">
                {c.title} · DPS: {dps}
              </div>
            </div>
            <button
              type="button"
              className={`text-[10px] font-[Cinzel] font-bold px-2 py-0.5 rounded border uppercase tracking-wide transition ${
                canAfford
                  ? 'bg-gradient-to-b from-[#c9a44a] to-[#a08030] border-[#8a7020] text-[#1a1000] hover:brightness-110 active:scale-95'
                  : 'bg-black/10 border-black/15 text-[#6b5840] cursor-not-allowed'
              }`}
              onClick={() => canAfford && levelUp(c.id)}
              title={`Subir nivel: ${cost} oro`}
            >
              ↑ {cost}g
            </button>
          </div>
        );
      })}
      {locked.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#7a6a30] opacity-40">
          {locked.map((c) => {
            const where = LOCATIONS.find((l) => l.id === c.unlockAt);
            return (
              <div key={c.id} className="flex items-center gap-2 py-1 opacity-60">
                <div className="w-7 h-7 rounded-full bg-[#555] flex items-center justify-center text-white text-[13px] font-[Cinzel] font-bold">
                  ?
                </div>
                <div>
                  <div className="text-[12px] text-[#6b5840]">???</div>
                  <div className="text-[10px] text-[#6b5840]">
                    Desbloquea en {where?.name ?? '?'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
