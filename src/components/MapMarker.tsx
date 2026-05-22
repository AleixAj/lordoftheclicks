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
  /** When true, an informational "!" badge appears under the dot. */
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
            background: isCurrent
              ? '#ffd700'
              : isComplete
                ? '#4a9a4a'
                : unlocked
                  ? '#c9a44a'
                  : 'rgba(60, 50, 30, 0.85)',
            borderColor: isCurrent ? '#fff' : unlocked ? '#8a7430' : '#5a4a20',
            boxShadow: isCurrent
              ? '0 0 12px rgba(255,215,0,0.7)'
              : unlocked
                ? '0 0 6px rgba(0,0,0,0.6)'
                : '0 0 4px rgba(0,0,0,0.7)',
            opacity: unlocked ? 1 : 0.7,
          }}
        />
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
      {hasQuest && (
        <span
          className={styles.questBadge}
          aria-hidden="true"
          title={`${loc.name} tiene misiones pendientes`}
          style={{
            width: Math.max(14, 12 * scale),
            height: Math.max(14, 12 * scale),
            fontSize: Math.max(10, 10 * scale),
            top: scaled * 0.45,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          !
        </span>
      )}
    </div>
  );
}

export const MapMarker = memo(MapMarkerImpl);
