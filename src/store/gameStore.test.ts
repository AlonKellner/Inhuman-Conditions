import { describe, it, expect, beforeEach } from 'vitest';
import { useInvestigatorStore, useSuspectStore } from './gameStore';
import { GameState, GameMode, PlayerRole, Determination } from '../types';

// Test the investigator store (primary) and add independence tests
describe('gameStore', () => {
  beforeEach(() => {
    // Reset both stores before each test
    useInvestigatorStore.getState().resetGame();
    useSuspectStore.getState().resetGame();
  });

  // Use investigator store for existing tests
  const useGameStore = useInvestigatorStore;

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

      expect(store.penaltyCalibration.practiceAttempts).toBe(0);

      store.incrementCalibration();
      expect(store.penaltyCalibration.practiceAttempts).toBe(1);

      store.incrementCalibration();
      expect(store.penaltyCalibration.practiceAttempts).toBe(2);

      store.incrementCalibration();
      expect(store.penaltyCalibration.practiceAttempts).toBe(3);
    });

    it('should not increment past 3', () => {
      const store = useGameStore.getState();

      store.incrementCalibration();
      store.incrementCalibration();
      store.incrementCalibration();
      store.incrementCalibration(); // 4th attempt

      expect(store.penaltyCalibration.practiceAttempts).toBe(3);
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
      expect(store.penaltyCalibration.practiceAttempts).toBe(0);
      expect(store.determination).toBeNull();
      expect(store.outcome).toBeNull();
    });
  });

  describe('content cycling', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.setSeed('CYCLE');
    });

    describe('initialization', () => {
      it('should initialize content indices to 0', () => {
        const store = useGameStore.getState();

        expect(store.contentIndices.packetIndex).toBe(0);
        expect(store.contentIndices.penaltyIndex).toBe(0);
        expect(store.contentIndices.backgroundIndex).toBe(0);
        expect(store.contentIndices.roleIndex).toBe(0);
      });

      it('should initialize permutation sizes', () => {
        const store = useGameStore.getState();

        expect(store.permutationSizes.packets).toBeGreaterThan(0);
        expect(store.permutationSizes.penalties).toBeGreaterThan(0);
        expect(store.permutationSizes.backgrounds).toBeGreaterThan(0);
        expect(store.permutationSizes.roles).toBe(12); // Always 12 roles
      });
    });

    describe('penalty cycling', () => {
      it('should cycle to next penalty', () => {
        const store = useGameStore.getState();
        const initialPenalty = store.selectedPenalty;
        const initialIndex = store.contentIndices.penaltyIndex;

        store.cycleContent('penalty', 'next');

        expect(store.contentIndices.penaltyIndex).toBe(initialIndex + 1);
        expect(store.selectedPenalty?.id).not.toBe(initialPenalty?.id);
      });

      it('should cycle to previous penalty', () => {
        const store = useGameStore.getState();
        const totalPenalties = store.permutationSizes.penalties;

        store.cycleContent('penalty', 'previous');

        // Should wrap to last index
        expect(store.contentIndices.penaltyIndex).toBe(totalPenalties - 1);
      });

      it('should reset penalty calibration attempts when cycling penalty', () => {
        const store = useGameStore.getState();

        // Make some practice attempts
        store.incrementCalibration();
        store.incrementCalibration();
        expect(store.penaltyCalibration.practiceAttempts).toBe(2);

        // Cycle penalty
        store.cycleContent('penalty', 'next');

        expect(store.penaltyCalibration.practiceAttempts).toBe(0);
        expect(store.penaltyCalibration.isComplete).toBe(false);
      });

      it('should update penalty text when cycling', () => {
        const store = useGameStore.getState();
        const initialText = store.penaltyCalibration.penaltyText;

        store.cycleContent('penalty', 'next');

        expect(store.penaltyCalibration.penaltyText).not.toBe(initialText);
        expect(store.penaltyCalibration.penaltyText).toBe(store.selectedPenalty?.text);
      });
    });

    describe('packet cycling', () => {
      it('should cycle to next packet', () => {
        const store = useGameStore.getState();
        const initialPacket = store.selectedPacket;

        store.cycleContent('packet', 'next');

        expect(store.contentIndices.packetIndex).toBe(1);
        expect(store.selectedPacket?.id).not.toBe(initialPacket?.id);
      });

      it('should cycle to previous packet', () => {
        const store = useGameStore.getState();
        const totalPackets = store.permutationSizes.packets;

        store.cycleContent('packet', 'previous');

        expect(store.contentIndices.packetIndex).toBe(totalPackets - 1);
      });
    });

    describe('background cycling', () => {
      it('should cycle to next background', () => {
        const store = useGameStore.getState();
        const initialBackground = store.selectedBackground;

        store.cycleContent('background', 'next');

        expect(store.contentIndices.backgroundIndex).toBe(1);
        expect(store.selectedBackground?.id).not.toBe(initialBackground?.id);
      });

      it('should cycle to previous background', () => {
        const store = useGameStore.getState();
        const totalBackgrounds = store.permutationSizes.backgrounds;

        store.cycleContent('background', 'previous');

        expect(store.contentIndices.backgroundIndex).toBe(totalBackgrounds - 1);
      });
    });

    describe('role cycling', () => {
      it('should cycle to next role', () => {
        const store = useGameStore.getState();

        store.cycleContent('role', 'next');

        expect(store.contentIndices.roleIndex).toBe(1);
      });

      it('should cycle through 12 roles and wrap', () => {
        const store = useGameStore.getState();

        // Cycle through all 12 roles
        for (let i = 0; i < 12; i++) {
          store.cycleContent('role', 'next');
        }

        // Should wrap back to 0
        expect(store.contentIndices.roleIndex).toBe(0);
      });
    });

    describe('index independence', () => {
      it('should only update the cycled content index', () => {
        const store = useGameStore.getState();

        store.cycleContent('penalty', 'next');

        // Penalty index should change
        expect(store.contentIndices.penaltyIndex).toBe(1);

        // Other indices should remain 0
        expect(store.contentIndices.packetIndex).toBe(0);
        expect(store.contentIndices.backgroundIndex).toBe(0);
        expect(store.contentIndices.roleIndex).toBe(0);
      });
    });

    describe('determinism', () => {
      it('should maintain determinism when cycling', () => {
        const store1 = useGameStore.getState();
        store1.setSeed('DETER');
        store1.cycleContent('penalty', 'next');
        store1.cycleContent('penalty', 'next');

        const penalty1Id = store1.selectedPenalty?.id;
        const index1 = store1.contentIndices.penaltyIndex;

        // Reset and repeat with same seed
        store1.resetGame();
        store1.setSeed('DETER');
        store1.cycleContent('penalty', 'next');
        store1.cycleContent('penalty', 'next');

        const penalty2Id = store1.selectedPenalty?.id;
        const index2 = store1.contentIndices.penaltyIndex;

        // Same seed + same cycling = same result
        expect(penalty1Id).toBe(penalty2Id);
        expect(index1).toBe(index2);
      });
    });
  });

  // New tests for store independence
  describe('store independence', () => {
    it('should create two independent GameEngine instances', () => {
      const inv = useInvestigatorStore.getState();
      const sus = useSuspectStore.getState();

      expect(inv._engine).not.toBe(sus._engine);
    });

    it('should not share state when seeds are different', () => {
      const inv = useInvestigatorStore.getState();
      const sus = useSuspectStore.getState();

      inv.setSeed('AAAA');
      sus.setSeed('ZZZZ');

      expect(inv.selectedPacket?.id).not.toBe(sus.selectedPacket?.id);
      expect(inv.seed).toBe('AAAA');
      expect(sus.seed).toBe('ZZZZ');
    });

    it('should not share gameState advancement', () => {
      const inv = useInvestigatorStore.getState();
      const sus = useSuspectStore.getState();

      inv.advanceState();
      inv.advanceState();

      expect(inv.gameState).not.toBe(sus.gameState);
    });

    it('should not share penalty selection state', () => {
      const inv = useInvestigatorStore.getState();
      const sus = useSuspectStore.getState();

      inv.setSeed('TEST');
      sus.setSeed('TEST'); // Same seed for deterministic content

      inv.initializePenaltySelection();
      sus.initializePenaltySelection();

      // Eliminate different penalties
      inv.eliminatePenalty(inv.penaltySelection!.availablePenalties[0].id);
      sus.eliminatePenalty(sus.penaltySelection!.availablePenalties[1].id);

      expect(inv.penaltySelection?.investigatorEliminated).not.toBe(
        sus.penaltySelection?.investigatorEliminated
      );
    });

    it('should not share content cycling state', () => {
      const inv = useInvestigatorStore.getState();
      const sus = useSuspectStore.getState();

      inv.setSeed('CYCLE');
      sus.setSeed('CYCLE'); // Same seed for deterministic permutations

      // Investigator cycles penalty
      inv.cycleContent('penalty', 'next');
      inv.cycleContent('penalty', 'next');

      // Suspect does not cycle
      expect(inv.contentIndices.penaltyIndex).toBe(2);
      expect(sus.contentIndices.penaltyIndex).toBe(0);
      expect(inv.selectedPenalty?.id).not.toBe(sus.selectedPenalty?.id);
    });

    it('should maintain independent timer state', () => {
      const inv = useInvestigatorStore.getState();
      const sus = useSuspectStore.getState();

      inv.startTimer();
      inv.onTimerElapsed();

      expect(inv.timerStarted).toBe(true);
      expect(inv.timerElapsed).toBe(true);
      expect(sus.timerStarted).toBe(false);
      expect(sus.timerElapsed).toBe(false);
    });
  });
});
