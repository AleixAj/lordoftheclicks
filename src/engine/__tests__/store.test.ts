import { describe, expect, it } from 'vitest';
import { UPGRADES } from '@/data';
import { createInitialState } from '../persistence';
import { upgradeCost } from '../formulas';
import { useGameStore } from '../store';

describe('store forge upgrades', () => {
  it('buyUpgrade spends mithril and increases the selected rank', () => {
    const base = createInitialState();
    const cost = upgradeCost('golpe_elfico', 0);
    useGameStore.setState({
      state: {
        ...base,
        mithril: cost,
        upgrades: {},
      },
    });

    useGameStore.getState().buyUpgrade('golpe_elfico');

    const state = useGameStore.getState().state;
    expect(state.mithril).toBe(0);
    expect(state.upgrades.golpe_elfico).toBe(1);
    expect(state.clickDmg).toBeGreaterThan(base.clickDmg);
  });

  it('buyUpgrade refuses locked or maxed nodes', () => {
    const locked = UPGRADES.find((upgrade) => upgrade.id === 'vetas_profundas')!;
    useGameStore.setState({
      state: {
        ...createInitialState(),
        mithril: 999,
        upgrades: {},
      },
    });

    useGameStore.getState().buyUpgrade(locked.id);
    expect(useGameStore.getState().state.upgrades[locked.id]).toBeUndefined();

    useGameStore.setState({
      state: {
        ...createInitialState(),
        mithril: 999,
        upgrades: { golpe_elfico: 5 },
      },
    });
    useGameStore.getState().buyUpgrade('golpe_elfico');
    expect(useGameStore.getState().state.upgrades.golpe_elfico).toBe(5);
  });
});
