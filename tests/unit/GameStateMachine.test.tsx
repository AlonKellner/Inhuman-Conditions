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

  describe('Timer Start Timing - User Story 1 Critical Fix', () => {
    it('should NOT start timer during penalty-calibration state', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');
      store.setPlayerRole('suspect');

      // Advance to penalty-calibration
      while (store.gameState !== 'penalty-calibration') {
        store.advanceState();
      }

      render(<GameStateMachine />);

      // Timer should NOT be started yet
      expect(store.timerStarted).toBe(false);
    });

    it('should NOT start timer during intermediate states', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');

      const statesBeforeReady: GameState[] = [
        'mode-selection',
        'role-selection',
        'penalty-calibration',
        'packet-display',
        'inducer-puzzle',
        'background-display',
      ];

      for (const targetState of statesBeforeReady) {
        // Reset and advance to target state
        store.resetGame();
        store.setSeed('TEST');
        store.setPlayerRole('suspect');

        while (store.gameState !== targetState) {
          store.advanceState();
        }

        render(<GameStateMachine />);

        // Timer should NOT be started in any of these states
        expect(store.timerStarted).toBe(false);
      }
    });

    it('should NOT start timer when entering ready-to-start state', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');
      store.setPlayerRole('investigator');

      // Advance to ready-to-start
      while (store.gameState !== 'ready-to-start') {
        store.advanceState();
      }

      render(<GameStateMachine />);

      // Timer should NOT be started yet (must wait for button click)
      expect(store.timerStarted).toBe(false);
      expect(screen.getByRole('button', { name: /Start Interview/i })).toBeInTheDocument();
    });

    it('should ONLY start timer when "Start Interview" button is clicked', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');
      store.setPlayerRole('investigator');

      // Advance to ready-to-start
      while (store.gameState !== 'ready-to-start') {
        store.advanceState();
      }

      const { rerender } = render(<GameStateMachine />);

      // Timer should not be started yet
      expect(store.timerStarted).toBe(false);

      // Click "Start Interview" button
      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      // Re-render to reflect state change
      rerender(<GameStateMachine />);

      // NOW timer should be started
      expect(store.timerStarted).toBe(true);

      // And we should have advanced to interview state
      expect(store.gameState).toBe('interview');
    });

    it('should NOT auto-advance from penalty-calibration to interview', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');
      store.setPlayerRole('suspect');

      // Advance to penalty-calibration
      while (store.gameState !== 'penalty-calibration') {
        store.advanceState();
      }

      render(<GameStateMachine />);

      // Wait to verify no auto-advance happens
      setTimeout(() => {
        expect(store.gameState).toBe('penalty-calibration');
        expect(store.timerStarted).toBe(false);
      }, 500);
    });

    it('should NOT auto-advance from ready-to-start to interview', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');
      store.setPlayerRole('investigator');

      // Advance to ready-to-start
      while (store.gameState !== 'ready-to-start') {
        store.advanceState();
      }

      render(<GameStateMachine />);

      // Wait to verify no auto-advance happens
      setTimeout(() => {
        expect(store.gameState).toBe('ready-to-start');
        expect(store.timerStarted).toBe(false);
      }, 500);
    });
  });
});
