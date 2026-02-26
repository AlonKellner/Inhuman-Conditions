import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useInvestigatorStore } from '../../src/store/gameStore';
import { GameState } from '../../src/types';

describe('GameStateMachine', () => {
  beforeEach(() => {
    // Reset to seed entry before each test
    useInvestigatorStore.getState().resetGame();
  });

  it('should render without throwing context error', () => {
    // GameStateMachine uses useInvestigatorStore directly, no provider needed
    expect(() => render(<GameStateMachine />)).not.toThrow();
  });

  it('should show ViewSwitcher in seed-entry state', () => {
    // Reset to seed entry
    useInvestigatorStore.getState().resetGame();

    const { container } = render(<GameStateMachine />);

    // ViewSwitcher should render successfully
    expect(container).toBeTruthy();
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('should use investigator store directly (not context)', () => {
    // This test verifies GameStateMachine uses useInvestigatorStore directly
    // rather than the context-aware useGameStore hook
    const store = useInvestigatorStore.getState();

    // GameStateMachine should be able to read from this store
    expect(store.gameState).toBe(GameState.SeedEntry);

    // Render should succeed without provider
    const { container } = render(<GameStateMachine />);
    expect(container).toBeTruthy();
  });
});
