import { useEffect, useRef } from 'react';
import { LOCATIONS } from '@/data';
import { useGameStore } from '@/engine/store';
import { useMapInteraction } from '@/hooks/useMapInteraction';
import { Panel } from './Panel';
import styles from '@/styles/map.module.css';

const MAP_ASPECT = 3000 / 1713;
const DEFAULT_ZOOM = 4.3;
const MAP_SRC = '/middle-earth-map.jpg';

export function MapPanel() {
  const state = useGameStore((s) => s.state);
  const travelTo = useGameStore((s) => s.travelTo);

  const map = useMapInteraction({ mapAspect: MAP_ASPECT, defaultZoom: DEFAULT_ZOOM });
  const didInit = useRef(false);

  const loc = LOCATIONS[state.locIdx];

  useEffect(() => {
    if (!loc || map.containerSize.w < 50) return;
    if (!didInit.current) {
      didInit.current = true;
      map.centerOn(loc.id, DEFAULT_ZOOM);
    } else {
      map.centerOn(loc.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.locIdx, map.containerSize.w, map.containerSize.h]);

  const handleMarkerClick = (i: number, unlocked: boolean) => (e: React.MouseEvent) => {
    if (map.wasDragged()) {
      e.stopPropagation();
      return;
    }
    if (unlocked) travelTo(i);
  };

  const markerScale = map.isOverview
    ? 0.45
    : Math.max(0.5, Math.min(1.4, 0.35 + map.zoom * 0.16));

  return (
    <Panel
      className={styles.map}
      title="Mapa de la Tierra Media"
      bodyClassName="p-0"
      headerExtra={
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => map.centerOn(loc.id, DEFAULT_ZOOM)}
            className="px-2 py-0.5 text-[10px] border border-[#7a6a30] text-[#c9a44a] rounded opacity-70 hover:opacity-100 font-[Crimson_Pro]"
            title="Centrar en localización actual"
          >
            ⊙ Centrar
          </button>
          <button
            type="button"
            onClick={map.fitToScreen}
            className="px-2 py-0.5 text-[10px] border border-[#7a6a30] text-[#c9a44a] rounded opacity-70 hover:opacity-100 font-[Crimson_Pro]"
            title="Ver mapa completo"
          >
            ⊖ Ver todo
          </button>
        </div>
      }
    >
      <div
        ref={map.containerRef}
        className={styles.viewport}
        style={{ cursor: map.isDragging ? 'grabbing' : 'grab' }}
        {...map.handlers}
      >
        <div
          className={styles.inner}
          style={{
            width: map.displaySize.w,
            height: map.displaySize.h,
            transform: `translate(${map.offset.x}px, ${map.offset.y}px)`,
            transition: map.transitioning
              ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'none',
          }}
        >
          <img src={MAP_SRC} className={styles.image} draggable={false} alt="Tierra Media" />

          <svg className={styles.overlay} viewBox="0 0 100 100" preserveAspectRatio="none">
            {LOCATIONS.map((l, i) => {
              if (i === 0) return null;
              const prev = LOCATIONS[i - 1];
              const visited =
                state.unlockedLocs.includes(l.id) && state.unlockedLocs.includes(prev.id);
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

          {LOCATIONS.map((l, i) => {
            const unlocked = state.unlockedLocs.includes(l.id);
            const isCurrent = i === state.locIdx;
            const isComplete = unlocked && (state.locKills[l.id] ?? 0) >= l.killsNeeded;
            const dotSize = isCurrent ? 24 : unlocked ? 18 : 12;
            const scaled = dotSize * markerScale;
            return (
              <button
                key={l.id}
                type="button"
                className={styles.marker}
                onClick={handleMarkerClick(i, unlocked)}
                disabled={!unlocked}
                title={unlocked ? l.name : `${l.name} (bloqueado)`}
                aria-label={unlocked ? `Viajar a ${l.name}` : `${l.name} (bloqueado)`}
                style={{
                  left: `${l.pos[0]}%`,
                  top: `${l.pos[1]}%`,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  zIndex: isCurrent ? 10 : 1,
                  background: 'transparent',
                  border: 'none',
                }}
              >
                {isCurrent && (
                  <span
                    className={styles.pulse}
                    style={{ width: scaled * 2.5, height: scaled * 2.5 }}
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
                {isCurrent && !map.isOverview && unlocked && (
                  <span
                    className={styles.label}
                    style={{
                      fontSize: Math.max(9, 11 * markerScale),
                      top: -(scaled / 2 + 12 * markerScale),
                    }}
                  >
                    {l.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.locOverlay}>
          <div className={styles.locName}>{loc.name}</div>
          <div className={styles.locDesc}>{loc.desc}</div>
        </div>

        {map.hoverCoord && (
          <div className={styles.coord} aria-hidden="true">
            [{map.hoverCoord.x}, {map.hoverCoord.y}]
          </div>
        )}

        <div className={styles.zoom} aria-hidden="true">
          {map.zoom.toFixed(1)}x
        </div>
      </div>
    </Panel>
  );
}
