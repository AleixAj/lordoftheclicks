import { useCallback, useEffect, useRef, useState } from 'react';
import { LOCATIONS } from '@/data';
import type { LocationId } from '@/types/game';

export interface MapSize {
  w: number;
  h: number;
}

export interface MapOffset {
  x: number;
  y: number;
}

export interface UseMapInteractionOptions {
  mapAspect: number;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  dragThreshold?: number;
}

export interface UseMapInteractionResult {
  /** Ref to attach to the viewport element. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current viewport dimensions in CSS pixels. */
  containerSize: MapSize;
  /** Current rendered map size after zoom. */
  displaySize: MapSize;
  /** Current pan offset (translate). */
  offset: MapOffset;
  /** Current zoom factor. */
  zoom: number;
  /** Whether the camera should animate (false during drag). */
  transitioning: boolean;
  /** Hovered map coordinates [0,100] or null. */
  hoverCoord: { x: string; y: string } | null;
  /** True when zoom is at minimum (overview). */
  isOverview: boolean;
  /** Animated centering on a known location, preserving zoom unless overridden. */
  centerOn: (locId: LocationId, targetZoom?: number) => void;
  /** Reset to overview. */
  fitToScreen: () => void;
  /** Returns true if a meaningful drag happened since mouseDown (use to suppress clicks). */
  wasDragged: () => boolean;
  /** Event handlers to spread on the viewport. */
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  /** True while user is actively dragging (used to set cursor style). */
  isDragging: boolean;
}

function fitMap(cw: number, ch: number, aspect: number): MapSize {
  if (cw / ch > aspect) return { w: ch * aspect, h: ch };
  return { w: cw, h: cw / aspect };
}

function clampOffset(x: number, y: number, dw: number, dh: number, cw: number, ch: number): MapOffset {
  const nx = dw <= cw ? (cw - dw) / 2 : Math.min(0, Math.max(cw - dw, x));
  const ny = dh <= ch ? (ch - dh) / 2 : Math.min(0, Math.max(ch - dh, y));
  return { x: nx, y: ny };
}

/**
 * Encapsulates all the pan/zoom logic for the map viewport.
 * The view layer just spreads the returned handlers and renders the markers.
 */
export function useMapInteraction({
  mapAspect,
  minZoom = 1,
  maxZoom = 20,
  defaultZoom = 3,
  dragThreshold = 4,
}: UseMapInteractionOptions): UseMapInteractionResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, moved: 0, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  const [containerSize, setContainerSize] = useState<MapSize>({ w: 600, h: 220 });
  const [zoom, setZoom] = useState(defaultZoom);
  const [offset, setOffset] = useState<MapOffset>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: string; y: string } | null>(null);
  const [transitioning, setTransitioning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fit = fitMap(containerSize.w, containerSize.h, mapAspect);
  const displaySize: MapSize = { w: fit.w * zoom, h: fit.h * zoom };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setContainerSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setOffset((prev) =>
      clampOffset(prev.x, prev.y, displaySize.w, displaySize.h, containerSize.w, containerSize.h),
    );
  }, [displaySize.w, displaySize.h, containerSize.w, containerSize.h]);

  const centerOn = useCallback(
    (locId: LocationId, targetZoom?: number) => {
      const l = LOCATIONS.find((x) => x.id === locId);
      if (!l) return;
      const z = targetZoom ?? zoom;
      const dw = fit.w * z;
      const dh = fit.h * z;
      const cx = (l.pos[0] / 100) * dw;
      const cy = (l.pos[1] / 100) * dh;
      const off = clampOffset(
        containerSize.w / 2 - cx,
        containerSize.h / 2 - cy,
        dw,
        dh,
        containerSize.w,
        containerSize.h,
      );
      setTransitioning(true);
      if (targetZoom != null) setZoom(z);
      setOffset(off);
    },
    [zoom, fit.w, fit.h, containerSize.w, containerSize.h],
  );

  const fitToScreen = useCallback(() => {
    setTransitioning(true);
    setZoom(minZoom);
    setOffset({ x: (containerSize.w - fit.w) / 2, y: (containerSize.h - fit.h) / 2 });
  }, [minZoom, containerSize.w, containerSize.h, fit.w, fit.h]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, zoom * factor));
      if (nextZoom === zoom) return;
      const scale = nextZoom / zoom;
      const nextOff = clampOffset(
        mx - (mx - offset.x) * scale,
        my - (my - offset.y) * scale,
        fit.w * nextZoom,
        fit.h * nextZoom,
        containerSize.w,
        containerSize.h,
      );
      setTransitioning(false);
      setZoom(nextZoom);
      setOffset(nextOff);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, offset.x, offset.y, fit.w, fit.h, containerSize.w, containerSize.h, minZoom, maxZoom]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        dragging: true,
        moved: 0,
        startX: e.clientX,
        startY: e.clientY,
        baseX: offset.x,
        baseY: offset.y,
      };
      setTransitioning(false);
      setIsDragging(true);
    },
    [offset.x, offset.y],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const r = e.currentTarget.getBoundingClientRect();
      let nextOff = offset;
      const drag = dragRef.current;
      if (drag.dragging) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
        nextOff = clampOffset(
          drag.baseX + dx,
          drag.baseY + dy,
          displaySize.w,
          displaySize.h,
          containerSize.w,
          containerSize.h,
        );
        setOffset(nextOff);
      }
      const localX = e.clientX - r.left - nextOff.x;
      const localY = e.clientY - r.top - nextOff.y;
      const px = (localX / displaySize.w) * 100;
      const py = (localY / displaySize.h) * 100;
      if (px >= 0 && px <= 100 && py >= 0 && py <= 100) {
        setHoverCoord({ x: px.toFixed(1), y: py.toFixed(1) });
      } else {
        setHoverCoord(null);
      }
    },
    [offset, displaySize.w, displaySize.h, containerSize.w, containerSize.h],
  );

  const endDrag = useCallback(() => {
    dragRef.current.dragging = false;
    setIsDragging(false);
  }, []);

  const onMouseLeave = useCallback(() => {
    endDrag();
    setHoverCoord(null);
  }, [endDrag]);

  const wasDragged = useCallback(() => dragRef.current.moved > dragThreshold, [dragThreshold]);

  return {
    containerRef,
    containerSize,
    displaySize,
    offset,
    zoom,
    transitioning,
    hoverCoord,
    isOverview: zoom <= minZoom + 0.05,
    centerOn,
    fitToScreen,
    wasDragged,
    handlers: { onMouseDown, onMouseMove, onMouseUp: endDrag, onMouseLeave },
    isDragging,
  };
}
