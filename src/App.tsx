import { useRef, useState, type ReactNode } from 'react';
import { downloadSaveFile, hasExistingSave, importSaveFile } from '@/engine/persistence';
import { useGameStore } from '@/engine/store';
import { useGameLoop } from '@/hooks/useGameLoop';
import { BattlePanel } from '@/components/BattlePanel';
import { CompanionsPanel } from '@/components/CompanionsPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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
const resetButtonClass = `${headerButtonClass} border-[#c95a4a]/80 text-[#ffb29a] hover:border-[#ff8a72] hover:text-[#ffd6c4] shadow-[0_0_12px_rgba(201,90,74,0.32),inset_0_1px_0_rgba(255,255,255,0.12)]`;
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
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
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
  const downloadCurrentSave = () => {
    downloadSaveFile(useGameStore.getState().state);
    closeMenu();
  };
  const openImportPicker = () => importInputRef.current?.click();
  const importSelectedSave = async (file: File | undefined) => {
    if (!file) return;
    try {
      await importSaveFile(file);
      window.location.reload();
    } catch {
      alert('No se ha podido importar la partida. Comprueba que el archivo sea válido.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
      closeMenu();
    }
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
          className={`${headerButtonClass} ${styles.settingsToggle}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="header-actions"
          aria-label="Ajustes"
          hidden={openDrawer !== null}
        >
          <svg
            className={styles.settingsIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M19.14 12.94a7.49 7.49 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.31 7.31 0 0 0-1.63-.95L14.4 2.81a.5.5 0 0 0-.5-.42h-3.8a.5.5 0 0 0-.5.42l-.34 2.5a7.34 7.34 0 0 0-1.63.95l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.49 7.49 0 0 0 0 1.88L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96a7.34 7.34 0 0 0 1.63.95l.34 2.5a.5.5 0 0 0 .5.42h3.8a.5.5 0 0 0 .5-.42l.34-2.5a7.31 7.31 0 0 0 1.63-.95l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z"
            />
          </svg>
          <span className={styles.settingsLabel}>Ajustes</span>
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
          <input
            ref={importInputRef}
            type="file"
            accept=".txt,text/plain"
            className={styles.hiddenFileInput}
            onChange={(event) => void importSelectedSave(event.currentTarget.files?.[0])}
          />
          <MenuAction
            icon={<DownloadIcon />}
            label="Descargar partida"
            onClick={downloadCurrentSave}
          />
          <MenuAction icon={<UploadIcon />} label="Importar partida" onClick={openImportPicker} />
          <MenuAction
            icon={<UnlockIcon />}
            label="Desbloquear todas las zonas"
            onClick={runAndClose(unlockAll)}
            className={`${devHeaderButtonClass} ${styles.devAction}`}
            title="Test: desbloquear todas las ubicaciones"
          />
          <MenuAction
            icon={<CoinIcon />}
            label="+1.000.000 oro y mithril"
            onClick={runAndClose(() => giveGold(1_000_000))}
            className={`${devHeaderButtonClass} ${styles.devAction}`}
            title="Test: añadir 1.000.000 de oro y 1.000.000 de mithril"
          />
          <MenuAction
            icon={<SkipIcon />}
            label="Completar zona actual"
            onClick={runAndClose(completeCurrentZone)}
            className={`${devHeaderButtonClass} ${styles.devAction}`}
            title="Test: completar la zona actual (boss derrotado, siguiente zona desbloqueada)"
          />
          <MenuAction
            icon={<StarIcon />}
            label="Completar juego entero"
            onClick={runAndClose(completeAll)}
            className={`${devHeaderButtonClass} ${styles.devAction} border-[#7fc36d]/80 text-[#b8f0a8] shadow-[0_0_12px_rgba(127,195,109,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#b8f0a8] hover:text-[#dcffd2]`}
            title="Test: simular partida completada (bosses, items, compañeros, oro)"
          />
          <MenuAction
            icon={<RestartIcon />}
            label="Reiniciar partida"
            onClick={() => {
              closeMenu();
              setResetConfirmOpen(true);
            }}
            className={`${resetButtonClass} ${styles.devAction}`}
            title="Reiniciar partida"
          />
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
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reiniciar partida"
        message={
          <>
            Vas a borrar tu progreso actual: oro, mithril, compañeros, equipo y mejoras de la Forja.
            Esta acción <strong>no se puede deshacer</strong>.
          </>
        }
        confirmLabel="Reiniciar"
        cancelLabel="Cancelar"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          setResetConfirmOpen(false);
          resetGame();
          onReset();
        }}
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

        <ul className={styles.welcomeHighlights} aria-label="Características del juego">
          <li>Combate clicker</li>
          <li>Todos los personajes</li>
          <li>Mapa de la Tierra Media</li>
          <li>Bosses y semi-bosses</li>
          <li>Forja de Rivendel</li>
          <li>Misiones por zona</li>
          <li>Equipo legendario</li>
          <li>Oro y mithril</li>
        </ul>

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
        className={`${headerButtonClass} min-w-9 px-2 text-[18px] leading-none text-[#ffdf7a]`}
        onClick={onClose}
        aria-label="Cerrar panel"
      >
        ×
      </button>
    </div>
  );
}

interface MenuActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  title?: string;
}

function MenuAction({ icon, label, onClick, className, title }: MenuActionProps) {
  const finalClassName = className ?? `${headerButtonClass} ${styles.devAction}`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${finalClassName} ${styles.menuAction}`}
      title={title}
    >
      <span className={styles.menuActionIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.menuActionLabel}>{label}</span>
    </button>
  );
}

const iconBase = {
  className: styles.menuActionSvg,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
} as const;

function DownloadIcon() {
  return (
    <svg {...iconBase}>
      <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-3 5-5h-3V4h-4v8H7l5 5Z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg {...iconBase}>
      <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-17-5 5h3v8h4v-8h3l-5-5Z" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg {...iconBase}>
      <path
        fill="currentColor"
        d="M18 8h-1V6a5 5 0 0 0-9.9-1h2.02A3 3 0 0 1 15 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 9a2 2 0 1 1 2-2 2 2 0 0 1-2 2Z"
      />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg {...iconBase}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm.9 14.4v1.6h-1.7v-1.5a4.3 4.3 0 0 1-3-1.4l1.2-1.3a3 3 0 0 0 2.4 1.1c1 0 1.6-.5 1.6-1.2 0-.6-.4-1-1.7-1.4-2-.6-3-1.5-3-3 0-1.4 1-2.5 2.6-2.8V5h1.7v1.5a3.7 3.7 0 0 1 2.6 1.3l-1.2 1.3a2.5 2.5 0 0 0-2-1c-1 0-1.5.4-1.5 1.1s.5 1 1.7 1.4c2 .6 3 1.5 3 3.1 0 1.5-1.1 2.6-2.7 2.8Z"
      />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg {...iconBase}>
      <path fill="currentColor" d="M6 5v14l8-7-8-7Zm10 0h2v14h-2V5Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg {...iconBase}>
      <path
        fill="currentColor"
        d="M12 2 9.2 8.6 2 9.3l5.5 4.7L5.8 21 12 17.3 18.2 21l-1.7-7 5.5-4.7-7.2-.7L12 2Z"
      />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg {...iconBase}>
      <path fill="currentColor" d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z" />
    </svg>
  );
}
