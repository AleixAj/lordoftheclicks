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
  /** Ref to attach to the inner element. Drag updates its transform directly to avoid React re-renders. */
  innerRef: React.RefObject<HTMLDivElement | null>;
  /** Current viewport dimensions in CSS pixels. */
  containerSize: MapSize;
  /** Current rendered map size after zoom. */
  displaySize: MapSize;
  /** Current pan offset (translate). Only updated on commit (after drag, wheel, etc.). */
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
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
  };
  /** True while user is actively dragging (used to set cursor style). */
  isDragging: boolean;
}

function fitMap(cw: number, ch: number, aspect: number): MapSize {
  if (cw / ch > aspect) return { w: ch * aspect, h: ch };
  return { w: cw, h: cw / aspect };
}

function clampOffset(
  x: number,
  y: number,
  dw: number,
  dh: number,
  cw: number,
  ch: number,
): MapOffset {
  const nx = dw <= cw ? (cw - dw) / 2 : Math.min(0, Math.max(cw - dw, x));
  const ny = dh <= ch ? (ch - dh) / 2 : Math.min(0, Math.max(ch - dh, y));
  return { x: nx, y: ny };
}

/**
 * Encapsulates all the pan/zoom logic for the map viewport.
 *
 * Performance notes:
 *  - During drag the transform is written directly to `innerRef.current.style`
 *    to bypass React reconciliation. State is only committed on `endDrag`.
 *  - Hover coordinate updates are throttled with `requestAnimationFrame`.
 */
export function useMapInteraction({
  mapAspect,
  minZoom = 1,
  maxZoom = 20,
  defaultZoom = 3,
  dragThreshold = 4,
}: UseMapInteractionOptions): UseMapInteractionResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, moved: 0, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const liveOffsetRef = useRef<MapOffset>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingCoordRef = useRef<{ x: string; y: string } | null>(null);
  const pinchRef = useRef({
    pinching: false,
    startDist: 0,
    startZoom: 1,
    startOffsetX: 0,
    startOffsetY: 0,
    startCenterX: 0,
    startCenterY: 0,
    liveZoom: 1,
  });

  const [containerSize, setContainerSize] = useState<MapSize>({ w: 600, h: 220 });
  const [zoom, setZoom] = useState(defaultZoom);
  const [offset, setOffset] = useState<MapOffset>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: string; y: string } | null>(null);
  const [transitioning, setTransitioning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fit = fitMap(containerSize.w, containerSize.h, mapAspect);
  const displaySize: MapSize = { w: fit.w * zoom, h: fit.h * zoom };

  // Keep the live offset ref in sync with committed state.
  useEffect(() => {
    liveOffsetRef.current = offset;
  }, [offset]);

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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = {
      dragging: true,
      moved: 0,
      startX: e.clientX,
      startY: e.clientY,
      baseX: liveOffsetRef.current.x,
      baseY: liveOffsetRef.current.y,
    };
    setTransitioning(false);
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const r = e.currentTarget.getBoundingClientRect();
      const drag = dragRef.current;
      let liveOff = liveOffsetRef.current;

      if (drag.dragging) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
        liveOff = clampOffset(
          drag.baseX + dx,
          drag.baseY + dy,
          displaySize.w,
          displaySize.h,
          containerSize.w,
          containerSize.h,
        );
        liveOffsetRef.current = liveOff;

        // Direct DOM write: bypass React reconciliation while dragging.
        const inner = innerRef.current;
        if (inner) {
          inner.style.transform = `translate3d(${liveOff.x}px, ${liveOff.y}px, 0)`;
        }
      }

      const localX = e.clientX - r.left - liveOff.x;
      const localY = e.clientY - r.top - liveOff.y;
      const px = (localX / displaySize.w) * 100;
      const py = (localY / displaySize.h) * 100;
      pendingCoordRef.current =
        px >= 0 && px <= 100 && py >= 0 && py <= 100
          ? { x: px.toFixed(1), y: py.toFixed(1) }
          : null;

      // Throttle coord badge updates with rAF.
      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          setHoverCoord(pendingCoordRef.current);
        });
      }
    },
    [displaySize.w, displaySize.h, containerSize.w, containerSize.h],
  );

  const endDrag = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    setIsDragging(false);
    // Commit the live offset to React state so the rest of the tree (markers, etc.) sees it.
    setOffset(liveOffsetRef.current);
  }, []);

  const onMouseLeave = useCallback(() => {
    endDrag();
    pendingCoordRef.current = null;
    setHoverCoord(null);
  }, [endDrag]);

  /* Touch handlers mirror the mouse ones so the map can be panned on
     mobile/tablet, and add two-finger pinch-to-zoom. The container
     already sets `touch-action: none`, so the browser won't try to
     scroll/zoom the page while interacting with the map. */
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const el = containerRef.current;
      if (e.touches.length === 2 && el) {
        // Promote to pinch: cancel any single-finger drag in flight.
        dragRef.current.dragging = false;
        dragRef.current.moved = Number.POSITIVE_INFINITY; // suppress trailing click
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const r = el.getBoundingClientRect();
        const cx = (t1.clientX + t2.clientX) / 2 - r.left;
        const cy = (t1.clientY + t2.clientY) / 2 - r.top;
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        pinchRef.current = {
          pinching: true,
          startDist: Math.max(1, Math.hypot(dx, dy)),
          startZoom: zoom,
          startOffsetX: liveOffsetRef.current.x,
          startOffsetY: liveOffsetRef.current.y,
          startCenterX: cx,
          startCenterY: cy,
          liveZoom: zoom,
        };
        const inner = innerRef.current;
        if (inner) inner.style.transformOrigin = '0 0';
        setTransitioning(false);
        setIsDragging(true);
        return;
      }
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      dragRef.current = {
        dragging: true,
        moved: 0,
        startX: t.clientX,
        startY: t.clientY,
        baseX: liveOffsetRef.current.x,
        baseY: liveOffsetRef.current.y,
      };
      setTransitioning(false);
      setIsDragging(true);
    },
    [zoom],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const pinch = pinchRef.current;
      const el = containerRef.current;
      if (pinch.pinching && e.touches.length === 2 && el) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const r = el.getBoundingClientRect();
        const cx = (t1.clientX + t2.clientX) / 2 - r.left;
        const cy = (t1.clientY + t2.clientY) / 2 - r.top;
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const rawRatio = dist / pinch.startDist;
        const nextZoom = Math.min(maxZoom, Math.max(minZoom, pinch.startZoom * rawRatio));
        const actualRatio = nextZoom / pinch.startZoom;
        // Anchor the original map point under the current finger midpoint,
        // then add the finger-midpoint translation so two-finger pan works too.
        const panDx = cx - pinch.startCenterX;
        const panDy = cy - pinch.startCenterY;
        const ox =
          pinch.startCenterX - (pinch.startCenterX - pinch.startOffsetX) * actualRatio + panDx;
        const oy =
          pinch.startCenterY - (pinch.startCenterY - pinch.startOffsetY) * actualRatio + panDy;
        const nextOff = clampOffset(
          ox,
          oy,
          fit.w * nextZoom,
          fit.h * nextZoom,
          containerSize.w,
          containerSize.h,
        );
        pinch.liveZoom = nextZoom;
        liveOffsetRef.current = nextOff;
        const inner = innerRef.current;
        if (inner) {
          inner.style.transform = `translate3d(${nextOff.x}px, ${nextOff.y}px, 0) scale(${actualRatio})`;
        }
        return;
      }
      const drag = dragRef.current;
      if (!drag.dragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - drag.startX;
      const dy = t.clientY - drag.startY;
      drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
      const liveOff = clampOffset(
        drag.baseX + dx,
        drag.baseY + dy,
        displaySize.w,
        displaySize.h,
        containerSize.w,
        containerSize.h,
      );
      liveOffsetRef.current = liveOff;
      const inner = innerRef.current;
      if (inner) {
        inner.style.transform = `translate3d(${liveOff.x}px, ${liveOff.y}px, 0)`;
      }
    },
    [
      displaySize.w,
      displaySize.h,
      containerSize.w,
      containerSize.h,
      fit.w,
      fit.h,
      minZoom,
      maxZoom,
    ],
  );

  const onTouchEnd = useCallback(() => {
    const pinch = pinchRef.current;
    if (pinch.pinching) {
      const inner = innerRef.current;
      if (inner) inner.style.transformOrigin = '';
      pinch.pinching = false;
      setIsDragging(false);
      setZoom(pinch.liveZoom);
      setOffset(liveOffsetRef.current);
      return;
    }
    endDrag();
  }, [endDrag]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const wasDragged = useCallback(() => dragRef.current.moved > dragThreshold, [dragThreshold]);

  return {
    containerRef,
    innerRef,
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
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp: endDrag,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
    },
    isDragging,
  };
}
