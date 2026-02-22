import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { GameState, GameMode, PlayerRole, Determination } from '../types';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().resetGame();
  });

  describe('seed management', () => {
    it('should set seed and initialize game', () => {
      const { setSeed, seed, selectedPacket } = useGameStore.getState();

      setSeed('TEST');

      expect(seed).toBe('TEST');
      expect(selectedPacket).not.toBeNull();
    });

    it('should validate seed before setting', () => {
      const { setSeed } = useGameStore.getState();

      expect(() => setSeed('abc')).toThrow(); // lowercase
      expect(() => setSeed('AB12')).toThrow(); // numbers
      expect(() => setSeed('ABC')).toThrow(); // too short
    });

    it('should generate valid default seed', () => {
      const { generateDefaultSeed, validateSeed } = useGameStore.getState();

      const seed = generateDefaultSeed();
      const validation = validateSeed(seed);

      expect(validation.isValid).toBe(true);
      expect(seed).toMatch(/^[A-Z]{4}$/);
    });

    it('should generate valid random seed', () => {
      const { generateRandomSeed, validateSeed } = useGameStore.getState();

      const seed = generateRandomSeed();
      const validation = validateSeed(seed);

      expect(validation.isValid).toBe(true);
      expect(seed).toMatch(/^[A-Z]{4}$/);
    });
  });

  describe('game initialization', () => {
    it('should select all game content deterministically', () => {
      const store = useGameStore.getState();
      store.setSeed('ABCD');

      expect(store.selectedPacket).not.toBeNull();
      expect(store.selectedPenalty).not.toBeNull();
      expect(store.selectedRole).not.toBeNull();
      expect(store.selectedBackground).not.toBeNull();
      expect(store.inducerPattern).not.toBeNull();
      expect(store.shuffledQuestions).not.toBeNull();
    });

    it('should produce identical content for same seed', () => {
      const store1 = useGameStore.getState();
      store1.setSeed('SAME');

      const content1 = {
        packet: store1.selectedPacket?.id,
        penalty: store1.selectedPenalty?.id,
        role: store1.selectedRole?.roleType,
        background: store1.selectedBackground?.id,
      };

      store1.resetGame();
      store1.setSeed('SAME');

      const content2 = {
        packet: store1.selectedPacket?.id,
        penalty: store1.selectedPenalty?.id,
        role: store1.selectedRole?.roleType,
        background: store1.selectedBackground?.id,
      };

      expect(content1).toEqual(content2);
    });

    it('should produce different content for different seeds', () => {
      const store = useGameStore.getState();

      store.setSeed('AAAA');
      const content1 = {
        packet: store.selectedPacket?.id,
        penalty: store.selectedPenalty?.id,
      };

      store.resetGame();
      store.setSeed('ZZZZ');
      const content2 = {
        packet: store.selectedPacket?.id,
        penalty: store.selectedPenalty?.id,
      };

      // High probability of being different
      expect(content1.packet !== content2.packet || content1.penalty !== content2.penalty).toBe(
        true
      );
    });
  });

  describe('game mode and role', () => {
    it('should set game mode', () => {
      const { setMode, mode } = useGameStore.getState();

      setMode(GameMode.MultiDevice);

      expect(mode).toBe(GameMode.MultiDevice);
    });

    it('should set player role', () => {
      const { setPlayerRole, playerRole } = useGameStore.getState();

      setPlayerRole(PlayerRole.Investigator);

      expect(playerRole).toBe(PlayerRole.Investigator);
    });

    it('should reset player role when mode changes', () => {
      const store = useGameStore.getState();

      store.setPlayerRole(PlayerRole.Investigator);
      store.setMode(GameMode.SingleDevice);

      expect(store.playerRole).toBeNull();
    });
  });

  describe('state machine', () => {
    it('should start at SeedEntry state', () => {
      const { gameState } = useGameStore.getState();

      expect(gameState).toBe(GameState.SeedEntry);
    });

    it('should advance through states in order', () => {
      const store = useGameStore.getState();

      expect(store.gameState).toBe(GameState.SeedEntry);

      store.advanceState();
      expect(store.gameState).toBe(GameState.ModeSelection);

      store.advanceState();
      expect(store.gameState).toBe(GameState.RoleSelection);

      store.advanceState();
      expect(store.gameState).toBe(GameState.PenaltyCalibration);
    });

    it('should not advance past Conclusion', () => {
      const store = useGameStore.getState();

      // Fast-forward to Conclusion
      while (store.gameState !== GameState.Conclusion) {
        store.advanceState();
      }

      // Try to advance further
      store.advanceState();

      // Should still be at Conclusion
      expect(store.gameState).toBe(GameState.Conclusion);
    });

    it('should reset game state', () => {
      const store = useGameStore.getState();

      store.advanceState();
      store.advanceState();

      store.resetGame();

      expect(store.gameState).toBe(GameState.SeedEntry);
    });
  });

  describe('interview timer', () => {
    it('should start timer', () => {
      const store = useGameStore.getState();

      expect(store.timerStarted).toBe(false);

      store.startTimer();

      expect(store.timerStarted).toBe(true);
    });

    it('should mark timer elapsed', () => {
      const store = useGameStore.getState();

      expect(store.timerElapsed).toBe(false);

      store.onTimerElapsed();

      expect(store.timerElapsed).toBe(true);
    });
  });

  describe('penalty calibration', () => {
    it('should increment calibration attempts', () => {
      const store = useGameStore.getState();

      expect(store.calibrationAttempts).toBe(0);

      store.incrementCalibration();
      expect(store.calibrationAttempts).toBe(1);

      store.incrementCalibration();
      expect(store.calibrationAttempts).toBe(2);

      store.incrementCalibration();
      expect(store.calibrationAttempts).toBe(3);
    });

    it('should not increment past 3', () => {
      const store = useGameStore.getState();

      store.incrementCalibration();
      store.incrementCalibration();
      store.incrementCalibration();
      store.incrementCalibration(); // 4th attempt

      expect(store.calibrationAttempts).toBe(3);
    });
  });

  describe('determination and outcome', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.setSeed('TEST');
    });

    it('should set determination and calculate outcome', () => {
      const store = useGameStore.getState();

      store.setDetermination(Determination.Human);

      expect(store.determination).toBe(Determination.Human);
      expect(store.outcome).not.toBeNull();
      expect(store.outcome?.determination).toBe(Determination.Human);
      expect(store.outcome?.actualRole).toBe(store.selectedRole?.roleType);
    });

    it('should calculate correct outcome for Human', () => {
      const store = useGameStore.getState();

      // Keep resetting until we get a Human role
      while (store.selectedRole?.roleType !== 'human') {
        store.resetGame();
        store.setSeed(store.generateRandomSeed());
      }

      store.setDetermination(Determination.Human);

      expect(store.outcome?.correct).toBe(true);
    });

    it('should calculate incorrect outcome for wrong determination', () => {
      const store = useGameStore.getState();

      // Keep resetting until we get a Robot role
      while (store.selectedRole?.roleType === 'human') {
        store.resetGame();
        store.setSeed(store.generateRandomSeed());
      }

      store.setDetermination(Determination.Human); // Wrong!

      expect(store.outcome?.correct).toBe(false);
    });
  });

  describe('UI state', () => {
    it('should toggle role visibility', () => {
      const store = useGameStore.getState();

      expect(store.roleVisible).toBe(false);

      store.toggleRoleVisibility();
      expect(store.roleVisible).toBe(true);

      store.toggleRoleVisibility();
      expect(store.roleVisible).toBe(false);
    });
  });

  describe('sync check', () => {
    it('should generate state hash', () => {
      const store = useGameStore.getState();
      store.setSeed('TEST');

      const hash = store.getStateHash();

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(8);
    });

    it('should generate same hash for same state', () => {
      const store1 = useGameStore.getState();
      store1.setSeed('SAME');
      const hash1 = store1.getStateHash();

      store1.resetGame();
      store1.setSeed('SAME');
      const hash2 = store1.getStateHash();

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different state', () => {
      const store = useGameStore.getState();

      store.setSeed('AAAA');
      const hash1 = store.getStateHash();

      store.resetGame();
      store.setSeed('ZZZZ');
      const hash2 = store.getStateHash();

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('reset game', () => {
    it('should clear all game content', () => {
      const store = useGameStore.getState();

      store.setSeed('TEST');
      store.advanceState();
      store.setMode(GameMode.MultiDevice);
      store.incrementCalibration();

      store.resetGame();

      expect(store.selectedPacket).toBeNull();
      expect(store.selectedPenalty).toBeNull();
      expect(store.selectedRole).toBeNull();
      expect(store.selectedBackground).toBeNull();
      expect(store.inducerPattern).toBeNull();
      expect(store.shuffledQuestions).toBeNull();
    });

    it('should preserve seed after reset', () => {
      const store = useGameStore.getState();

      store.setSeed('TEST');
      const originalSeed = store.seed;

      store.resetGame();

      expect(store.seed).toBe(originalSeed);
    });

    it('should reset all state flags', () => {
      const store = useGameStore.getState();

      store.setSeed('TEST');
      store.startTimer();
      store.onTimerElapsed();
      store.toggleRoleVisibility();
      store.incrementCalibration();

      store.resetGame();

      expect(store.timerStarted).toBe(false);
      expect(store.timerElapsed).toBe(false);
      expect(store.roleVisible).toBe(false);
      expect(store.calibrationAttempts).toBe(0);
      expect(store.determination).toBeNull();
      expect(store.outcome).toBeNull();
    });
  });
});
