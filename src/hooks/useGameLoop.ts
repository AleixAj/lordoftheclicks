import { useEffect } from 'react';
import { isBossFightExpired } from '@/engine/progression';
import { saveGame, useGameStore } from '@/engine/store';

const TICK_INTERVAL_MS = 250;
const AUTOSAVE_DEBOUNCE_MS = 500;

function runGameFrame(): void {
  const store = useGameStore.getState();
  const fight = store.state.bossFight;
  if (fight && isBossFightExpired(fight)) {
    store.failBossFight();
    return;
  }
  store.tick();
}

/**
 * Wires together the runtime side-effects of the game:
 *  - DPS tick (4 times per second).
 *  - Boss-fight deadline check.
 *  - Debounced auto-save to localStorage.
 *
 * Only runs while `active` is true (player past the welcome screen). Also
 * re-syncs after tab focus / bfcache restore so passive DPS keeps working.
 */
export function useGameLoop(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    let intervalId = window.setInterval(runGameFrame, TICK_INTERVAL_MS);

    const restartLoop = () => {
      window.clearInterval(intervalId);
      runGameFrame();
      intervalId = window.setInterval(runGameFrame, TICK_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (!document.hidden) restartLoop();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) restartLoop();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    let saveTimer: number | null = null;
    let lastSavedState = useGameStore.getState().state;
    const unsubscribe = useGameStore.subscribe((store) => {
      if (store.state === lastSavedState) return;
      lastSavedState = store.state;
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => saveGame(store.state), AUTOSAVE_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      if (saveTimer) window.clearTimeout(saveTimer);
    };
  }, [active]);
}
