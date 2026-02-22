/**
 * State Validator
 * Game rule enforcement and state transition validation
 * Pure logic with no React dependencies
 */

import type { GameState } from '../types';
import type { StateTransition } from './types';

/**
 * Valid state transitions in the game
 */
const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  'seed-entry': ['mode-selection'],
  'mode-selection': ['role-selection'],
  'role-selection': ['penalty-calibration'],
  'penalty-calibration': ['packet-display'],
  'packet-display': ['inducer-puzzle'],
  'inducer-puzzle': ['background-display'],
  'background-display': ['ready-to-start'],
  'ready-to-start': ['interview'],
  interview: ['conclusion'],
  conclusion: [], // Terminal state
};

/**
 * StateValidator class
 * Validates state transitions according to game rules
 */
export class StateValidator {
  /**
   * Validate if a state transition is allowed
   */
  validateTransition(from: GameState, to: GameState): StateTransition {
    const allowedNextStates = VALID_TRANSITIONS[from];

    if (!allowedNextStates) {
      return {
        from,
        to,
        isValid: false,
        reason: `Unknown state: ${from}`,
      };
    }

    if (from === 'conclusion') {
      return {
        from,
        to,
        isValid: false,
        reason: 'Game has concluded - cannot advance further',
      };
    }

    if (!allowedNextStates.includes(to)) {
      return {
        from,
        to,
        isValid: false,
        reason: `Invalid transition from ${from} to ${to}`,
      };
    }

    return {
      from,
      to,
      isValid: true,
    };
  }

  /**
   * Get the next valid state in the sequence
   */
  getNextState(from: GameState): GameState | null {
    const allowedNextStates = VALID_TRANSITIONS[from];
    if (!allowedNextStates || allowedNextStates.length === 0) {
      return null;
    }
    return allowedNextStates[0];
  }

  /**
   * Check if a state is terminal (no further transitions)
   */
  isTerminalState(state: GameState): boolean {
    const allowedNextStates = VALID_TRANSITIONS[state];
    return !allowedNextStates || allowedNextStates.length === 0;
  }

  /**
   * Validate penalty calibration completion
   */
  validatePenaltyCalibration(attempts: number, maxAttempts: number): {
    isValid: boolean;
    reason?: string;
  } {
    if (attempts < 0) {
      return {
        isValid: false,
        reason: 'Practice attempts cannot be negative',
      };
    }

    if (attempts > maxAttempts) {
      return {
        isValid: false,
        reason: `Practice attempts (${attempts}) exceeds maximum (${maxAttempts})`,
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Validate timer start conditions
   * Timer should only start after reaching ready-to-start and clicking Start Interview
   */
  validateTimerStart(currentState: GameState, timerStarted: boolean): {
    isValid: boolean;
    reason?: string;
  } {
    if (timerStarted) {
      return {
        isValid: false,
        reason: 'Timer has already been started',
      };
    }

    if (currentState !== 'ready-to-start' && currentState !== 'interview') {
      return {
        isValid: false,
        reason: `Cannot start timer in state: ${currentState}`,
      };
    }

    return {
      isValid: true,
    };
  }
}
