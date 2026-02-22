import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useGameStore } from '../../src/store/gameStore';
import { GameState } from '../../src/types';

describe('GameStateMachine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should render SeedEntry in seed-entry state', () => {
    render(<GameStateMachine />);

    expect(screen.getByText(/Enter Game Seed/i)).toBeInTheDocument();
  });

  it('should render intermediate state screen in mode-selection', () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');
    store.advanceState(); // Move to mode-selection

    render(<GameStateMachine />);

    expect(screen.getByText(/Setting up your game/i)).toBeInTheDocument();
    expect(screen.getByText(/mode-selection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('should advance state when Continue button is clicked', () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');
    store.advanceState(); // Move to mode-selection

    const { rerender } = render(<GameStateMachine />);

    // Should be in mode-selection
    expect(useGameStore.getState().gameState).toBe('mode-selection');
    expect(screen.getByText(/mode-selection/i)).toBeInTheDocument();

    // Click Continue
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Re-render to see the new state
    rerender(<GameStateMachine />);

    // Should have advanced to role-selection
    expect(useGameStore.getState().gameState).toBe('role-selection');
    expect(screen.getByText(/role-selection/i)).toBeInTheDocument();
  });

  it('should advance through all intermediate states by clicking Continue', () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');
    store.advanceState(); // Move to mode-selection

    const { rerender } = render(<GameStateMachine />);

    const intermediateStates: GameState[] = [
      'mode-selection',
      'role-selection',
      'penalty-calibration',
      'packet-display',
      'inducer-puzzle',
      'background-display',
      'ready-to-start',
    ];

    for (const expectedState of intermediateStates) {
      // Verify current state
      expect(useGameStore.getState().gameState).toBe(expectedState);
      expect(screen.getByText(new RegExp(expectedState, 'i'))).toBeInTheDocument();

      // Click Continue
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      // Re-render
      rerender(<GameStateMachine />);
    }

    // Should now be in interview state
    expect(useGameStore.getState().gameState).toBe('interview');
    expect(screen.getByText(/Question/i)).toBeInTheDocument();
  });

  it('should render Interview view in interview state', () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');

    // Advance to interview
    while (store.gameState !== 'interview') {
      store.advanceState();
    }

    render(<GameStateMachine />);

    // Should show investigator questions
    expect(screen.getByText(/Question/i)).toBeInTheDocument();
  });

  it('should render Conclusion in conclusion state', () => {
    const store = useGameStore.getState();
    store.setSeed('TEST');

    // Advance to conclusion
    while (store.gameState !== 'conclusion') {
      store.advanceState();
    }

    // Set a determination first
    store.setDetermination('human');

    render(<GameStateMachine />);

    expect(screen.getByText(/Your Determination/i)).toBeInTheDocument();
  });
});
