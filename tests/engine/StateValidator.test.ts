/**
 * StateValidator Tests
 * 100% coverage for game rule validation (no React dependencies)
 */

import { describe, it, expect } from 'vitest';
import { StateValidator } from '../../src/engine/StateValidator';
import type { GameState } from '../../src/types';

describe('StateValidator', () => {
  let validator: StateValidator;

  beforeEach(() => {
    validator = new StateValidator();
  });

  describe('State Transition Validation', () => {
    it('should allow valid transition from seed-entry to mode-selection', () => {
      const transition = validator.validateTransition('seed-entry', 'mode-selection');

      expect(transition.isValid).toBe(true);
      expect(transition.from).toBe('seed-entry');
      expect(transition.to).toBe('mode-selection');
      expect(transition.reason).toBeUndefined();
    });

    it('should reject invalid transition from seed-entry to interview', () => {
      const transition = validator.validateTransition('seed-entry', 'interview');

      expect(transition.isValid).toBe(false);
      expect(transition.reason).toBeDefined();
      expect(transition.reason).toContain('Invalid transition');
    });

    it('should reject transition from conclusion state', () => {
      const transition = validator.validateTransition('conclusion', 'interview');

      expect(transition.isValid).toBe(false);
      expect(transition.reason).toContain('concluded');
    });

    it('should validate all valid sequential transitions', () => {
      const validSequence: Array<[GameState, GameState]> = [
        ['seed-entry', 'mode-selection'],
        ['mode-selection', 'role-selection'],
        ['role-selection', 'penalty-calibration'],
        ['penalty-calibration', 'packet-display'],
        ['packet-display', 'inducer-puzzle'],
        ['inducer-puzzle', 'background-display'],
        ['background-display', 'ready-to-start'],
        ['ready-to-start', 'interview'],
        ['interview', 'conclusion'],
      ];

      validSequence.forEach(([from, to]) => {
        const transition = validator.validateTransition(from, to);
        expect(transition.isValid).toBe(true, `Transition from ${from} to ${to} should be valid`);
      });
    });
  });

  describe('Next State Lookup', () => {
    it('should return correct next state', () => {
      expect(validator.getNextState('seed-entry')).toBe('mode-selection');
      expect(validator.getNextState('mode-selection')).toBe('role-selection');
      expect(validator.getNextState('ready-to-start')).toBe('interview');
    });

    it('should return null for conclusion state', () => {
      expect(validator.getNextState('conclusion')).toBeNull();
    });
  });

  describe('Terminal State Detection', () => {
    it('should identify conclusion as terminal state', () => {
      expect(validator.isTerminalState('conclusion')).toBe(true);
    });

    it('should identify non-terminal states', () => {
      expect(validator.isTerminalState('seed-entry')).toBe(false);
      expect(validator.isTerminalState('interview')).toBe(false);
      expect(validator.isTerminalState('ready-to-start')).toBe(false);
    });
  });

  describe('Penalty Calibration Validation', () => {
    it('should validate calibration attempts within range', () => {
      const result = validator.validatePenaltyCalibration(2, 3);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject negative attempts', () => {
      const result = validator.validatePenaltyCalibration(-1, 3);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('cannot be negative');
    });

    it('should reject attempts exceeding max', () => {
      const result = validator.validatePenaltyCalibration(4, 3);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('exceeds maximum');
    });

    it('should allow attempts equal to max', () => {
      const result = validator.validatePenaltyCalibration(3, 3);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Timer Start Validation', () => {
    it('should allow timer start at ready-to-start state', () => {
      const result = validator.validateTimerStart('ready-to-start', false);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow timer start at interview state', () => {
      const result = validator.validateTimerStart('interview', false);

      expect(result.isValid).toBe(true);
    });

    it('should reject timer start at other states', () => {
      const invalidStates: GameState[] = [
        'seed-entry',
        'mode-selection',
        'role-selection',
        'penalty-calibration',
        'packet-display',
        'inducer-puzzle',
        'background-display',
        'conclusion',
      ];

      invalidStates.forEach((state) => {
        const result = validator.validateTimerStart(state, false);
        expect(result.isValid).toBe(false, `Timer start should be invalid at ${state}`);
        expect(result.reason).toContain(`Cannot start timer in state: ${state}`);
      });
    });

    it('should reject starting timer when already started', () => {
      const result = validator.validateTimerStart('ready-to-start', true);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('already been started');
    });
  });
});
