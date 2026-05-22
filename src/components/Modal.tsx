import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional aria-label when no visible title is rendered. */
  ariaLabel?: string;
  children: ReactNode;
  /** Disable close-on-backdrop-click. Escape always closes. */
  disableBackdropClose?: boolean;
  /** Width preset of the dialog. */
  size?: 'md' | 'lg' | 'xl';
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  md: 'max-w-2xl',
  lg: 'max-w-5xl',
  xl: 'max-w-[1400px]',
};

/**
 * Accessible modal: portal'd to body, closes with Escape and click on backdrop,
 * locks body scroll while open, restores focus to the trigger on close.
 */
export function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  disableBackdropClose = false,
  size = 'lg',
}: ModalProps) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onMouseDown={(e) => {
        if (disableBackdropClose) return;
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        tabIndex={-1}
        className={`relative w-full ${SIZE_CLASS[size]} max-h-[90vh] flex flex-col bg-[#0e0a06] border-2 border-[#7a6a30] rounded shadow-2xl outline-none animate-[zoomIn_0.18s_ease-out]`}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#7a6a30] bg-[#1e1a14]">
            <span className="font-[Cinzel] text-[13px] font-bold uppercase tracking-[1.5px] text-[#c9a44a]">
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#c9a44a] text-lg leading-none hover:text-white px-2"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
