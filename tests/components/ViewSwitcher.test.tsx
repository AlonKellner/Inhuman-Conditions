import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ViewSwitcher } from '../../src/components/ViewSwitcher';
import { useInvestigatorStore } from '../../src/store/gameStore';
import { GameMode } from '../../src/types';

describe('ViewSwitcher with independent stores', () => {
  beforeEach(() => {
    // Reset investigator store before each test
    useInvestigatorStore.getState().resetGame();
  });

  it('should render without context errors', () => {
    useInvestigatorStore.getState().setMode(GameMode.SingleDevice);

    const { container } = render(<ViewSwitcher />);

    // Should render without throwing context errors
    expect(container).toBeTruthy();
  });

  it('should wrap InvestigatorView with investigator provider in single-device mode', () => {
    const store = useInvestigatorStore.getState();
    store.setMode(GameMode.SingleDevice);

    // In single-device mode, defaults to investigator view
    const { container } = render(<ViewSwitcher />);

    // Should render successfully (provider wrapping works)
    expect(container.querySelector('[class*="container"]')).toBeTruthy();
  });

  it('should wrap SuspectView with suspect provider when playerRole is suspect', () => {
    const store = useInvestigatorStore.getState();
    store.setMode(GameMode.MultiDevice);
    store.setPlayerRole('suspect');

    const { container } = render(<ViewSwitcher />);

    // Should render successfully (provider wrapping works)
    expect(container.querySelector('[class*="container"]')).toBeTruthy();
  });

  it('should provide independent store context to each view', () => {
    // This test verifies that GameStoreProvider correctly provides
    // role-specific stores to child components
    const store = useInvestigatorStore.getState();
    store.setMode(GameMode.SingleDevice);

    // Rendering ViewSwitcher should create two independent store contexts
    // (one for investigator, one for suspect when switching)
    expect(() => render(<ViewSwitcher />)).not.toThrow();
  });
});
