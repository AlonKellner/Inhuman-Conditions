/**
 * GameEngine Tests
 * 100% coverage for core game engine logic (no React dependencies)
 * Tests Constitution Principle VII: Separation of Game Logic from UI
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import type { GameEngineEvent } from '../../src/engine/types';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('Initialization', () => {
    it('should start with empty initial state', () => {
      const state = engine.getState();

      expect(state.config.seed).toBeNull();
      expect(state.currentState).toBe('seed-entry');
      expect(state.selectedPacket).toBeNull();
      expect(state.selectedPenalty).toBeNull();
      expect(state.timerStarted).toBe(false);
    });

    it('should initialize game with seed', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });

      const state = engine.getState();

      expect(state.config.seed).toBe('TEST');
      expect(state.selectedPacket).not.toBeNull();
      expect(state.selectedPenalty).not.toBeNull();
      expect(state.selectedRole).not.toBeNull();
      expect(state.selectedBackground).not.toBeNull();
      expect(state.inducerPattern).not.toBeNull();
      expect(state.shuffledQuestions).not.toBeNull();

      // Verify event was emitted
      expect(events).toContainEqual({
        type: 'GAME_INITIALIZED',
        seed: 'TEST',
      });
    });

    it('should set default playerRole to investigator in single-device mode', () => {
      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });

      const state = engine.getState();
      expect(state.config.playerRole).toBe('investigator');
    });

    it('should not set default playerRole in multi-device mode', () => {
      engine.initialize({
        seed: 'TEST',
        mode: 'multi-device',
      });

      const state = engine.getState();
      expect(state.config.playerRole).toBeNull();
    });

    it('should initialize penalty calibration with penalty text', () => {
      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });

      const state = engine.getState();
      expect(state.penaltyCalibration.penaltyText).toBe(state.selectedPenalty?.text);
      expect(state.penaltyCalibration.practiceAttempts).toBe(0);
      expect(state.penaltyCalibration.maxAttempts).toBe(3);
      expect(state.penaltyCalibration.isComplete).toBe(false);
    });

    it('should throw error when initializing without seed', () => {
      expect(() => {
        engine.initialize({
          seed: null,
          mode: 'single-device',
        });
      }).toThrow('Seed is required to initialize game');
    });

    it('should produce same content for same seed (determinism)', () => {
      const engine1 = new GameEngine();
      const engine2 = new GameEngine();

      engine1.initialize({
        seed: 'SAME',
        mode: 'single-device',
      });

      engine2.initialize({
        seed: 'SAME',
        mode: 'single-device',
      });

      const state1 = engine1.getState();
      const state2 = engine2.getState();

      expect(state1.selectedPacket?.id).toBe(state2.selectedPacket?.id);
      expect(state1.selectedPenalty?.id).toBe(state2.selectedPenalty?.id);
      expect(state1.selectedRole?.roleType).toBe(state2.selectedRole?.roleType);
    });
  });

  describe('State Transitions', () => {
    beforeEach(() => {
      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });
    });

    it('should advance from seed-entry to mode-selection', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      const transition = engine.advanceState();

      expect(transition.isValid).toBe(true);
      expect(transition.from).toBe('seed-entry');
      expect(transition.to).toBe('mode-selection');

      const state = engine.getState();
      expect(state.currentState).toBe('mode-selection');

      // Verify event was emitted
      expect(events).toContainEqual({
        type: 'STATE_CHANGED',
        from: 'seed-entry',
        to: 'mode-selection',
      });
    });

    it('should advance through all states in correct order', () => {
      const expectedStates = [
        'seed-entry',
        'mode-selection',
        'role-selection',
        'penalty-calibration',
        'packet-display',
        'inducer-puzzle',
        'background-display',
        'ready-to-start',
        'interview',
        'conclusion',
      ];

      let currentIndex = 0;
      expect(engine.getState().currentState).toBe(expectedStates[currentIndex]);

      while (engine.canAdvanceState()) {
        engine.advanceState();
        currentIndex++;
        expect(engine.getState().currentState).toBe(expectedStates[currentIndex]);
      }

      expect(currentIndex).toBe(expectedStates.length - 1);
    });

    it('should not advance from conclusion state', () => {
      // Advance to conclusion
      while (engine.getState().currentState !== 'conclusion') {
        engine.advanceState();
      }

      const transition = engine.advanceState();

      expect(transition.isValid).toBe(false);
      expect(transition.reason).toBe('No valid next state');
    });

    it('should return false for canAdvanceState at conclusion', () => {
      // Advance to conclusion
      while (engine.getState().currentState !== 'conclusion') {
        engine.advanceState();
      }

      expect(engine.canAdvanceState()).toBe(false);
    });
  });

  describe('Timer Management', () => {
    beforeEach(() => {
      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });
    });

    it('should start timer when in ready-to-start state', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      // Advance to ready-to-start
      while (engine.getState().currentState !== 'ready-to-start') {
        engine.advanceState();
      }

      engine.startTimer();

      const state = engine.getState();
      expect(state.timerStarted).toBe(true);

      // Verify event was emitted
      expect(events).toContainEqual({ type: 'TIMER_STARTED' });
    });

    it('should throw error when starting timer before ready-to-start', () => {
      expect(() => {
        engine.startTimer();
      }).toThrow();
    });

    it('should throw error when starting timer twice', () => {
      // Advance to ready-to-start
      while (engine.getState().currentState !== 'ready-to-start') {
        engine.advanceState();
      }

      engine.startTimer();

      expect(() => {
        engine.startTimer();
      }).toThrow('already been started');
    });

    it('should mark timer as elapsed', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      engine.onTimerElapsed();

      const state = engine.getState();
      expect(state.timerElapsed).toBe(true);

      // Verify event was emitted
      expect(events).toContainEqual({ type: 'TIMER_ELAPSED' });
    });
  });

  describe('Penalty Calibration', () => {
    beforeEach(() => {
      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });
    });

    it('should increment calibration attempts', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      engine.incrementCalibration();

      const state = engine.getState();
      expect(state.penaltyCalibration.practiceAttempts).toBe(1);
      expect(state.penaltyCalibration.isComplete).toBe(false);

      // Verify event was emitted
      expect(events).toContainEqual({
        type: 'CALIBRATION_INCREMENTED',
        attempts: 1,
      });
    });

    it('should mark calibration as complete after 3 attempts', () => {
      engine.incrementCalibration();
      engine.incrementCalibration();
      engine.incrementCalibration();

      const state = engine.getState();
      expect(state.penaltyCalibration.practiceAttempts).toBe(3);
      expect(state.penaltyCalibration.isComplete).toBe(true);
    });

    it('should throw error when incrementing beyond max attempts', () => {
      engine.incrementCalibration();
      engine.incrementCalibration();
      engine.incrementCalibration();

      expect(() => {
        engine.incrementCalibration();
      }).toThrow();
    });
  });

  describe('Determination', () => {
    beforeEach(() => {
      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });
    });

    it('should make determination and calculate correctness', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      const state = engine.getState();
      const actualRole = state.selectedRole?.roleType;

      // Make determination based on actual role
      const determination = actualRole === 'human' ? 'human' : 'robot';
      engine.makeDetermination(determination);

      const updatedState = engine.getState();
      expect(updatedState.determination).toBe(determination);
      expect(updatedState.outcome).not.toBeNull();
      expect(updatedState.outcome?.correct).toBe(true);

      // Verify event was emitted
      expect(events).toContainEqual({
        type: 'DETERMINATION_MADE',
        determination,
      });
    });

    it('should calculate incorrect determination', () => {
      const state = engine.getState();
      const actualRole = state.selectedRole?.roleType;

      // Make opposite determination
      const determination = actualRole === 'human' ? 'robot' : 'human';
      engine.makeDetermination(determination);

      const updatedState = engine.getState();
      expect(updatedState.outcome?.correct).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset game to initial state', () => {
      const events: GameEngineEvent[] = [];
      engine.subscribe((event) => events.push(event));

      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });

      engine.advanceState();
      engine.reset();

      const state = engine.getState();
      expect(state.currentState).toBe('seed-entry');
      expect(state.selectedPacket).toBeNull();
      expect(state.timerStarted).toBe(false);
      expect(state.config.seed).toBe('TEST'); // Seed is preserved

      // Verify event was emitted
      expect(events).toContainEqual({ type: 'GAME_RESET' });
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe and unsubscribe to events', () => {
      const events: GameEngineEvent[] = [];
      const unsubscribe = engine.subscribe((event) => events.push(event));

      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });

      expect(events.length).toBeGreaterThan(0);

      // Unsubscribe
      events.length = 0;
      unsubscribe();

      engine.advanceState();
      expect(events.length).toBe(0); // No events after unsubscribe
    });

    it('should support multiple subscribers', () => {
      const events1: GameEngineEvent[] = [];
      const events2: GameEngineEvent[] = [];

      engine.subscribe((event) => events1.push(event));
      engine.subscribe((event) => events2.push(event));

      engine.initialize({
        seed: 'TEST',
        mode: 'single-device',
      });

      expect(events1.length).toBeGreaterThan(0);
      expect(events2.length).toBeGreaterThan(0);
      expect(events1).toEqual(events2);
    });
  });

  describe('Content Cycling', () => {
    beforeEach(() => {
      engine.initialize({
        seed: 'CYCLE',
        mode: 'single-device',
      });
    });

    describe('Penalty Cycling', () => {
      it('should cycle to next penalty', () => {
        const events: GameEngineEvent[] = [];
        engine.subscribe((event) => events.push(event));

        const initialState = engine.getState();
        const initialPenalty = initialState.selectedPenalty;
        const initialIndex = initialState.contentIndices.penaltyIndex;

        engine.cycleContent('penalty', 'next');

        const newState = engine.getState();
        expect(newState.contentIndices.penaltyIndex).toBe(initialIndex + 1);
        expect(newState.selectedPenalty?.id).not.toBe(initialPenalty?.id);

        // Verify event was emitted
        const cycledEvent = events.find((e) => e.type === 'CONTENT_CYCLED');
        expect(cycledEvent).toBeDefined();
        expect(cycledEvent).toMatchObject({
          type: 'CONTENT_CYCLED',
          contentType: 'penalty',
          direction: 'next',
          newIndex: initialIndex + 1,
        });
      });

      it('should cycle to previous penalty', () => {
        const initialState = engine.getState();
        const totalPenalties = initialState.permutationSizes.penalties;

        engine.cycleContent('penalty', 'previous');

        const newState = engine.getState();
        // Should wrap to last index (totalPenalties - 1)
        expect(newState.contentIndices.penaltyIndex).toBe(totalPenalties - 1);
      });

      it('should wrap around when cycling forward past last penalty', () => {
        const initialState = engine.getState();
        const totalPenalties = initialState.permutationSizes.penalties;

        // Cycle to last penalty
        for (let i = 0; i < totalPenalties - 1; i++) {
          engine.cycleContent('penalty', 'next');
        }

        const beforeWrap = engine.getState();
        expect(beforeWrap.contentIndices.penaltyIndex).toBe(totalPenalties - 1);

        // Cycle once more - should wrap to 0
        engine.cycleContent('penalty', 'next');

        const afterWrap = engine.getState();
        expect(afterWrap.contentIndices.penaltyIndex).toBe(0);
      });

      it('should reset penalty calibration attempts when cycling penalty', () => {
        // Make some practice attempts
        engine.incrementCalibration();
        engine.incrementCalibration();

        const stateAfterPractice = engine.getState();
        expect(stateAfterPractice.penaltyCalibration.practiceAttempts).toBe(2);

        // Cycle penalty
        engine.cycleContent('penalty', 'next');

        const stateAfterCycle = engine.getState();
        expect(stateAfterCycle.penaltyCalibration.practiceAttempts).toBe(0);
        expect(stateAfterCycle.penaltyCalibration.isComplete).toBe(false);
      });

      it('should update penalty text when cycling', () => {
        const initialState = engine.getState();
        const initialText = initialState.penaltyCalibration.penaltyText;

        engine.cycleContent('penalty', 'next');

        const newState = engine.getState();
        expect(newState.penaltyCalibration.penaltyText).not.toBe(initialText);
        expect(newState.penaltyCalibration.penaltyText).toBe(newState.selectedPenalty?.text);
      });
    });

    describe('Packet Cycling', () => {
      it('should cycle to next packet', () => {
        const initialState = engine.getState();
        const initialPacket = initialState.selectedPacket;

        engine.cycleContent('packet', 'next');

        const newState = engine.getState();
        expect(newState.selectedPacket?.id).not.toBe(initialPacket?.id);
        expect(newState.contentIndices.packetIndex).toBe(1);
      });

      it('should cycle to previous packet', () => {
        const initialState = engine.getState();
        const totalPackets = initialState.permutationSizes.packets;

        engine.cycleContent('packet', 'previous');

        const newState = engine.getState();
        expect(newState.contentIndices.packetIndex).toBe(totalPackets - 1);
      });
    });

    describe('Background Cycling', () => {
      it('should cycle to next background', () => {
        const initialState = engine.getState();
        const initialBackground = initialState.selectedBackground;

        engine.cycleContent('background', 'next');

        const newState = engine.getState();
        expect(newState.selectedBackground?.id).not.toBe(initialBackground?.id);
        expect(newState.contentIndices.backgroundIndex).toBe(1);
      });

      it('should cycle to previous background', () => {
        const initialState = engine.getState();
        const totalBackgrounds = initialState.permutationSizes.backgrounds;

        engine.cycleContent('background', 'previous');

        const newState = engine.getState();
        expect(newState.contentIndices.backgroundIndex).toBe(totalBackgrounds - 1);
      });
    });

    describe('Role Cycling', () => {
      it('should cycle to next role', () => {
        const initialState = engine.getState();
        const initialRole = initialState.selectedRole;

        engine.cycleContent('role', 'next');

        const newState = engine.getState();
        expect(newState.contentIndices.roleIndex).toBe(1);
        // Role might be same type (e.g., both human) but different index
      });

      it('should cycle through 12 roles', () => {
        const initialState = engine.getState();
        expect(initialState.permutationSizes.roles).toBe(12);

        // Cycle through all 12 roles
        for (let i = 0; i < 12; i++) {
          engine.cycleContent('role', 'next');
        }

        const afterFullCycle = engine.getState();
        // Should wrap back to index 0
        expect(afterFullCycle.contentIndices.roleIndex).toBe(0);
      });
    });

    describe('Multiplayer Synchronization', () => {
      it('should maintain determinism across multiple engines with same seed', () => {
        const engine2 = new GameEngine();
        engine2.initialize({
          seed: 'CYCLE', // Same seed as engine in beforeEach
          mode: 'single-device',
        });

        // Cycle both engines to same index
        engine.cycleContent('penalty', 'next');
        engine.cycleContent('penalty', 'next');

        engine2.cycleContent('penalty', 'next');
        engine2.cycleContent('penalty', 'next');

        const state1 = engine.getState();
        const state2 = engine2.getState();

        // Should have same penalty
        expect(state1.selectedPenalty?.id).toBe(state2.selectedPenalty?.id);
        expect(state1.selectedPenalty?.text).toBe(state2.selectedPenalty?.text);
        expect(state1.contentIndices.penaltyIndex).toBe(state2.contentIndices.penaltyIndex);
      });
    });

    describe('Error Handling', () => {
      it('should throw error when cycling before initialization', () => {
        const uninitializedEngine = new GameEngine();

        expect(() => {
          uninitializedEngine.cycleContent('penalty', 'next');
        }).toThrow('Game must be initialized before cycling content');
      });
    });

    describe('Permutation Sizes', () => {
      it('should initialize permutation sizes correctly', () => {
        const state = engine.getState();

        expect(state.permutationSizes.packets).toBeGreaterThan(0);
        expect(state.permutationSizes.penalties).toBeGreaterThan(0);
        expect(state.permutationSizes.backgrounds).toBeGreaterThan(0);
        expect(state.permutationSizes.roles).toBe(12); // Always 12 roles
      });
    });

    describe('Content Indices', () => {
      it('should initialize all indices to 0', () => {
        const state = engine.getState();

        expect(state.contentIndices.packetIndex).toBe(0);
        expect(state.contentIndices.penaltyIndex).toBe(0);
        expect(state.contentIndices.backgroundIndex).toBe(0);
        expect(state.contentIndices.roleIndex).toBe(0);
      });

      it('should only update the cycled content index', () => {
        const initialState = engine.getState();

        engine.cycleContent('penalty', 'next');

        const newState = engine.getState();

        // Penalty index should change
        expect(newState.contentIndices.penaltyIndex).toBe(1);

        // Other indices should remain 0
        expect(newState.contentIndices.packetIndex).toBe(0);
        expect(newState.contentIndices.backgroundIndex).toBe(0);
        expect(newState.contentIndices.roleIndex).toBe(0);
      });
    });
  });
});
