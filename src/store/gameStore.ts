/**
 * Zustand Game Store
 * Centralized state management for Inhuman Conditions game
 * Implements the API contract from contracts/game-state-api.md
 */

import { create } from 'zustand';
import { GameRNG } from '../lib/GameRNG';
import {
  validateSeed as validateSeedUtil,
  generateDefaultSeed as generateDefaultSeedUtil,
  generateRandomSeed as generateRandomSeedUtil,
} from '../lib/seedGeneration';
import { generateInducerPattern } from '../lib/inducerPattern';
import { packets } from '../data/packets';
import { penalties } from '../data/penalties';
import { backgrounds } from '../data/backgrounds';
import type {
  Seed,
  SeedValidation,
  GameMode,
  PlayerRole,
  GameState,
  Packet,
  Question,
  Penalty,
  Background,
  RoleAssignment,
  InducerPattern,
  Determination,
  GameOutcome,
  PenaltyCalibrationState,
} from '../types';
import { RoleType } from '../types';

interface GameStore {
  // Seed & Initialization
  seed: Seed | null;
  setSeed: (seed: Seed) => void;
  generateDefaultSeed: () => Seed;
  generateRandomSeed: () => Seed;
  validateSeed: (seed: Seed) => SeedValidation;

  // Game Mode & Role
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  playerRole: PlayerRole | null;
  setPlayerRole: (role: PlayerRole) => void;

  // Game State Machine
  gameState: GameState;
  advanceState: () => void;
  resetGame: () => void;

  // Selected Game Content (initialized by seed)
  selectedPacket: Packet | null;
  selectedPenalty: Penalty | null;
  selectedRole: RoleAssignment | null;
  selectedBackground: Background | null;
  inducerPattern: InducerPattern | null;
  shuffledQuestions: Question[] | null;

  // Game Initialization
  initializeGame: () => void;

  // Interview State
  timerStarted: boolean;
  timerElapsed: boolean;
  startTimer: () => void;
  onTimerElapsed: () => void;

  // Penalty Calibration
  penaltyCalibration: PenaltyCalibrationState;
  incrementCalibration: () => void;
  resetCalibration: () => void;

  // Conclusion
  determination: Determination | null;
  setDetermination: (determination: Determination) => void;
  outcome: GameOutcome | null;

  // UI State
  roleVisible: boolean;
  toggleRoleVisibility: () => void;

  // Sync Check
  getStateHash: () => string;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // === Initial State ===
  seed: null,
  mode: 'single-device' as GameMode,
  playerRole: null,
  gameState: 'seed-entry' as GameState,
  selectedPacket: null,
  selectedPenalty: null,
  selectedRole: null,
  selectedBackground: null,
  inducerPattern: null,
  shuffledQuestions: null,
  timerStarted: false,
  timerElapsed: false,
  penaltyCalibration: {
    penaltyText: '',
    practiceAttempts: 0,
    maxAttempts: 3,
    isComplete: false,
    lastAttemptTimestamp: null,
  },
  determination: null,
  outcome: null,
  roleVisible: false,

  // === Seed Management ===
  setSeed: (seed: Seed) => {
    const validation = validateSeedUtil(seed);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid seed');
    }

    set({ seed });
    get().initializeGame();
  },

  generateDefaultSeed: (): Seed => {
    return generateDefaultSeedUtil();
  },

  generateRandomSeed: (): Seed => {
    return generateRandomSeedUtil();
  },

  validateSeed: (seed: Seed): SeedValidation => {
    return validateSeedUtil(seed);
  },

  // === Game Mode & Role ===
  setMode: (mode: GameMode) => {
    set({ mode, playerRole: null });
  },

  setPlayerRole: (role: PlayerRole) => {
    set({ playerRole: role });
  },

  // === State Machine ===
  advanceState: () => {
    const { gameState } = get();
    const states: GameState[] = [
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

    const currentIndex = states.indexOf(gameState);
    if (currentIndex < states.length - 1) {
      set({ gameState: states[currentIndex + 1] });
    }
  },

  resetGame: () => {
    const { seed } = get();
    set({
      gameState: 'seed-entry',
      selectedPacket: null,
      selectedPenalty: null,
      selectedRole: null,
      selectedBackground: null,
      inducerPattern: null,
      shuffledQuestions: null,
      timerStarted: false,
      timerElapsed: false,
      penaltyCalibration: {
        penaltyText: '',
        practiceAttempts: 0,
        maxAttempts: 3,
        isComplete: false,
        lastAttemptTimestamp: null,
      },
      determination: null,
      outcome: null,
      roleVisible: false,
      seed, // Preserve seed
    });
  },

  // === Game Initialization ===
  initializeGame: () => {
    const { seed } = get();
    if (!seed) return;

    const rng = new GameRNG(seed);

    // Select packet
    const packet = rng.choice(packets);

    // Select penalty
    const penalty = rng.choice(penalties);

    // Select background
    const background = rng.choice(backgrounds);

    // Assign role (Human 33%, Patient Robot 50%, Violent Robot 17%)
    const roleRoll = rng.nextInt(1, 13); // 1-12 like d12
    let selectedRole: RoleAssignment;

    if (roleRoll <= 4) {
      // Human (1-4)
      const humanRole = packet.roles.find((r) => r.roleType === RoleType.Human);
      selectedRole = {
        roleType: RoleType.Human,
        description: humanRole?.description || 'A normal human being',
        traits: humanRole?.traits || ['Honest', 'Relaxed'],
      };
    } else if (roleRoll <= 10) {
      // Patient Robot (5-10)
      const patientRoles = packet.roles.filter((r) => r.roleType === RoleType.PatientRobot);
      const patientRole = rng.choice(patientRoles);
      selectedRole = {
        roleType: RoleType.PatientRobot,
        fault: patientRole.fault as any,
        description: patientRole.description,
        traits: patientRole.traits,
        restrictions: ['Cannot mention certain topics'], // Placeholder
      };
    } else {
      // Violent Robot (11-12)
      const violentRoles = packet.roles.filter((r) => r.roleType === RoleType.ViolentRobot);
      const violentRole = rng.choice(violentRoles);
      selectedRole = {
        roleType: RoleType.ViolentRobot,
        fault: violentRole.fault as any,
        description: violentRole.description,
        traits: violentRole.traits,
        tasks: violentRole.tasks || ['Complete assigned tasks'],
      };
    }

    // Generate inducer pattern
    const pattern = generateInducerPattern(rng);

    // Shuffle questions
    const questions = rng.shuffle([...packet.questions]);

    // Set default playerRole for MVP single-device mode
    // In single-device mode, default to 'investigator' since they control game flow
    const { mode, playerRole } = get();
    const defaultPlayerRole = playerRole || (mode === 'single-device' ? 'investigator' : null);

    set({
      selectedPacket: packet,
      selectedPenalty: penalty,
      selectedRole,
      selectedBackground: background,
      inducerPattern: pattern,
      shuffledQuestions: questions,
      playerRole: defaultPlayerRole,
      penaltyCalibration: {
        penaltyText: penalty.text,
        practiceAttempts: 0,
        maxAttempts: 3,
        isComplete: false,
        lastAttemptTimestamp: null,
      },
    });
  },

  // === Interview Timer ===
  startTimer: () => {
    set({ timerStarted: true });
  },

  onTimerElapsed: () => {
    set({ timerElapsed: true });
  },

  // === Penalty Calibration ===
  incrementCalibration: () => {
    const { penaltyCalibration } = get();
    if (penaltyCalibration.practiceAttempts < penaltyCalibration.maxAttempts) {
      const newAttempts = penaltyCalibration.practiceAttempts + 1;
      set({
        penaltyCalibration: {
          ...penaltyCalibration,
          practiceAttempts: newAttempts,
          isComplete: newAttempts >= penaltyCalibration.maxAttempts,
          lastAttemptTimestamp: Date.now(),
        },
      });
    }
  },

  resetCalibration: () => {
    const { penaltyCalibration } = get();
    set({
      penaltyCalibration: {
        ...penaltyCalibration,
        practiceAttempts: 0,
        isComplete: false,
        lastAttemptTimestamp: null,
      },
    });
  },

  // === Determination & Outcome ===
  setDetermination: (determination: Determination) => {
    const { selectedRole } = get();
    if (!selectedRole) return;

    const actualRole = selectedRole.roleType;

    // Calculate correctness
    let correct = false;
    if (determination === 'human' && actualRole === RoleType.Human) {
      correct = true;
    } else if (
      determination === 'robot' &&
      (actualRole === RoleType.PatientRobot || actualRole === RoleType.ViolentRobot)
    ) {
      correct = true;
    }

    set({
      determination,
      outcome: {
        determination,
        actualRole,
        correct,
      },
    });
  },

  // === UI State ===
  toggleRoleVisibility: () => {
    set((state) => ({ roleVisible: !state.roleVisible }));
  },

  // === Sync Check ===
  getStateHash: (): string => {
    const { seed, gameState, selectedPacket, selectedPenalty, selectedRole, selectedBackground } =
      get();

    const stateData = {
      seed,
      gameState,
      packetId: selectedPacket?.id,
      penaltyId: selectedPenalty?.id,
      roleType: selectedRole?.roleType,
      backgroundId: selectedBackground?.id,
    };

    // Simple hash (first 8 chars of hex hash)
    const hash = JSON.stringify(stateData)
      .split('')
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);

    return Math.abs(hash).toString(16).substring(0, 8);
  },
}));
