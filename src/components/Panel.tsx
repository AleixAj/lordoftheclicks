import { useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import styles from '@/styles/panel.module.css';

interface PanelProps {
  title?: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function Panel({
  title,
  className = '',
  bodyClassName = '',
  headerExtra,
  children,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const [resizingEdge, setResizingEdge] = useState<'top' | 'bottom' | null>(null);
  const panelStyle =
    height && !collapsed ? ({ flex: `0 0 ${height}px`, height } as CSSProperties) : undefined;

  const startResize = (edge: 'top' | 'bottom') => (event: PointerEvent<HTMLButtonElement>) => {
    if (collapsed) return;

    const panel = event.currentTarget.closest<HTMLElement>(`.${styles.panel}`);
    if (!panel) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startY = event.clientY;
    const startHeight = panel.getBoundingClientRect().height;
    const minHeight = title === undefined ? 80 : 112;
    const maxHeight = Math.max(minHeight, window.innerHeight - 40);
    setResizingEdge(edge);

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      const delta = moveEvent.clientY - startY;
      const nextHeight = edge === 'bottom' ? startHeight + delta : startHeight - delta;
      setHeight(Math.min(maxHeight, Math.max(minHeight, nextHeight)));
    };

    const onPointerUp = () => {
      setResizingEdge(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  return (
    <div
      className={`${styles.panel} ${collapsed ? styles.panelCollapsed : ''} ${resizingEdge ? styles.panelResizing : ''} flex flex-col min-h-0 ${className}`}
      style={panelStyle}
    >
      <button
        type="button"
        className={`${styles.resizeHandle} ${styles.resizeHandleTop}`}
        onPointerDown={startResize('top')}
        aria-label="Redimensionar panel desde arriba"
      />
      {title !== undefined && (
        <button
          type="button"
          className={styles.header}
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
          title={collapsed ? 'Abrir panel' : 'Cerrar panel'}
        >
          <span className={styles.headerTitle}>
            <span className={styles.collapseIcon} aria-hidden="true">
              {collapsed ? '▸' : '▾'}
            </span>
            {title}
          </span>
          {headerExtra && <span className={styles.headerExtra}>{headerExtra}</span>}
        </button>
      )}
      {!collapsed && (
        <div className={`${styles.body} flex flex-col flex-1 min-h-0 ${bodyClassName}`}>
          {children}
        </div>
      )}
      <button
        type="button"
        className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`}
        onPointerDown={startResize('bottom')}
        aria-label="Redimensionar panel desde abajo"
      />
    </div>
  );
}
