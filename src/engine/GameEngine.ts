/**
 * Game Engine
 * Core game orchestration - pure TypeScript, no React dependencies
 * Implements Constitution Principle VII: Separation of Game Logic from UI
 */

import { ContentSelector } from './ContentSelector';
import { StateValidator } from './StateValidator';
import type {
  IGameEngine,
  GameConfig,
  GameEngineState,
  StateTransition,
  GameEngineEvent,
} from './types';
import type { GameState } from '../types';
import { RoleType } from '../types';

/**
 * GameEngine class
 * Manages all game rules, state transitions, and validations
 */
export class GameEngine implements IGameEngine {
  private state: GameEngineState;
  private validator: StateValidator;
  private subscribers: Set<(event: GameEngineEvent) => void>;

  constructor() {
    this.validator = new StateValidator();
    this.subscribers = new Set();
    this.state = this.createInitialState();
  }

  /**
   * Create initial empty state
   */
  private createInitialState(): GameEngineState {
    return {
      config: {
        seed: null,
        mode: 'single-device',
        playerRole: null,
      },
      currentState: 'seed-entry',
      selectedPacket: null,
      selectedPenalty: null,
      selectedRole: null,
      selectedBackground: null,
      inducerPattern: null,
      shuffledQuestions: null,
      penaltyCalibration: {
        penaltyText: '',
        practiceAttempts: 0,
        maxAttempts: 3,
        isComplete: false,
        lastAttemptTimestamp: null,
      },
      timerStarted: false,
      timerElapsed: false,
      determination: null,
      outcome: null,
    };
  }

  /**
   * Get current game state
   */
  getState(): GameEngineState {
    return { ...this.state };
  }

  /**
   * Initialize game with configuration
   */
  initialize(config: GameConfig): void {
    if (!config.seed) {
      throw new Error('Seed is required to initialize game');
    }

    // Select all game content deterministically
    const selector = new ContentSelector(config.seed);
    const content = selector.selectContent();

    // Set default player role for single-device mode
    const playerRole =
      config.playerRole || (config.mode === 'single-device' ? 'investigator' : null);

    // Update state with selected content
    this.state = {
      ...this.state,
      config: {
        ...config,
        playerRole,
      },
      selectedPacket: content.packet,
      selectedPenalty: content.penalty,
      selectedRole: content.role,
      selectedBackground: content.background,
      inducerPattern: content.inducerPattern,
      shuffledQuestions: content.shuffledQuestions,
      penaltyCalibration: {
        penaltyText: content.penalty.text,
        practiceAttempts: 0,
        maxAttempts: 3,
        isComplete: false,
        lastAttemptTimestamp: null,
      },
    };

    this.emit({
      type: 'GAME_INITIALIZED',
      seed: config.seed,
    });
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    const previousSeed = this.state.config.seed;
    this.state = this.createInitialState();
    if (previousSeed) {
      this.state.config.seed = previousSeed;
    }

    this.emit({ type: 'GAME_RESET' });
  }

  /**
   * Update player role
   */
  setPlayerRole(role: PlayerRole | null): void {
    this.state.config.playerRole = role;
  }

  /**
   * Update game mode
   */
  setMode(mode: GameMode): void {
    this.state.config.mode = mode;
  }

  /**
   * Advance to next state in the game flow
   */
  advanceState(): StateTransition {
    const nextState = this.validator.getNextState(this.state.currentState);

    if (!nextState) {
      return {
        from: this.state.currentState,
        to: this.state.currentState,
        isValid: false,
        reason: 'No valid next state',
      };
    }

    const transition = this.validator.validateTransition(this.state.currentState, nextState);

    if (!transition.isValid) {
      return transition;
    }

    const from = this.state.currentState;
    this.state.currentState = nextState;

    this.emit({
      type: 'STATE_CHANGED',
      from,
      to: nextState,
    });

    return transition;
  }

  /**
   * Check if state can be advanced
   */
  canAdvanceState(): boolean {
    const nextState = this.validator.getNextState(this.state.currentState);
    if (!nextState) {
      return false;
    }
    const transition = this.validator.validateTransition(this.state.currentState, nextState);
    return transition.isValid;
  }

  /**
   * Start the interview timer
   */
  startTimer(): void {
    const validation = this.validator.validateTimerStart(
      this.state.currentState,
      this.state.timerStarted
    );

    if (!validation.isValid) {
      throw new Error(validation.reason || 'Cannot start timer');
    }

    this.state.timerStarted = true;

    this.emit({ type: 'TIMER_STARTED' });
  }

  /**
   * Mark timer as elapsed
   */
  onTimerElapsed(): void {
    this.state.timerElapsed = true;

    this.emit({ type: 'TIMER_ELAPSED' });
  }

  /**
   * Increment penalty calibration attempts
   */
  incrementCalibration(): void {
    const { practiceAttempts, maxAttempts } = this.state.penaltyCalibration;

    const validation = this.validator.validatePenaltyCalibration(
      practiceAttempts + 1,
      maxAttempts
    );

    if (!validation.isValid) {
      throw new Error(validation.reason || 'Cannot increment calibration');
    }

    const newAttempts = practiceAttempts + 1;

    this.state.penaltyCalibration = {
      ...this.state.penaltyCalibration,
      practiceAttempts: newAttempts,
      isComplete: newAttempts >= maxAttempts,
      lastAttemptTimestamp: Date.now(),
    };

    this.emit({
      type: 'CALIBRATION_INCREMENTED',
      attempts: newAttempts,
    });
  }

  /**
   * Make final determination
   */
  makeDetermination(determination: 'human' | 'robot'): void {
    if (!this.state.selectedRole) {
      throw new Error('Cannot make determination without selected role');
    }

    const actualRole = this.state.selectedRole.roleType;

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

    this.state.determination = determination;
    this.state.outcome = {
      determination,
      actualRole,
      correct,
    };

    this.emit({
      type: 'DETERMINATION_MADE',
      determination,
    });
  }

  /**
   * Subscribe to game engine events
   */
  subscribe(callback: (event: GameEngineEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Emit event to all subscribers
   */
  private emit(event: GameEngineEvent): void {
    this.subscribers.forEach((callback) => callback(event));
  }
}
