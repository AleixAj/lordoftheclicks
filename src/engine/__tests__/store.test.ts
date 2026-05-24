import { describe, expect, it } from 'vitest';
import { LOCATIONS, UPGRADES } from '@/data';
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

describe('store reach quests', () => {
  it('does not complete Bosque Viejo reach quest when Frodo and Sam unlock the map node', () => {
    useGameStore.setState({ state: createInitialState() });

    useGameStore.getState().acceptQuests('comarca');
    useGameStore.getState().recruitCompanion('frodo');
    useGameStore.getState().recruitCompanion('sam');

    const state = useGameStore.getState().state;
    expect(state.unlockedLocs).toContain('bosque_viejo');
    expect(state.visitedLocs).not.toContain('bosque_viejo');
    expect(state.questProgress.q1 ?? 0).toBe(0);
  });

  it('completes Bosque Viejo reach quest after traveling there', () => {
    useGameStore.setState({ state: createInitialState() });

    useGameStore.getState().acceptQuests('comarca');
    useGameStore.getState().recruitCompanion('frodo');
    useGameStore.getState().recruitCompanion('sam');
    useGameStore.getState().travelTo(1);

    const state = useGameStore.getState().state;
    expect(state.visitedLocs).toContain('bosque_viejo');
    expect(state.questProgress.q1).toBe(1);
  });
});

describe('store dev cheats', () => {
  it('completeAll leaves every location unlocked, visited, and travelable', () => {
    useGameStore.setState({ state: createInitialState() });

    useGameStore.getState().completeAll();
    const afterComplete = useGameStore.getState().state;

    expect(afterComplete.unlockedLocs).toEqual(LOCATIONS.map((loc) => loc.id));
    expect(afterComplete.visitedLocs).toEqual(LOCATIONS.map((loc) => loc.id));

    useGameStore.getState().travelTo(1);
    expect(useGameStore.getState().state.locIdx).toBe(1);
  });
});
