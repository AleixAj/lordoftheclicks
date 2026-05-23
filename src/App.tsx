import { useGameStore } from '@/engine/store';
import { useGameLoop } from '@/hooks/useGameLoop';
import { BattlePanel } from '@/components/BattlePanel';
import { CompanionsPanel } from '@/components/CompanionsPanel';
import { CurrencyBar } from '@/components/CurrencyBar';
import { EquipmentPanel } from '@/components/EquipmentPanel';
import { MapPanel } from '@/components/MapPanel';
import { QuestsPanel } from '@/components/QuestsPanel';
import { ShopPanel } from '@/components/ShopPanel';

const headerButtonClass =
  'min-h-9 px-3 py-1.5 rounded-md border border-[#c9a44a]/80 bg-[#1e1a14]/95 text-[12px] font-[Cinzel] font-extrabold tracking-wide text-[#f4d47a] shadow-[0_0_12px_rgba(201,164,74,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:scale-[1.03] hover:border-[#f4d47a] hover:bg-[#2a2117] hover:text-[#ffe89a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d47a]';
const devHeaderButtonClass = `${headerButtonClass} uppercase`;
const resetButtonClass = `${headerButtonClass} min-w-9 px-2 text-[18px] leading-none text-[#ffdf7a]`;

export function App() {
  useGameLoop();
  const state = useGameStore((s) => s.state);
  const resetGame = useGameStore((s) => s.resetGame);
  const unlockAll = useGameStore((s) => s.unlockAll);
  const completeAll = useGameStore((s) => s.completeAll);
  const completeCurrentZone = useGameStore((s) => s.completeCurrentZone);
  const isDev = import.meta.env.DEV;

  return (
    <div className="flex flex-col h-screen w-screen p-1 gap-1">
      <header className="relative flex items-center justify-center py-1">
        <h1 className="app-title text-[34px] font-normal normal-case tracking-[2px] text-[#c9a44a] leading-none [text-shadow:0_0_30px_rgba(201,164,74,0.3),0_2px_4px_rgba(0,0,0,0.6)]">
          Lord of the Clicks
        </h1>
        <div className="absolute right-2 flex items-center gap-2">
          {isDev && (
            <>
              <button
                type="button"
                onClick={unlockAll}
                className={devHeaderButtonClass}
                title="Dev: desbloquear todas las ubicaciones"
              >
                ⚙ Unlock all
              </button>
              <button
                type="button"
                onClick={completeCurrentZone}
                className={devHeaderButtonClass}
                title="Dev: completar la zona actual (boss derrotado, siguiente zona desbloqueada)"
              >
                ⏭ Complete zone
              </button>
              <button
                type="button"
                onClick={completeAll}
                className={`${devHeaderButtonClass} border-[#7fc36d]/80 text-[#b8f0a8] shadow-[0_0_12px_rgba(127,195,109,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#b8f0a8] hover:text-[#dcffd2]`}
                title="Dev: simular partida completada (bosses, items, compañeros, oro)"
              >
                ★ Complete game
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Reiniciar partida? Perderás todo el progreso.')) resetGame();
            }}
            className={resetButtonClass}
            title="Reiniciar partida"
            aria-label="Reiniciar partida"
          >
            ↺
          </button>
        </div>
      </header>

      <CurrencyBar state={state} />

      <main className="grid grid-cols-[340px_1fr_340px] gap-1 flex-1 min-h-0">
        <aside className="flex flex-col gap-1 min-h-0">
          <CompanionsPanel />
          <EquipmentPanel />
        </aside>
        <section className="flex flex-col gap-1 min-h-0">
          <BattlePanel />
          <MapPanel />
        </section>
        <aside className="flex flex-col gap-1 min-h-0">
          <QuestsPanel />
          <ShopPanel />
        </aside>
      </main>
    </div>
  );
}
