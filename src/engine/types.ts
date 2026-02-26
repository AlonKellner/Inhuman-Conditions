/**
 * Core Game Engine Types
 * Pure TypeScript interfaces for game logic (no React dependencies)
 */

import type {
  Seed,
  GameState,
  GameMode,
  PlayerRole,
  Packet,
  Penalty,
  PenaltySelectionState,
  Background,
  RoleAssignment,
  InducerPattern,
  Question,
} from '../types';

/**
 * Game Engine Configuration
 */
export interface GameConfig {
  seed: Seed | null;
  mode: 'single-device' | 'multi-device' | 'timer-only';
  playerRole?: 'investigator' | 'suspect' | 'spectator' | null;
}

/**
 * Complete Game State
 * All data needed to represent the current game state
 */
export interface GameEngineState {
  // Configuration
  config: GameConfig;

  // Current state
  currentState: GameState;

  // Selected content (determined by seed)
  selectedPacket: Packet | null;
  selectedPenalty: Penalty | null;
  selectedRole: RoleAssignment | null;
  selectedBackground: Background | null;
  inducerPattern: InducerPattern | null;
  shuffledQuestions: Question[] | null;

  // Content cycling (enables players to cycle through alternatives)
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

  // Game progress
  penaltySelection: PenaltySelectionState | null;
  penaltyCalibration: {
    penaltyText: string;
    practiceAttempts: number;
    maxAttempts: number;
    isComplete: boolean;
    lastAttemptTimestamp: number | null;
  };

  // Interview state
  timerStarted: boolean;
  timerElapsed: boolean;

  // Conclusion
  determination: 'human' | 'robot' | null;
  outcome: {
    determination: 'human' | 'robot';
    actualRole: 'human' | 'patient-robot' | 'violent-robot';
    correct: boolean;
  } | null;
}

/**
 * State Transition Definition
 */
export interface StateTransition {
  from: GameState;
  to: GameState;
  isValid: boolean;
  reason?: string;
}

/**
 * Content Type for Cycling
 */
export type ContentType = 'packet' | 'penalty' | 'background' | 'role';

/**
 * Cycle Direction
 */
export type CycleDirection = 'next' | 'previous';

/**
 * Game Engine Events
 * Events that the engine can emit
 */
export type GameEngineEvent =
  | { type: 'STATE_CHANGED'; from: GameState; to: GameState }
  | { type: 'GAME_INITIALIZED'; seed: Seed }
  | { type: 'PENALTY_SELECTION_INITIALIZED'; penalties: Penalty[] }
  | { type: 'PENALTY_ELIMINATED'; penaltyId: string }
  | { type: 'PENALTY_CHOSEN'; penaltyId: string }
  | { type: 'TIMER_STARTED' }
  | { type: 'TIMER_ELAPSED' }
  | { type: 'CALIBRATION_INCREMENTED'; attempts: number }
  | { type: 'DETERMINATION_MADE'; determination: 'human' | 'robot' }
  | { type: 'GAME_RESET' }
  | { type: 'CONTENT_CYCLED'; contentType: ContentType; direction: CycleDirection; newIndex: number };

/**
 * Game Engine Interface
 * Pure game logic contract (no React)
 */
export interface IGameEngine {
  // State access
  getState(): GameEngineState;

  // Initialization
  initialize(config: GameConfig): void;
  reset(): void;

  // Configuration
  setPlayerRole(role: PlayerRole | null): void;
  setMode(mode: GameMode): void;

  // State transitions
  advanceState(): StateTransition;
  canAdvanceState(): boolean;

  // Game actions
  initializePenaltySelection(): void;
  eliminatePenalty(penaltyId: string): void;
  choosePenalty(penaltyId: string): void;
  startTimer(): void;
  incrementCalibration(): void;
  makeDetermination(determination: 'human' | 'robot'): void;

  // Content cycling
  cycleContent(contentType: ContentType, direction: CycleDirection): void;

  // Event subscription
  subscribe(callback: (event: GameEngineEvent) => void): () => void;
}
