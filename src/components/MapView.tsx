import { useCallback, useEffect, useMemo, useRef } from 'react';
import { LOCATIONS, QUESTS } from '@/data';
import { useGameStore } from '@/engine/store';
import { useMapInteraction } from '@/hooks/useMapInteraction';
import { MapMarker } from './MapMarker';
import { MapPaths } from './MapPaths';
import styles from '@/styles/map.module.css';

const MAP_ASPECT = 3000 / 1713;
export const DEFAULT_MAP_ZOOM = 5.2;
const MAP_SRC = '/middle-earth-map.jpg';

interface MapViewProps {
  /** Initial zoom on first mount. */
  initialZoom?: number;
  /** When provided, an expand button is shown in the toolbar. */
  onExpand?: () => void;
  /** When provided, a close button is shown instead of expand (used inside the modal). */
  onClose?: () => void;
}

/**
 * Interactive Middle-earth map viewport: pan, zoom, animated centering,
 * coordinate badge, location markers and routes.
 */
export function MapView({ initialZoom = DEFAULT_MAP_ZOOM, onExpand, onClose }: MapViewProps) {
  const state = useGameStore((s) => s.state);
  const travelTo = useGameStore((s) => s.travelTo);

  const map = useMapInteraction({ mapAspect: MAP_ASPECT, defaultZoom: initialZoom });
  const didInit = useRef(false);

  const loc = LOCATIONS[state.locIdx];

  useEffect(() => {
    if (!loc || map.containerSize.w < 50) return;
    if (!didInit.current) {
      didInit.current = true;
      map.centerOn(loc.id, initialZoom);
    } else {
      map.centerOn(loc.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.locIdx, map.containerSize.w, map.containerSize.h]);

  // Stable handler factory: memoizing the inner click means each marker only
  // re-binds when its own props change, not on every pan.
  const handleMarkerClick = useCallback(
    (i: number, unlocked: boolean) => (e: React.MouseEvent) => {
      if (map.wasDragged()) {
        e.stopPropagation();
        return;
      }
      if (unlocked) travelTo(i);
    },
    [map, travelTo],
  );

  // Per-location set of pending quests (in unlocked zones, not yet accepted
  // and not yet done) — drives the "!" badge on each marker.
  const questsByLoc = useMemo(() => {
    const acc = new Set(state.questsAccepted);
    const done = new Set(state.questsDone);
    const unlocked = new Set(state.unlockedLocs);
    const out = new Set<string>();
    for (const q of QUESTS) {
      if (acc.has(q.id) || done.has(q.id)) continue;
      const pickup = q.pickupLoc ?? q.loc;
      if (!unlocked.has(pickup)) continue;
      out.add(pickup);
    }
    return out;
  }, [state.questsAccepted, state.questsDone, state.unlockedLocs]);

  const markerScale = map.isOverview ? 0.45 : Math.max(0.5, Math.min(1.4, 0.35 + map.zoom * 0.16));

  const unlockedSet = useMemo(() => new Set(state.unlockedLocs), [state.unlockedLocs]);

  return (
    <div
      ref={map.containerRef}
      className={styles.viewport}
      style={{ cursor: map.isDragging ? 'grabbing' : 'grab' }}
      {...map.handlers}
    >
      <div
        ref={map.innerRef}
        className={styles.inner}
        style={{
          width: map.displaySize.w,
          height: map.displaySize.h,
          transform: `translate3d(${map.offset.x}px, ${map.offset.y}px, 0)`,
          transition: map.transitioning
            ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none',
        }}
      >
        <img
          src={MAP_SRC}
          className={styles.image}
          draggable={false}
          alt="Tierra Media"
          decoding="async"
        />

        <MapPaths unlocked={state.unlockedLocs} />

        {LOCATIONS.map((l, i) => {
          const unlocked = unlockedSet.has(l.id);
          const isCurrent = i === state.locIdx;
          const isComplete =
            unlocked &&
            (l.isRest || l.isFinal
              ? state.bossDefeated[l.id] || (state.locKills[l.id] ?? 0) >= l.killsNeeded
              : l.boss
                ? !!state.bossDefeated[l.id]
                : (state.locKills[l.id] ?? 0) >= l.killsNeeded);
          return (
            <MapMarker
              key={l.id}
              loc={l}
              index={i}
              isCurrent={isCurrent}
              unlocked={unlocked}
              isComplete={isComplete}
              scale={markerScale}
              showLabel={isCurrent && !map.isOverview && unlocked}
              hasQuest={questsByLoc.has(l.id)}
              onClick={handleMarkerClick}
            />
          );
        })}
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => map.centerOn(loc.id, initialZoom)}
          className={styles.toolButton}
          data-tool="center"
          title="Centrar en localización actual"
          aria-label="Centrar en localización actual"
        >
          <span data-form="icon">⊙</span>
          <span data-form="label"> Centrar</span>
        </button>
        <button
          type="button"
          onClick={map.fitToScreen}
          className={styles.toolButton}
          data-tool="fit"
          title="Ver mapa completo"
          aria-label="Ver mapa completo"
        >
          <span data-form="icon">⊖</span>
          <span data-form="label"> Ver todo</span>
        </button>
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className={styles.toolButton}
            data-tool="expand"
            title="Expandir mapa"
            aria-label="Expandir mapa"
          >
            <span data-form="icon">⛶</span>
            <span data-form="label"> Expandir</span>
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.toolButton}
            data-tool="close"
            title="Cerrar mapa expandido"
            aria-label="Cerrar mapa expandido"
          >
            <span data-form="icon">✕</span>
            <span data-form="label"> Cerrar</span>
          </button>
        )}
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
  );
}
