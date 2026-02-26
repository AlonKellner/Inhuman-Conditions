/**
 * Zustand Game Store (GameEngine Integration)
 * UI state management layer that delegates game logic to GameEngine
 * Implements Constitution Principle VII: Separation of Game Logic from UI
 * Implements the API contract from contracts/game-state-api.md
 */

import { create } from 'zustand';
import { GameEngine } from '../engine/GameEngine';
import type { ContentType, CycleDirection } from '../engine/types';
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
  PenaltySelectionState,
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

  // === Content Cycling ===
  contentIndices: {
    packetIndex: number;
    penaltyIndex: number;
    backgroundIndex: number;
    roleIndex: number;
  };
  permutationSizes: {
    packets: number;
    penalties: number;
    backgrounds: number;
    roles: number;
  };
  cycleContent: (contentType: ContentType, direction: CycleDirection) => void;
  selectContentById: (contentType: 'packet' | 'background', id: string) => void;

  // === Game Initialization ===
  initializeGame: () => void;

  // === Interview State ===
  timerStarted: boolean;
  timerElapsed: boolean;
  startTimer: () => void;
  onTimerElapsed: () => void;

  // === Penalty Selection ===
  penaltySelection: PenaltySelectionState | null;
  initializePenaltySelection: () => void;
  eliminatePenalty: (penaltyId: string) => void;
  choosePenalty: (penaltyId: string) => void;

  // === Penalty Calibration ===
  penaltyCalibration: PenaltyCalibrationState;
  incrementCalibration: () => void;
  resetCalibration: () => void;

  // === Conclusion ===
  determination: Determination | null;
  setDetermination: (determination: Determination) => void;
  outcome: GameOutcome | null;

  // === VK-82(e) Investigator Form ===
  investigatorForm: {
    penaltyAttempts: { attempt1: boolean; attempt2: boolean; attempt3: boolean };
    inducerResult: 'yes' | 'no' | null;
    suspectName: { first: string; middle: string; last: string };
    investigatorNotes: string;
    signature: string;
    date: string;
    performanceReview: 'correct' | 'incorrect' | 'na' | null;
  };
  updateFormPenaltyAttempt: (attemptNumber: 1 | 2 | 3, checked: boolean) => void;
  updateFormInducerResult: (result: 'yes' | 'no' | null) => void;
  updateFormSuspectName: (name: { first: string; middle: string; last: string }) => void;
  updateFormNotes: (notes: string) => void;
  updateFormSignature: (signature: string) => void;
  submitInvestigatorForm: () => void; // Auto-fills performance review and advances state
  resetInvestigatorForm: () => void;

  // === UI State ===
  roleVisible: boolean;
  toggleRoleVisibility: () => void;

  // === Sync Check ===
  getStateHash: () => string;

  // === Internal Sync Method ===
  _syncFromEngine: () => void;
}

/**
 * Factory function to create an independent game store instance
 * Each instance has its own GameEngine and state
 */
function createGameStoreInstance() {
  return create<GameStore>((set, get) => {
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
    contentIndices: {
      packetIndex: 0,
      penaltyIndex: 0,
      backgroundIndex: 0,
      roleIndex: 0,
    },
    permutationSizes: {
      packets: 0,
      penalties: 0,
      backgrounds: 0,
      roles: 0,
    },
    timerStarted: false,
    timerElapsed: false,
    penaltySelection: null,
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

    // === VK-82(e) Investigator Form ===
    investigatorForm: {
      penaltyAttempts: { attempt1: false, attempt2: false, attempt3: false },
      inducerResult: null,
      suspectName: { first: '', middle: '', last: '' },
      investigatorNotes: '',
      signature: '',
      date: new Date().toLocaleDateString('en-US'),
      performanceReview: null,
    },

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
        contentIndices: {
          packetIndex: 0,
          penaltyIndex: 0,
          backgroundIndex: 0,
          roleIndex: 0,
        },
        permutationSizes: {
          packets: 0,
          penalties: 0,
          backgrounds: 0,
          roles: 0,
        },
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
        investigatorForm: {
          penaltyAttempts: { attempt1: false, attempt2: false, attempt3: false },
          inducerResult: null,
          suspectName: { first: '', middle: '', last: '' },
          investigatorNotes: '',
          signature: '',
          date: new Date().toLocaleDateString('en-US'),
          performanceReview: null,
        },
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

    // === Penalty Selection (Delegates to Engine) ===
    initializePenaltySelection: () => {
      const { _engine } = get();
      _engine.initializePenaltySelection();
      get()._syncFromEngine();
    },

    eliminatePenalty: (penaltyId: string) => {
      const { _engine } = get();
      _engine.eliminatePenalty(penaltyId);
      get()._syncFromEngine();
    },

    choosePenalty: (penaltyId: string) => {
      const { _engine } = get();
      _engine.choosePenalty(penaltyId);
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

    // === Content Cycling (Delegates to Engine) ===
    cycleContent: (contentType: ContentType, direction: CycleDirection) => {
      const { _engine } = get();
      _engine.cycleContent(contentType, direction);
      get()._syncFromEngine();
    },

    selectContentById: (contentType: 'packet' | 'background', id: string) => {
      const { _engine } = get();
      _engine.selectContentById(contentType, id);
      get()._syncFromEngine();
    },

    // === UI State ===
    // === VK-82(e) Investigator Form Methods ===
    updateFormPenaltyAttempt: (attemptNumber: 1 | 2 | 3, checked: boolean) => {
      set((state) => ({
        investigatorForm: {
          ...state.investigatorForm,
          penaltyAttempts: {
            ...state.investigatorForm.penaltyAttempts,
            [`attempt${attemptNumber}`]: checked,
          },
        },
      }));
    },

    updateFormInducerResult: (result: 'yes' | 'no' | null) => {
      set((state) => ({
        investigatorForm: {
          ...state.investigatorForm,
          inducerResult: result,
        },
      }));
    },

    updateFormSuspectName: (name: { first: string; middle: string; last: string }) => {
      set((state) => ({
        investigatorForm: {
          ...state.investigatorForm,
          suspectName: {
            first: name.first.slice(0, 15), // Max 15 characters
            middle: name.middle.slice(0, 1), // Max 1 character
            last: name.last.slice(0, 15), // Max 15 characters
          },
        },
      }));
    },

    updateFormNotes: (notes: string) => {
      set((state) => ({
        investigatorForm: {
          ...state.investigatorForm,
          investigatorNotes: notes,
        },
      }));
    },

    updateFormSignature: (signature: string) => {
      set((state) => ({
        investigatorForm: {
          ...state.investigatorForm,
          signature,
        },
      }));
    },

    submitInvestigatorForm: () => {
      const { selectedRole } = get();

      // Auto-fill performance review based on determination vs actual role
      let performanceReview: 'correct' | 'incorrect' | 'na' = 'incorrect';

      if (selectedRole) {
        const actualIsRobot = selectedRole.roleType !== 'human';
        const investigatorSaidRobot = get().determination === 'robot';

        if (actualIsRobot === investigatorSaidRobot) {
          // Investigator was correct
          performanceReview = 'correct';
        } else {
          // Investigator was incorrect
          // If the actual suspect was a violent robot, investigator is dead (N/A)
          // If the actual suspect was a patient robot or human, investigator is just incorrect
          if (selectedRole.roleType === 'violent-robot') {
            performanceReview = 'na';
          } else {
            performanceReview = 'incorrect';
          }
        }
      }

      // Update form with performance review
      set((state) => ({
        investigatorForm: {
          ...state.investigatorForm,
          performanceReview,
        },
      }));

      // Advance to conclusion state
      get().advanceState();
    },

    resetInvestigatorForm: () => {
      set({
        investigatorForm: {
          penaltyAttempts: { attempt1: false, attempt2: false, attempt3: false },
          inducerResult: null,
          suspectName: { first: '', middle: '', last: '' },
          investigatorNotes: '',
          signature: '',
          date: new Date().toLocaleDateString('en-US'),
          performanceReview: null,
        },
      });
    },

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
        contentIndices: engineState.contentIndices,
        permutationSizes: engineState.permutationSizes,
        penaltySelection: engineState.penaltySelection,
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
}

// Create two independent store instances - one for each role
export const useInvestigatorStore = createGameStoreInstance();
export const useSuspectStore = createGameStoreInstance();

// Deprecated: This will be replaced by context-aware useGameStore from GameStoreContext
// For now, it points to investigator store for backwards compatibility during transition
export const useGameStore = useInvestigatorStore;
