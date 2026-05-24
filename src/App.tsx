import { useState } from 'react';
import { hasExistingSave } from '@/engine/persistence';
import { useGameStore } from '@/engine/store';
import { useGameLoop } from '@/hooks/useGameLoop';
import { BattlePanel } from '@/components/BattlePanel';
import { CompanionsPanel } from '@/components/CompanionsPanel';
import { CurrencyBar } from '@/components/CurrencyBar';
import { EquipmentPanel } from '@/components/EquipmentPanel';
import { ForgeButton } from '@/components/ForgeButton';
import { ForgeModal } from '@/components/ForgeModal';
import { MapPanel } from '@/components/MapPanel';
import { QuestsPanel } from '@/components/QuestsPanel';
import { ShopPanel } from '@/components/ShopPanel';
import styles from '@/styles/app.module.css';

const headerButtonClass =
  'min-h-9 px-3 py-1.5 rounded-md border border-[#c9a44a]/80 bg-[#1e1a14]/95 text-[12px] font-[Cinzel] font-extrabold tracking-wide text-[#f4d47a] shadow-[0_0_12px_rgba(201,164,74,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:scale-[1.03] hover:border-[#f4d47a] hover:bg-[#2a2117] hover:text-[#ffe89a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d47a]';
const devHeaderButtonClass = `${headerButtonClass} uppercase`;
const resetButtonClass = `${headerButtonClass} min-w-9 px-2 text-[18px] leading-none text-[#ffdf7a]`;
type DrawerSide = 'left' | 'right';

export function App() {
  // Returning players skip the welcome screen so the DPS loop mounts on refresh.
  const [hasStarted, setHasStarted] = useState(() => hasExistingSave());
  useGameLoop(hasStarted);

  if (!hasStarted) {
    return <WelcomeScreen onStart={() => setHasStarted(true)} />;
  }

  return <GameShell onReset={() => setHasStarted(false)} />;
}

function GameShell({ onReset }: { onReset: () => void }) {
  const [openDrawer, setOpenDrawer] = useState<DrawerSide | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [forgeOpen, setForgeOpen] = useState(false);
  const state = useGameStore((s) => s.state);
  const resetGame = useGameStore((s) => s.resetGame);
  const unlockAll = useGameStore((s) => s.unlockAll);
  const completeAll = useGameStore((s) => s.completeAll);
  const completeCurrentZone = useGameStore((s) => s.completeCurrentZone);
  const giveGold = useGameStore((s) => s.giveGold);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const resetUpgrades = useGameStore((s) => s.resetUpgrades);
  const markForgeSeen = useGameStore((s) => s.markForgeSeen);
  const dismissForgeUnlockFlash = useGameStore((s) => s.dismissForgeUnlockFlash);

  const openForge = () => {
    if (!state.forgeUnlocked) return;
    setForgeOpen(true);
    markForgeSeen();
    dismissForgeUnlockFlash();
  };

  const closeMenu = () => setMenuOpen(false);
  const runAndClose = (fn: () => void) => () => {
    fn();
    closeMenu();
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1
          className={`app-title ${styles.title} font-normal normal-case tracking-[2px] text-[#c9a44a] leading-none [text-shadow:0_0_30px_rgba(201,164,74,0.3),0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          Lord of the click<span className={styles.titleBigS}>S</span>
        </h1>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="header-actions"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          hidden={openDrawer !== null}
        >
          <span className={styles.menuToggleBars} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        {menuOpen && (
          <button
            type="button"
            className={styles.menuOverlay}
            onClick={closeMenu}
            aria-label="Cerrar menú"
          />
        )}
        <div
          id="header-actions"
          className={`${styles.headerActions} ${menuOpen ? styles.headerActionsOpen : ''}`}
        >
          <button
            type="button"
            onClick={runAndClose(unlockAll)}
            className={`${devHeaderButtonClass} ${styles.devAction}`}
            title="Test: desbloquear todas las ubicaciones"
          >
            ⚙ Desbloq
          </button>
          <button
            type="button"
            onClick={runAndClose(() => giveGold(1_000_000))}
            className={`${devHeaderButtonClass} ${styles.devAction}`}
            title="Test: añadir 1.000.000 de oro y 1.000.000 de mithril"
          >
            ⛀ +1M G/M
          </button>
          <button
            type="button"
            onClick={runAndClose(completeCurrentZone)}
            className={`${devHeaderButtonClass} ${styles.devAction}`}
            title="Test: completar la zona actual (boss derrotado, siguiente zona desbloqueada)"
          >
            ⏭ Zona
          </button>
          <button
            type="button"
            onClick={runAndClose(completeAll)}
            className={`${devHeaderButtonClass} ${styles.devAction} border-[#7fc36d]/80 text-[#b8f0a8] shadow-[0_0_12px_rgba(127,195,109,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#b8f0a8] hover:text-[#dcffd2]`}
            title="Test: simular partida completada (bosses, items, compañeros, oro)"
          >
            ★ Juego
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Reiniciar partida? Perderás todo el progreso.')) {
                resetGame();
                onReset();
              }
            }}
            className={resetButtonClass}
            title="Reiniciar partida"
            aria-label="Reiniciar partida"
          >
            ↺
          </button>
        </div>
      </header>

      <CurrencyBar state={state} onOpenForge={openForge} />

      <main className={styles.layout}>
        <aside className={styles.sideColumn}>
          <CompanionsPanel />
          <EquipmentPanel />
        </aside>

        <section className={styles.mainColumn}>
          <div className={styles.mobileActions} aria-label="Paneles secundarios">
            <button
              type="button"
              className={headerButtonClass}
              onClick={() => {
                setMenuOpen(false);
                setOpenDrawer((current) => (current === 'left' ? null : 'left'));
              }}
              aria-expanded={openDrawer === 'left'}
              aria-controls="left-drawer"
            >
              Inventario
            </button>
            <ForgeButton
              locked={!state.forgeUnlocked}
              highlight={state.forgeUnlocked && !state.forgeSeen}
              onClick={openForge}
              className={styles.mobileForgeButton}
            />
            <button
              type="button"
              className={headerButtonClass}
              onClick={() => {
                setMenuOpen(false);
                setOpenDrawer((current) => (current === 'right' ? null : 'right'));
              }}
              aria-expanded={openDrawer === 'right'}
              aria-controls="right-drawer"
            >
              Misiones
            </button>
          </div>
          <BattlePanel />
          <MapPanel />
        </section>

        <aside className={styles.sideColumn}>
          <QuestsPanel />
          <ShopPanel />
        </aside>
      </main>

      {openDrawer && (
        <button
          type="button"
          className={styles.drawerOverlay}
          onClick={() => setOpenDrawer(null)}
          aria-label="Cerrar panel"
        />
      )}

      {openDrawer === 'left' && (
        <aside
          id="left-drawer"
          className={`${styles.drawer} ${styles.drawerLeft}`}
          aria-label="Inventario y equipamiento"
        >
          <DrawerHeader title="Inventario" onClose={() => setOpenDrawer(null)} />
          <div className={styles.drawerStack}>
            <CompanionsPanel />
            <EquipmentPanel />
          </div>
        </aside>
      )}

      {openDrawer === 'right' && (
        <aside
          id="right-drawer"
          className={`${styles.drawer} ${styles.drawerRight}`}
          aria-label="Misiones y tienda"
        >
          <DrawerHeader title="Misiones" onClose={() => setOpenDrawer(null)} />
          <div className={styles.drawerStack}>
            <QuestsPanel />
            <ShopPanel />
          </div>
        </aside>
      )}
      <ForgeModal
        open={forgeOpen}
        mithril={state.mithril}
        upgrades={state.upgrades}
        onBuy={buyUpgrade}
        onReset={resetUpgrades}
        onClose={() => setForgeOpen(false)}
      />
    </div>
  );
}

interface WelcomeScreenProps {
  onStart: () => void;
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <main className={styles.welcomeShell}>
      <section className={styles.welcomeCard} aria-labelledby="welcome-title">
        <img
          src="/onering-gif.gif"
          alt=""
          aria-hidden="true"
          className={styles.welcomeSigil}
          draggable={false}
        />
        <h1 id="welcome-title" className={`app-title ${styles.welcomeTitle}`}>
          Lord of the click<span className={styles.titleBigS}>S</span>
        </h1>
        <p className={styles.welcomeKicker}>Un viaje incremental por la Tierra Media</p>
        <p className={styles.welcomeLead}>
          Recluta compañeros, derrota criaturas legendarias, equipa reliquias y avanza zona a zona
          hasta las sombras de Mordor.
        </p>

        <div className={styles.welcomeHighlights} aria-label="Características del juego">
          <div>
            <span>Combate clicker</span>
            <strong>Golpea, sube DPS y desafía jefes con temporizador.</strong>
          </div>
          <div>
            <span>Compañía</span>
            <strong>Recluta héroes, mejora niveles y combina equipo.</strong>
          </div>
          <div>
            <span>Exploración</span>
            <strong>Viaja por el mapa, desbloquea misiones y nuevas tiendas.</strong>
          </div>
        </div>

        <button type="button" className={styles.welcomeStart} onClick={onStart}>
          Empezar aventura
        </button>
      </section>
    </main>
  );
}

interface DrawerHeaderProps {
  title: string;
  onClose: () => void;
}

function DrawerHeader({ title, onClose }: DrawerHeaderProps) {
  return (
    <div className={styles.drawerHeader}>
      <span>{title}</span>
      <button
        type="button"
        className={resetButtonClass}
        onClick={onClose}
        aria-label="Cerrar panel"
      >
        ×
      </button>
    </div>
  );
}
