import { useEffect } from 'react';
import { saveGame, useGameStore } from '@/engine/store';

const TICK_INTERVAL_MS = 250;
const AUTOSAVE_DEBOUNCE_MS = 500;

/**
 * Wires together the runtime side-effects of the game:
 *  - DPS tick (4 times per second).
 *  - Debounced auto-save to localStorage.
 *
 * Mounted once at the App root. Lives in a hook so that
 * the store stays a pure data container (easier to test,
 * SSR-friendly and HMR-friendly).
 */
export function useGameLoop(): void {
  useEffect(() => {
    const tick = useGameStore.getState().tick;
    const id = window.setInterval(tick, TICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let saveTimer: number | null = null;
    const unsubscribe = useGameStore.subscribe((store) => {
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => saveGame(store.state), AUTOSAVE_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      if (saveTimer) window.clearTimeout(saveTimer);
    };
  }, []);
}
