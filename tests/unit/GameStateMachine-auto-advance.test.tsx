import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useGameStore } from '../../src/store/gameStore';
import { GameState } from '../../src/types';

/**
 * Test Suite: Auto-Advance Through Intermediate States
 *
 * This test verifies the fix for the issue where the game would get stuck
 * on intermediate states like "mode-selection" with a Continue button that
 * users didn't realize they needed to click.
 *
 * The fix: Auto-advance through intermediate states using useEffect,
 * eliminating the need for manual Continue button clicks in MVP.
 */
describe('GameStateMachine - Auto-Advance Behavior', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should auto-advance from mode-selection to role-selection', async () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');
    store.advanceState(); // Move to mode-selection

    render(<GameStateMachine />);

    // Should be in mode-selection initially
    expect(store.gameState).toBe('mode-selection');

    // Fast-forward the 300ms delay
    vi.advanceTimersByTime(300);

    // Should auto-advance to role-selection
    await waitFor(() => {
      expect(useGameStore.getState().gameState).toBe('role-selection');
    });
  });

  it('should auto-advance through all intermediate states to interview', async () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');
    store.advanceState(); // Move to mode-selection

    render(<GameStateMachine />);

    // Initially in mode-selection
    expect(store.gameState).toBe('mode-selection');

    // Fast-forward through all intermediate states
    // Each state has a 300ms delay, and there are 7 intermediate states
    vi.advanceTimersByTime(300 * 7);

    // Should reach interview state after auto-advancing through all intermediate states
    await waitFor(
      () => {
        expect(useGameStore.getState().gameState).toBe('interview');
      },
      { timeout: 5000 }
    );
  });

  it('should start timer when auto-advancing from ready-to-start', async () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');

    // Advance to ready-to-start
    while (store.gameState !== 'ready-to-start') {
      store.advanceState();
    }

    expect(store.timerStarted).toBe(false);

    render(<GameStateMachine />);

    // Fast-forward past the delay
    vi.advanceTimersByTime(300);

    // Timer should have been started
    await waitFor(() => {
      expect(useGameStore.getState().timerStarted).toBe(true);
    });
  });

  it('should not auto-advance from interview state', async () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');

    // Advance to interview
    while (store.gameState !== 'interview') {
      store.advanceState();
    }

    render(<GameStateMachine />);

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    // Should still be in interview (not auto-advanced)
    expect(useGameStore.getState().gameState).toBe('interview');
  });

  it('should not auto-advance from conclusion state', async () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');

    // Advance to conclusion
    while (store.gameState !== 'conclusion') {
      store.advanceState();
    }

    // Set determination so Conclusion renders properly
    store.setDetermination('human');

    render(<GameStateMachine />);

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    // Should still be in conclusion (not auto-advanced)
    expect(useGameStore.getState().gameState).toBe('conclusion');
  });

  it('should show loading state during auto-advance', () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');
    store.advanceState(); // Move to mode-selection

    const { getByText } = render(<GameStateMachine />);

    // Should show "Setting up your game..." during intermediate states
    expect(getByText(/setting up your game/i)).toBeInTheDocument();
  });
});
