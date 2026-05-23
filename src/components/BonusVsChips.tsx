import type { CSSProperties } from 'react';
import { getBonusVsEntries } from '@/lib/equipmentText';
import panelStyles from '@/styles/panel.module.css';
import type { ShopItem } from '@/types/game';

interface BonusVsChipsProps {
  item: Pick<ShopItem, 'bonusVs'>;
  className?: string;
  chipClassName?: string;
}

export function BonusVsChips({ item, className = '', chipClassName = '' }: BonusVsChipsProps) {
  const bonuses = getBonusVsEntries(item);
  if (!bonuses.length) return null;

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
