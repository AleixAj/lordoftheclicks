import type { CSSProperties } from 'react';
import { getBonusVsEntries } from '@/lib/equipmentText';
import panelStyles from '@/styles/panel.module.css';
import type { ShopItem } from '@/types/game';

interface BonusVsChipsProps {
  item: Pick<ShopItem, 'bonusVs'>;
  className?: string;
  chipClassName?: string;
  /**
   * When true and the item has no bonuses, render an invisible placeholder
   * chip so cards stay vertically aligned in a row (e.g. shop grids where
   * one item has a bonus and the other doesn't).
   */
  reserveSpace?: boolean;
}

export function BonusVsChips({
  item,
  className = '',
  chipClassName = '',
  reserveSpace = false,
}: BonusVsChipsProps) {
  const bonuses = getBonusVsEntries(item);
  if (!bonuses.length) {
    if (!reserveSpace) return null;
    return (
      <div className={`${panelStyles.bonusChips} ${className}`} aria-hidden="true">
        <span
          className={`${panelStyles.bonusChip} ${chipClassName}`}
          style={{ visibility: 'hidden' }}
        >
          <span className={panelStyles.bonusChipPct}>+0%</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`${panelStyles.bonusChips} ${className}`}>
      {bonuses.map((bonus) => (
        <span
          key={bonus.type}
          className={`${panelStyles.bonusChip} ${chipClassName}`}
          style={
            {
              '--bonus-bg': bonus.color.bg,
              '--bonus-border': bonus.color.border,
              '--bonus-text': bonus.color.text,
            } as CSSProperties
          }
          title={`+${bonus.pct}% daño vs ${bonus.label}`}
        >
          <span className={panelStyles.bonusChipPct}>+{bonus.pct}%</span>
          <span className={panelStyles.bonusChipType}>
            <span data-form="full">{bonus.abbr}</span>
            <span data-form="mini">{bonus.abbr1}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
