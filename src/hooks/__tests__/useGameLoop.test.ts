import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCATIONS } from '@/data';
import { createInitialState } from '@/engine/persistence';
import { spawnSemiBoss } from '@/engine/spawn';
import { useGameStore } from '@/engine/store';
import { useGameLoop } from '../useGameLoop';

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ends the boss fight and respawns a pool enemy when the deadline passes', () => {
    const locIdx = 1;
    const loc = LOCATIONS[locIdx]!;
    const now = Date.now();
    const enemy = spawnSemiBoss(loc)!;

    useGameStore.setState({
      state: {
        ...createInitialState(),
        locIdx,
        unlockedLocs: ['comarca', loc.id],
        enemy,
        bossFight: {
          tier: 'semi',
          locId: loc.id,
          startedAt: now,
          deadlineMs: now + 1_000,
        },
      },
      fightFailed: null,
    });

    renderHook(() => useGameLoop(true));

    act(() => {
      vi.advanceTimersByTime(1_250);
    });

    const store = useGameStore.getState();
    expect(store.state.bossFight).toBeNull();
    expect(store.state.enemy?.tier).toBe('normal');
    expect(store.fightFailed).toBe('semi');
  });

  it('does not tick while inactive', () => {
    const locIdx = 1;
    const loc = LOCATIONS[locIdx]!;
    const base = {
      ...createInitialState(),
      locIdx,
      unlockedLocs: ['comarca', loc.id],
      companions: { frodo: { unlocked: true, level: 1 } },
      enemy: spawnSemiBoss(loc)!,
    };
    const startHp = base.enemy.hp;
    useGameStore.setState({ state: base, fightFailed: null });

    renderHook(() => useGameLoop(false));

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(useGameStore.getState().state.enemy?.hp).toBe(startHp);
  });
});
