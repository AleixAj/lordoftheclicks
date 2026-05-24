import type { ReactNode } from 'react';
import { xpForLevel } from '@/engine/store';
import type { GameState } from '@/types/game';
import styles from '@/styles/currency.module.css';
import { ForgeButton } from './ForgeButton';

const integerFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

const formatInteger = (value: number) => integerFormatter.format(Math.floor(value));

interface CurrencyBarProps {
  state: GameState;
  onOpenForge: () => void;
}

export function CurrencyBar({ state, onOpenForge }: CurrencyBarProps) {
  const xpNeeded = xpForLevel(state.level);
  const xpPct = (state.xp / xpNeeded) * 100;
  const forgeLocked = !state.forgeUnlocked;
  const forgeHighlight = state.forgeUnlocked && !state.forgeSeen;
  const goldValue = formatInteger(state.gold);

  return (
    <div className={styles.bar}>
      <ForgeButton
        locked={forgeLocked}
        highlight={forgeHighlight}
        onClick={onOpenForge}
        className={styles.forgeButtonDesktopOnly}
      />
      <Currency iconSrc="/gold-button.png" iconAlt="Oro" value={goldValue} label="Oro" />
      <Currency
        iconSrc="/mithril-button.png"
        iconAlt="Mithril"
        value={formatInteger(state.mithril)}
        label="Mithril"
      />
      <Currency
        iconSrc="/level-button.png"
        iconAlt="Nivel"
        value={`Nivel ${state.level}`}
        valueMini={`Lvl ${state.level}`}
      >
        <div className={styles.xpTrack}>
          <div className={styles.xpFill} style={{ width: `${xpPct}%` }} />
        </div>
      </Currency>
      <Currency
        iconSrc="/kills-button.png"
        iconAlt="Enemigos derrotados"
        value={formatInteger(state.totalKills)}
        label="Enemigos"
      />
    </div>
  );
}

interface CurrencyProps {
  iconSrc: string;
  iconAlt: string;
  value: string;
  /** Optional shorter form used on mobile (e.g. "Lvl 50" instead of "Nivel 50"). */
  valueMini?: string;
  label?: string;
  children?: ReactNode;
}

function Currency({ iconSrc, iconAlt, value, valueMini, label, children }: CurrencyProps) {
  return (
    <div className={styles.currency}>
      <img src={iconSrc} alt={iconAlt} className={styles.icon} draggable={false} />
      <div className={styles.body}>
        <div className={styles.value}>
          {valueMini ? (
            <>
              <span data-form="full">{value}</span>
              <span data-form="mini">{valueMini}</span>
            </>
          ) : (
            value
          )}
        </div>
        {label && <div className={styles.label}>{label}</div>}
        {children}
      </div>
    </div>
  );
}
