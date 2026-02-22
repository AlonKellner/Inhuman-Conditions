/**
 * Bug: Penalty Calibration shows no buttons in single-device mode
 *
 * Reported: 2026-02-22
 *
 * Issue: In single-device mode, penalty calibration screen shows Investigator view
 * which displays "Waiting for Suspect to complete 3 practice attempts..." with no
 * interactive buttons, making it impossible to proceed.
 *
 * Root Cause: GameStateMachine was passing playerRole ('investigator') to
 * PenaltyCalibration component. In single-device mode, this stage should always
 * show the Suspect view (with "I Practiced" and "Continue" buttons).
 *
 * Fix: Detect single-device mode and force role='suspect' for penalty calibration stage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useGameStore } from '../../src/store/gameStore';

describe('Bug: Penalty Calibration no buttons in single-device mode (FIXED)', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should FIX: show Suspect view with buttons in single-device mode', async () => {
    render(<GameStateMachine />);

    // Set up single-device mode with seed
    useGameStore.getState().setSeed('TEST');
    useGameStore.getState().setMode('single-device'); // Explicitly set single-device mode

    // Advance to penalty-calibration
    while (useGameStore.getState().gameState !== 'penalty-calibration') {
      useGameStore.getState().advanceState();
    }

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /I Practiced/i })).toBeInTheDocument();
    });

    // Verify BOTH buttons are present (Suspect view)
    const practiceButton = screen.getByRole('button', { name: /I Practiced/i });
    const continueButton = screen.getByRole('button', { name: /Continue/i });

    expect(practiceButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();

    // Verify practice button works
    const user = userEvent.setup();
    await user.click(practiceButton);

    // Should show progress counter
    expect(screen.getByText(/Practice Attempt 1 of 3/i)).toBeInTheDocument();
  });

  it('should allow completing calibration in single-device mode', async () => {
    render(<GameStateMachine />);

    // Set up game
    useGameStore.getState().setSeed('TEST');
    useGameStore.getState().setMode('single-device');

    // Advance to penalty-calibration
    while (useGameStore.getState().gameState !== 'penalty-calibration') {
      useGameStore.getState().advanceState();
    }

    // Wait for buttons
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /I Practiced/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const practiceButton = screen.getByRole('button', { name: /I Practiced/i });

    // Practice 3 times
    await user.click(practiceButton);
    await user.click(practiceButton);
    await user.click(practiceButton);

    // Continue button should now be enabled
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).not.toBeDisabled();

    // Should show completion message
    expect(screen.getByText(/Practice complete/i)).toBeInTheDocument();

    // Should be able to click Continue and advance
    await user.click(continueButton);

    // Should advance to next state
    await waitFor(() => {
      const currentState = useGameStore.getState().gameState;
      expect(currentState).not.toBe('penalty-calibration');
    });
  });

  it('should NOT show waiting message in single-device mode', async () => {
    render(<GameStateMachine />);

    useGameStore.getState().setSeed('TEST');
    useGameStore.getState().setMode('single-device');

    while (useGameStore.getState().gameState !== 'penalty-calibration') {
      useGameStore.getState().advanceState();
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /I Practiced/i })).toBeInTheDocument();
    });

    // Should NOT show Investigator waiting message
    const waitingMessage = screen.queryByText(/Waiting for Suspect to complete 3 practice attempts/i);
    expect(waitingMessage).not.toBeInTheDocument();

    // Should show Suspect instructions instead
    expect(screen.getByText(/Practice performing it/i)).toBeInTheDocument();
  });
});
