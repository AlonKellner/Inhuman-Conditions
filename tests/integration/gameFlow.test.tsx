import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameStateMachine } from '../../src/components/GameStateMachine';
import { useGameStore } from '../../src/store/gameStore';

/**
 * Integration Test: Game Flow Timer Bug Fix
 *
 * This test verifies the critical fix for User Story 1:
 * "Timer MUST NOT start during penalty calibration or auto-advance to interview"
 *
 * Expected Flow:
 * 1. Seed Entry → Mode Selection → Role Selection
 * 2. Penalty Calibration (3 practice attempts) - NO TIMER
 * 3. Packet Display - NO TIMER
 * 4. Inducer Puzzle - NO TIMER
 * 5. Background Display - NO TIMER
 * 6. Ready to Start (manual confirmation) - NO TIMER
 * 7. Interview (TIMER STARTS ONLY AFTER MANUAL START)
 */

describe('Game Flow Integration - Timer Start Timing', () => {
  beforeEach(() => {
    // Reset game store before each test
    useGameStore.getState().resetGame();
  });

  describe('Penalty Calibration Stage', () => {
    it('should NOT start timer during penalty calibration', async () => {
      const { container } = render(<GameStateMachine />);

      // Advance to penalty calibration stage
      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('suspect');
      store.initializeGame();
      store.advanceState(); // → PENALTY_CALIBRATION

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText(/Practice Attempt/i)).toBeInTheDocument();
      });

      // Verify timer is NOT present
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
      expect(screen.queryByText(/5:00/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/4:59/i)).not.toBeInTheDocument();
    });

    it('should NOT start timer even after completing 3 practice attempts', async () => {
      const { container } = render(<GameStateMachine />);

      // Advance to penalty calibration stage
      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('suspect');
      store.initializeGame();
      store.advanceState(); // → PENALTY_CALIBRATION

      // Complete 3 practice attempts
      const practiceButton = await screen.findByRole('button', { name: /I Practiced/i });
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);

      // Verify timer is STILL NOT present
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });

    it('should NOT auto-advance to interview after penalty calibration', async () => {
      render(<GameStateMachine />);

      // Advance to penalty calibration stage
      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('suspect');
      store.initializeGame();
      store.advanceState(); // → PENALTY_CALIBRATION

      // Complete 3 practice attempts
      const practiceButton = await screen.findByRole('button', { name: /I Practiced/i });
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);

      // Click "Continue" button
      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Should advance to PACKET_DISPLAY, NOT INTERVIEW
      await waitFor(() => {
        expect(store.getState().gameState).toBe('PACKET_DISPLAY');
      });

      // Verify we're NOT in interview state
      expect(store.getState().gameState).not.toBe('INTERVIEW');
    });
  });

  describe('Intermediate Stages (Packet, Inducer, Background)', () => {
    it('should NOT start timer during packet display', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('investigator');
      store.initializeGame();

      // Advance to PACKET_DISPLAY
      store.advanceState(); // → PENALTY_CALIBRATION
      store.advanceState(); // → PACKET_DISPLAY

      await waitFor(() => {
        expect(screen.getByText(/Question Packet/i)).toBeInTheDocument();
      });

      // Verify timer is NOT present
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });

    it('should NOT start timer during inducer puzzle', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('suspect');
      store.initializeGame();

      // Advance to INDUCER_PUZZLE
      store.advanceState(); // → PENALTY_CALIBRATION
      store.advanceState(); // → PACKET_DISPLAY
      store.advanceState(); // → INDUCER_PUZZLE

      await waitFor(() => {
        expect(screen.getByText(/Interference Pattern/i)).toBeInTheDocument();
      });

      // Verify timer is NOT present
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });

    it('should NOT start timer during background display', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('suspect');
      store.initializeGame();

      // Advance to BACKGROUND_DISPLAY
      store.advanceState(); // → PENALTY_CALIBRATION
      store.advanceState(); // → PACKET_DISPLAY
      store.advanceState(); // → INDUCER_PUZZLE
      store.advanceState(); // → BACKGROUND_DISPLAY

      await waitFor(() => {
        expect(screen.getByText(/Your Background/i)).toBeInTheDocument();
      });

      // Verify timer is NOT present
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });
  });

  describe('Ready to Start Stage', () => {
    it('should NOT start timer on entering Ready to Start stage', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('investigator');
      store.initializeGame();

      // Advance to READY_TO_START
      store.advanceState(); // → PENALTY_CALIBRATION
      store.advanceState(); // → PACKET_DISPLAY
      store.advanceState(); // → INDUCER_PUZZLE
      store.advanceState(); // → BACKGROUND_DISPLAY
      store.advanceState(); // → READY_TO_START

      await waitFor(() => {
        expect(screen.getByText(/Ready to begin the interview/i)).toBeInTheDocument();
      });

      // Verify timer is NOT present yet
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });

    it('should NOT auto-advance from Ready to Start to Interview', async () => {
      render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('investigator');
      store.initializeGame();

      // Advance to READY_TO_START
      store.advanceState(); // → PENALTY_CALIBRATION
      store.advanceState(); // → PACKET_DISPLAY
      store.advanceState(); // → INDUCER_PUZZLE
      store.advanceState(); // → BACKGROUND_DISPLAY
      store.advanceState(); // → READY_TO_START

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Start Interview/i })).toBeInTheDocument();
      });

      // Wait 2 seconds to verify no auto-advance
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should STILL be in READY_TO_START state
      expect(store.getState().gameState).toBe('READY_TO_START');
    });

    it('should only start timer after manual "Start Interview" click', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('investigator');
      store.initializeGame();

      // Advance to READY_TO_START
      store.advanceState(); // → PENALTY_CALIBRATION
      store.advanceState(); // → PACKET_DISPLAY
      store.advanceState(); // → INDUCER_PUZZLE
      store.advanceState(); // → BACKGROUND_DISPLAY
      store.advanceState(); // → READY_TO_START

      // Verify no timer yet
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

      // Click "Start Interview" button
      const startButton = await screen.findByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      // Now timer SHOULD be present
      await waitFor(() => {
        expect(container.querySelector('[data-testid="countdown-timer"]')).toBeInTheDocument();
      });

      // Verify we advanced to INTERVIEW state
      expect(store.getState().gameState).toBe('INTERVIEW');
    });
  });

  describe('Complete Game Flow - No Premature Timer', () => {
    it('should progress through all stages without starting timer until manual start', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('suspect');
      store.initializeGame();

      // Stage 1: PENALTY_CALIBRATION
      store.advanceState();
      await waitFor(() => {
        expect(screen.getByText(/Practice Attempt/i)).toBeInTheDocument();
      });
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

      // Complete practice
      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      // Stage 2: PACKET_DISPLAY
      await waitFor(() => {
        expect(screen.getByText(/Question Packet/i)).toBeInTheDocument();
      });
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

      const packetContinue = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(packetContinue);

      // Stage 3: INDUCER_PUZZLE
      await waitFor(() => {
        expect(screen.getByText(/Interference Pattern/i)).toBeInTheDocument();
      });
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

      const inducerContinue = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(inducerContinue);

      // Stage 4: BACKGROUND_DISPLAY
      await waitFor(() => {
        expect(screen.getByText(/Your Background/i)).toBeInTheDocument();
      });
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

      const backgroundContinue = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(backgroundContinue);

      // Stage 5: READY_TO_START
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Start Interview/i })).toBeInTheDocument();
      });
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

      // Stage 6: INTERVIEW (timer starts only after manual click)
      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(container.querySelector('[data-testid="countdown-timer"]')).toBeInTheDocument();
      });

      // NOW timer should exist
      expect(screen.getByText(/5:00/i)).toBeInTheDocument();
    });
  });

  describe('Regression Prevention', () => {
    it('should never start timer before READY_TO_START stage', async () => {
      const { container } = render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('investigator');
      store.initializeGame();

      const stagesBeforeReady = [
        'PENALTY_CALIBRATION',
        'PACKET_DISPLAY',
        'INDUCER_PUZZLE',
        'BACKGROUND_DISPLAY'
      ];

      for (const expectedStage of stagesBeforeReady) {
        store.advanceState();

        await waitFor(() => {
          expect(store.getState().gameState).toBe(expectedStage);
        });

        // Timer should NEVER be present in these stages
        expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();

        // Advance to next stage
        const buttons = screen.queryAllByRole('button', { name: /Continue/i });
        if (buttons.length > 0) {
          fireEvent.click(buttons[0]);
        }
      }
    });

    it('should never auto-advance from any stage to INTERVIEW', async () => {
      render(<GameStateMachine />);

      const store = useGameStore.getState();
      store.setSeed('ABCD');
      store.setMode('single');
      store.setPlayerRole('investigator');
      store.initializeGame();

      // Manually advance through all stages
      const expectedStages = [
        'PENALTY_CALIBRATION',
        'PACKET_DISPLAY',
        'INDUCER_PUZZLE',
        'BACKGROUND_DISPLAY',
        'READY_TO_START'
      ];

      for (const expectedStage of expectedStages) {
        store.advanceState();

        await waitFor(() => {
          expect(store.getState().gameState).toBe(expectedStage);
        });

        // Wait 1 second to verify no auto-advance
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Should NOT have auto-advanced to INTERVIEW
        expect(store.getState().gameState).not.toBe('INTERVIEW');
      }
    });
  });
});
