import { QUESTS } from '@/data';
import { useGameStore } from '@/engine/store';
import { Panel } from './Panel';

export function QuestsPanel() {
  const state = useGameStore((s) => s.state);
  const claim = useGameStore((s) => s.claimQuest);

  const active = QUESTS.filter(
    (q) => state.questsAccepted.includes(q.id) && !state.questsDone.includes(q.id),
  );
  const done = QUESTS.filter((q) => state.questsDone.includes(q.id));

  return (
    <Panel
      className="flex-1"
      title="Misiones"
      headerExtra={
        <span className="text-[10px] opacity-70 normal-case tracking-normal">
          {done.length}/{QUESTS.length}
        </span>
      }
      bodyClassName="overflow-y-auto px-2 py-1.5"
    >
      {active.length === 0 && (
        <div className="text-[11px] italic text-[#6b5840] py-2 px-1 leading-snug">
          Visita las zonas en el mapa y pulsa la <span className="font-bold text-[#c9a44a]">¡</span>{' '}
          amarilla para aceptar sus misiones.
        </div>
      )}

      {active.map((q) => {
        const prog = state.questProgress[q.id] ?? 0;
        const pct = Math.min(100, (prog / q.need) * 100);
        const complete = prog >= q.need;
        const reachOk = q.type === 'reach' && state.unlockedLocs.includes(q.loc);
        const actualComplete = complete || reachOk;
        const actualPct = actualComplete ? 100 : pct;

        return (
          <div key={q.id} className="py-1.5 border-b border-black/5">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[Cinzel] font-semibold text-[#2c1c10] leading-tight">
                  {q.name}
                </div>
                <div className="text-[11px] text-[#6b5840] leading-snug">{q.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <div className="text-[10px] font-[Cinzel] font-semibold whitespace-nowrap leading-none">
                  {q.reward.gold ? (
                    <span className="text-[#c9a44a]">+{q.reward.gold}g</span>
                  ) : null}
                  {q.reward.gold && q.reward.mithril ? ' ' : null}
                  {q.reward.mithril ? (
                    <span className="text-[#5a8aa8]">+{q.reward.mithril}m</span>
                  ) : null}
                </div>
                {actualComplete && !state.questsDone.includes(q.id) && (
                  <button
                    type="button"
                    className="text-[10px] font-[Cinzel] font-bold px-2 py-0.5 rounded bg-gradient-to-b from-[#c9a44a] to-[#a08030] border border-[#8a7020] text-[#1a1000] uppercase tracking-wide hover:brightness-110 whitespace-nowrap leading-none"
                    onClick={() => claim(q.id)}
                  >
                    Reclamar
                  </button>
                )}
              </div>
            </div>
            <div className="h-2.5 bg-black/10 rounded relative overflow-hidden mt-1">
              <div
                className="h-full rounded transition-[width]"
                style={{
                  width: `${actualPct}%`,
                  background: actualComplete ? '#3a7a3a' : '#6a80a8',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-white font-[Cinzel] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                {actualComplete ? '¡Completada!' : `${Math.floor(prog)}/${q.need}`}
              </div>
            </div>
          </div>
        );
      })}
      {done.length > 0 && (
        <div className="mt-2 opacity-40">
          <div className="text-[10px] font-[Cinzel] text-[#6b5840] tracking-wider mb-1">
            COMPLETADAS
          </div>
          {done.map((q) => (
            <div key={q.id} className="text-[11px] py-0.5 line-through text-[#6b5840]">
              {q.name}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
