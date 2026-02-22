import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useGameStore } from '../../src/store/gameStore';

describe('Bug: Penalty text is empty (FIXED)', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should FIX: penalty text is now shown correctly', async () => {
    render(<GameStateMachine />);

    // User enters seed
    useGameStore.getState().setSeed('TEST');

    // Get fresh state after setSeed
    const store = useGameStore.getState();

    console.log('selectedPenalty:', store.selectedPenalty);
    console.log('penalty text:', store.selectedPenalty?.text);

    // FIX: selectedPenalty should have text field, not description
    expect(store.selectedPenalty).not.toBeNull();
    expect(store.selectedPenalty?.text).toBeTruthy();

    // Advance to penalty-calibration
    while (useGameStore.getState().gameState !== 'penalty-calibration') {
      useGameStore.getState().advanceState();
    }

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100));

    // FIX: Penalty text should now be visible
    // The text will be one of the penalties from the data file
    const updatedStore = useGameStore.getState();
    const penaltyText = updatedStore.selectedPenalty?.text;
    if (penaltyText) {
      const penaltyElement = screen.queryByText(penaltyText);
      expect(penaltyElement).toBeInTheDocument();
    }
  });

  it('should verify penalties data is loaded correctly', () => {
    // Initialize game
    useGameStore.getState().setSeed('TEST');

    // Get fresh state after setSeed
    const store = useGameStore.getState();

    // Check if penalty was selected
    console.log('Store state after setSeed:', {
      selectedPenalty: store.selectedPenalty,
      selectedPacket: store.selectedPacket,
      selectedRole: store.selectedRole
    });

    expect(store.selectedPenalty).not.toBeNull();
    expect(store.selectedPenalty?.text).toBeTruthy();
    expect(store.selectedPenalty?.text.length).toBeGreaterThan(0);

    // Also check that penaltyCalibration was initialized with the text
    expect(store.penaltyCalibration.penaltyText).toBe(store.selectedPenalty?.text);
  });
});
