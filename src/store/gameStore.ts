/**
 * Zustand Game Store (GameEngine Integration)
 * UI state management layer that delegates game logic to GameEngine
 * Implements Constitution Principle VII: Separation of Game Logic from UI
 * Implements the API contract from contracts/game-state-api.md
 */

import { create } from 'zustand';
import { GameEngine } from '../engine/GameEngine';
import {
  validateSeed as validateSeedUtil,
  generateDefaultSeed as generateDefaultSeedUtil,
  generateRandomSeed as generateRandomSeedUtil,
} from '../lib/seedGeneration';
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

interface GameStore {
  // === Game Engine (Pure Logic) ===
  _engine: GameEngine;

  // === Seed & Initialization ===
  seed: Seed | null;
  setSeed: (seed: Seed) => void;
  generateDefaultSeed: () => Seed;
  generateRandomSeed: () => Seed;
  validateSeed: (seed: Seed) => SeedValidation;

  // === Game Mode & Role ===
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  playerRole: PlayerRole | null;
  setPlayerRole: (role: PlayerRole) => void;

  // === Game State Machine ===
  gameState: GameState;
  advanceState: () => void;
  resetGame: () => void;

  // === Selected Game Content ===
  selectedPacket: Packet | null;
  selectedPenalty: Penalty | null;
  selectedRole: RoleAssignment | null;
  selectedBackground: Background | null;
  inducerPattern: InducerPattern | null;
  shuffledQuestions: Question[] | null;

  // === Game Initialization ===
  initializeGame: () => void;

  // === Interview State ===
  timerStarted: boolean;
  timerElapsed: boolean;
  startTimer: () => void;
  onTimerElapsed: () => void;

  // === Penalty Calibration ===
  penaltyCalibration: PenaltyCalibrationState;
  incrementCalibration: () => void;
  resetCalibration: () => void;

  // === Conclusion ===
  determination: Determination | null;
  setDetermination: (determination: Determination) => void;
  outcome: GameOutcome | null;

  // === UI State ===
  roleVisible: boolean;
  toggleRoleVisibility: () => void;

  // === Sync Check ===
  getStateHash: () => string;

  // === Internal Sync Method ===
  _syncFromEngine: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // Create game engine instance
  const engine = new GameEngine();

  // Subscribe to engine events and sync to Zustand
  engine.subscribe((event) => {
    console.log('[GameEngine Event]', event);
    // Use requestAnimationFrame to batch state updates and prevent event loop issues
    requestAnimationFrame(() => {
      get()._syncFromEngine();
    });
  });

  return {
    // === Engine Instance ===
    _engine: engine,

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
      const { _engine } = get();
      _engine.setMode(mode);
      set({ mode, playerRole: null });
    },

    setPlayerRole: (role: PlayerRole) => {
      const { _engine } = get();
      _engine.setPlayerRole(role);
      set({ playerRole: role });
    },

    // === State Machine (Delegates to Engine) ===
    advanceState: () => {
      const { _engine } = get();
      _engine.advanceState();
      get()._syncFromEngine();
    },

    resetGame: () => {
      const { _engine, seed } = get();
      _engine.reset();

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

    // === Game Initialization (Delegates to Engine) ===
    initializeGame: () => {
      const { seed, mode, playerRole, _engine } = get();
      if (!seed) return;

      _engine.initialize({
        seed,
        mode,
        playerRole,
      });

      get()._syncFromEngine();
    },

    // === Interview Timer (Delegates to Engine) ===
    startTimer: () => {
      const { _engine } = get();
      _engine.startTimer();
      get()._syncFromEngine();
    },

    onTimerElapsed: () => {
      const { _engine } = get();
      _engine.onTimerElapsed();
      get()._syncFromEngine();
    },

    // === Penalty Calibration (Delegates to Engine) ===
    incrementCalibration: () => {
      const { _engine } = get();
      _engine.incrementCalibration();
      get()._syncFromEngine();
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

    // === Determination & Outcome (Delegates to Engine) ===
    setDetermination: (determination: Determination) => {
      const { _engine } = get();
      _engine.makeDetermination(determination);
      get()._syncFromEngine();
    },

    // === UI State ===
    toggleRoleVisibility: () => {
      set((state) => ({ roleVisible: !state.roleVisible }));
    },

    // === Sync Check ===
    getStateHash: (): string => {
      const { seed, gameState, selectedPacket, selectedPenalty, selectedRole } = get();
      const hash = `${seed}-${gameState}-${selectedPacket?.id}-${selectedPenalty?.id}-${selectedRole?.roleType}`;
      return btoa(hash);
    },

    // === Internal: Sync Zustand from Engine ===
    _syncFromEngine: () => {
      const { _engine } = get();
      const engineState = _engine.getState();

      set({
        gameState: engineState.currentState,
        selectedPacket: engineState.selectedPacket,
        selectedPenalty: engineState.selectedPenalty,
        selectedRole: engineState.selectedRole,
        selectedBackground: engineState.selectedBackground,
        inducerPattern: engineState.inducerPattern,
        shuffledQuestions: engineState.shuffledQuestions,
        penaltyCalibration: engineState.penaltyCalibration,
        timerStarted: engineState.timerStarted,
        timerElapsed: engineState.timerElapsed,
        determination: engineState.determination,
        outcome: engineState.outcome,
        playerRole: engineState.config.playerRole,
      });
    },
  };
});
