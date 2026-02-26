import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useGameStore } from '../../src/store/gameStore';

describe('Bug: Penalty Calibration Stuck on "Calibration in progress..."', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should FIX: default to investigator role in single-device mode', async () => {
    render(<GameStateMachine />);

    // User enters seed (this triggers initialization)
    useGameStore.getState().setSeed('TEST');

    // Get fresh state after setSeed
    let store = useGameStore.getState();

    // FIX: Game should now default playerRole to 'investigator' in single-device mode
    expect(store.playerRole).toBe('investigator');

    // Advance to penalty-calibration
    while (useGameStore.getState().gameState !== 'penalty-calibration') {
      useGameStore.getState().advanceState();
    }

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // FIX: Should show investigator view, not spectator
    const spectatorMessage = screen.queryByText(/Calibration in progress/i);
    const investigatorMessage = screen.queryByText(/Read this aloud to the Suspect/i);

    expect(spectatorMessage).not.toBeInTheDocument();
    expect(investigatorMessage).toBeInTheDocument();
  });

  it('should show interactive UI when playerRole is set', async () => {
    render(<GameStateMachine />);

    // User enters seed
    useGameStore.getState().setSeed('TEST');

    // WORKAROUND: Explicitly set player role
    useGameStore.getState().setPlayerRole('suspect');

    // Advance to penalty-calibration
    while (useGameStore.getState().gameState !== 'penalty-calibration') {
      useGameStore.getState().advanceState();
    }

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // With playerRole set, should show interactive UI
    const suspectButtons = screen.queryByRole('button', { name: /I Practiced/i });
    const spectatorMessage = screen.queryByText(/Calibration in progress/i);

    expect(suspectButtons).toBeInTheDocument();
    expect(spectatorMessage).not.toBeInTheDocument();
  });
});
