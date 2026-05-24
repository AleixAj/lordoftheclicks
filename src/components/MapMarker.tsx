import { memo } from 'react';
import type { Location } from '@/types/game';
import styles from '@/styles/map.module.css';

interface MapMarkerProps {
  loc: Location;
  index: number;
  isCurrent: boolean;
  unlocked: boolean;
  isComplete: boolean;
  scale: number;
  showLabel: boolean;
  /** When true, an informational "!" badge appears over the dot. */
  hasQuest: boolean;
  onClick: (index: number, unlocked: boolean) => (e: React.MouseEvent) => void;
}

function MapMarkerImpl({
  loc,
  index,
  isCurrent,
  unlocked,
  isComplete,
  scale,
  showLabel,
  hasQuest,
  onClick,
}: MapMarkerProps) {
  const dotSize = isCurrent ? 24 : unlocked ? 18 : 12;
  const scaled = dotSize * scale;

  const isRest = loc.isRest === true;
  const palette = isRest
    ? { bg: '#4a9a4a', border: '#1f4d1f', glow: 'rgba(102, 200, 102, 0.55)' }
    : { bg: '#c93a3a', border: '#5a1818', glow: 'rgba(220, 80, 60, 0.55)' };

  let background: string;
  let borderColor: string;
  let boxShadow: string;
  if (isCurrent) {
    background = '#ffd700';
    borderColor = '#fff';
    boxShadow = '0 0 12px rgba(255,215,0,0.7)';
  } else if (!unlocked) {
    background = 'rgba(60, 50, 30, 0.85)';
    borderColor = '#5a4a20';
    boxShadow = '0 0 4px rgba(0,0,0,0.7)';
  } else {
    background = palette.bg;
    borderColor = palette.border;
    boxShadow = isComplete
      ? `0 0 8px ${palette.glow}, 0 0 2px rgba(255,255,255,0.85)`
      : `0 0 6px ${palette.glow}`;
  }

  return (
    <div
      className={styles.marker}
      style={{
        left: `${loc.pos[0]}%`,
        top: `${loc.pos[1]}%`,
        zIndex: isCurrent || hasQuest ? 10 : 1,
      }}
    >
      <button
        type="button"
        className={styles.markerHit}
        onClick={onClick(index, unlocked)}
        disabled={!unlocked}
        title={unlocked ? loc.name : `${loc.name} (bloqueado)`}
        aria-label={unlocked ? `Viajar a ${loc.name}` : `${loc.name} (bloqueado)`}
        style={{ cursor: unlocked ? 'pointer' : 'not-allowed' }}
      >
        {isCurrent && (
          <span
            className={styles.pulse}
            style={{ width: scaled * 1.1, height: scaled * 1.1 }}
            aria-hidden="true"
          />
        )}
        <span
          className={styles.dot}
          aria-hidden="true"
          style={{
            width: scaled,
            height: scaled,
            background: hasQuest ? 'transparent' : background,
            borderColor: hasQuest ? 'transparent' : borderColor,
            boxShadow: hasQuest ? 'none' : boxShadow,
            opacity: unlocked ? 1 : 0.7,
          }}
        />
        {hasQuest && (
          <span
            className={styles.questBadge}
            aria-hidden="true"
            title={`${loc.name} tiene misiones pendientes`}
            style={{
              width: scaled,
              height: scaled,
              fontSize: Math.max(10, scaled * 0.52),
            }}
          >
            !
          </span>
        )}
        {showLabel && (
          <span
            className={styles.label}
            style={{
              fontSize: Math.max(9, 11 * scale),
              top: -(scaled / 2 + 12 * scale),
            }}
          >
            {loc.name}
          </span>
        )}
      </button>
    </div>
  );
}

export const MapMarker = memo(MapMarkerImpl);
