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
  ContentType,
  CycleDirection,
} from './types';
import { RoleType, GameMode, PlayerRole } from '../types';

/**
 * GameEngine class
 * Manages all game rules, state transitions, and validations
 */
export class GameEngine implements IGameEngine {
  private state: GameEngineState;
  private validator: StateValidator;
  private subscribers: Set<(event: GameEngineEvent) => void>;
  private contentSelector: ContentSelector | null = null;

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

    // Create ContentSelector instance for cycling
    this.contentSelector = new ContentSelector(config.seed);

    // Generate permutations to get sizes
    const permutations = this.contentSelector.generatePermutations();

    // Initialize indices to 0 (first item in each permutation)
    const initialIndices = {
      packetIndex: 0,
      penaltyIndex: 0,
      backgroundIndex: 0,
      roleIndex: 0,
    };

    // Select content at initial indices
    const content = this.contentSelector.selectContentAtIndices(initialIndices);

    // Set default player role for single-device mode
    const playerRole =
      config.playerRole || (config.mode === 'single-device' ? 'investigator' : null);

    // Update state with selected content and permutation sizes
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
      contentIndices: initialIndices,
      permutationSizes: {
        packets: permutations.packets.length,
        penalties: permutations.penalties.length,
        backgrounds: permutations.backgrounds.length,
        roles: 12, // Always 12 roles (4 human, 6 patient, 2 violent)
      },
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
    this.contentSelector = null;

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
   * Cycle through content alternatives (penalties, packets, backgrounds, roles)
   * Enables players to explore all options while maintaining determinism
   */
  cycleContent(contentType: ContentType, direction: CycleDirection): void {
    if (!this.contentSelector) {
      throw new Error('Game must be initialized before cycling content');
    }

    // Get current indices and sizes
    const currentIndices = { ...this.state.contentIndices };
    const sizes = this.state.permutationSizes;

    // Calculate new index based on content type and direction
    let currentIndex: number;
    let size: number;

    switch (contentType) {
      case 'packet':
        currentIndex = currentIndices.packetIndex;
        size = sizes.packets;
        break;
      case 'penalty':
        currentIndex = currentIndices.penaltyIndex;
        size = sizes.penalties;
        break;
      case 'background':
        currentIndex = currentIndices.backgroundIndex;
        size = sizes.backgrounds;
        break;
      case 'role':
        currentIndex = currentIndices.roleIndex;
        size = sizes.roles;
        break;
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }

    // Calculate new index with wraparound
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % size
        : (currentIndex - 1 + size) % size;

    // Update indices
    switch (contentType) {
      case 'packet':
        currentIndices.packetIndex = newIndex;
        break;
      case 'penalty':
        currentIndices.penaltyIndex = newIndex;
        break;
      case 'background':
        currentIndices.backgroundIndex = newIndex;
        break;
      case 'role':
        currentIndices.roleIndex = newIndex;
        break;
    }

    // Select new content with updated indices
    const newContent = this.contentSelector.selectContentAtIndices(currentIndices);

    // Update state with new content and indices
    this.state = {
      ...this.state,
      contentIndices: currentIndices,
      selectedPacket: newContent.packet,
      selectedPenalty: newContent.penalty,
      selectedRole: newContent.role,
      selectedBackground: newContent.background,
      inducerPattern: newContent.inducerPattern,
      shuffledQuestions: newContent.shuffledQuestions,
    };

    // Update penalty calibration text if penalty changed
    if (contentType === 'penalty') {
      this.state.penaltyCalibration = {
        ...this.state.penaltyCalibration,
        penaltyText: newContent.penalty.text,
        // Reset practice attempts when penalty changes
        practiceAttempts: 0,
        isComplete: false,
      };
    }

    // Emit content cycled event
    this.emit({
      type: 'CONTENT_CYCLED',
      contentType,
      direction,
      newIndex,
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
