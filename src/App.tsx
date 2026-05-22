import { useGameStore } from '@/engine/store';
import { useGameLoop } from '@/hooks/useGameLoop';
import { BattlePanel } from '@/components/BattlePanel';
import { CompanionsPanel } from '@/components/CompanionsPanel';
import { CurrencyBar } from '@/components/CurrencyBar';
import { EquipmentPanel } from '@/components/EquipmentPanel';
import { MapPanel } from '@/components/MapPanel';
import { QuestsPanel } from '@/components/QuestsPanel';
import { ShopPanel } from '@/components/ShopPanel';

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
        <h1 className="font-[Aniron,MedievalSharp,Cinzel_Decorative,serif] text-[30px] font-normal normal-case tracking-[2px] text-[#c9a44a] leading-none [text-shadow:0_0_30px_rgba(201,164,74,0.3),0_2px_4px_rgba(0,0,0,0.6)]">
          Lord of the Clicks
        </h1>
        <div className="absolute right-2 flex gap-1">
          {isDev && (
            <>
              <button
                type="button"
                onClick={unlockAll}
                className="px-2 py-0.5 text-[11px] border border-[#7a6a30] text-[#c9a44a] rounded opacity-60 hover:opacity-100 font-[Crimson_Pro]"
                title="Dev: desbloquear todas las ubicaciones"
              >
                ⚙ Unlock all
              </button>
              <button
                type="button"
                onClick={completeCurrentZone}
                className="px-2 py-0.5 text-[11px] border border-[#7a6a30] text-[#c9a44a] rounded opacity-70 hover:opacity-100 font-[Crimson_Pro]"
                title="Dev: completar la zona actual (boss derrotado, siguiente zona desbloqueada)"
              >
                ⏭ Complete zone
              </button>
              <button
                type="button"
                onClick={completeAll}
                className="px-2 py-0.5 text-[11px] border border-[#7a6a30] text-[#3a7a3a] rounded opacity-70 hover:opacity-100 font-[Crimson_Pro]"
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
            className="px-2 py-0.5 border border-[#7a6a30] text-[#c9a44a] rounded opacity-50 hover:opacity-100 font-[Crimson_Pro]"
            title="Reiniciar partida"
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
