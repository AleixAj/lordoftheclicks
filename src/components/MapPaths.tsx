import { memo } from 'react';
import { LOCATIONS } from '@/data';
import type { LocationId } from '@/types/game';
import styles from '@/styles/map.module.css';

interface MapPathsProps {
  unlocked: readonly LocationId[];
}

function MapPathsImpl({ unlocked }: MapPathsProps) {
  const set = new Set(unlocked);
  return (
    <svg className={styles.overlay} viewBox="0 0 100 100" preserveAspectRatio="none">
      {LOCATIONS.map((l, i) => {
        if (i === 0) return null;
        const prev = LOCATIONS[i - 1];
        const visited = set.has(l.id) && set.has(prev.id);
        return (
          <line
            key={l.id}
            x1={prev.pos[0]}
            y1={prev.pos[1]}
            x2={l.pos[0]}
            y2={l.pos[1]}
            stroke={visited ? '#ffd700' : '#7a6a30'}
            strokeWidth={visited ? '1.2' : '0.8'}
            opacity={visited ? 0.9 : 0.55}
            strokeDasharray={visited ? '0' : '2,2'}
            vectorEffect="non-scaling-stroke"
            style={{
              filter: visited ? 'drop-shadow(0 0 2px rgba(255,215,0,0.6))' : 'none',
            }}
          />
        );
      })}
    </svg>
  );
}

export const MapPaths = memo(MapPathsImpl);
