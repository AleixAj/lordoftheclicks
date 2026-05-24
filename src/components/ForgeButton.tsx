import styles from '@/styles/currency.module.css';

interface ForgeButtonProps {
  locked: boolean;
  highlight: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Glowing "Forja" button. Re-used in the top currency bar on desktop and
 * inside the mobile drawer toggles on mobile so the player always has it
 * within thumb reach without doubling its visual weight.
 */
export function ForgeButton({ locked, highlight, onClick, className = '' }: ForgeButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.forgeButton} ${locked ? styles.forgeButtonLocked : ''} ${
        highlight ? styles.forgeButtonHighlight : ''
      } ${className}`}
      onClick={onClick}
      disabled={locked}
      aria-disabled={locked}
      title={
        locked
          ? 'La Forja de Rivendel todavía no está disponible. Llega a Rivendel para desbloquearla.'
          : 'Abrir la Forja de Rivendel'
      }
    >
      <img
        src="/forge-icon.png"
        alt=""
        aria-hidden="true"
        className={styles.forgeIcon}
        draggable={false}
      />
      <span>Forja</span>
    </button>
  );
}
