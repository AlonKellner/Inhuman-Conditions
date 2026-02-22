/**
 * Core Game Engine Types
 * Pure TypeScript interfaces for game logic (no React dependencies)
 */

import type {
  Seed,
  GameState,
  Packet,
  Penalty,
  Background,
  RoleAssignment,
  InducerPattern,
  Question,
} from '../types';

/**
 * Game Engine Configuration
 */
export interface GameConfig {
  seed: Seed;
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

  // Game progress
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
    actualRole: string;
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
 * Game Engine Events
 * Events that the engine can emit
 */
export type GameEngineEvent =
  | { type: 'STATE_CHANGED'; from: GameState; to: GameState }
  | { type: 'GAME_INITIALIZED'; seed: Seed }
  | { type: 'TIMER_STARTED' }
  | { type: 'TIMER_ELAPSED' }
  | { type: 'CALIBRATION_INCREMENTED'; attempts: number }
  | { type: 'DETERMINATION_MADE'; determination: 'human' | 'robot' }
  | { type: 'GAME_RESET' };

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

  // State transitions
  advanceState(): StateTransition;
  canAdvanceState(): boolean;

  // Game actions
  startTimer(): void;
  incrementCalibration(): void;
  makeDetermination(determination: 'human' | 'robot'): void;

  // Event subscription
  subscribe(callback: (event: GameEngineEvent) => void): () => void;
}
