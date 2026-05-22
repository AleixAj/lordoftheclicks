import type { ReactNode } from 'react';
import styles from '@/styles/panel.module.css';

interface PanelProps {
  title?: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, className = '', bodyClassName = '', headerExtra, children }: PanelProps) {
  return (
    <div className={`${styles.panel} flex flex-col min-h-0 ${className}`}>
      {title !== undefined && (
        <div className={styles.header}>
          <span className={styles.headerTitle}>{title}</span>
          {headerExtra && <span className={styles.headerExtra}>{headerExtra}</span>}
        </div>
      )}
      <div className={`${styles.body} flex flex-col flex-1 min-h-0 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}
