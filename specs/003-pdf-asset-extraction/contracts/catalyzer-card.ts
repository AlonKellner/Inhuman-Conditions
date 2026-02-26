/**
 * TypeScript Interface Contract: CatalyzerCard (Updated)
 *
 * Feature: 003-pdf-asset-extraction
 * Phase: Integration (US5)
 * Change: Added optional `cardImage` field for full card PNG display
 *
 * Purpose: Represents a Robot Catalyzer card shown to Suspect player during role reveal
 * Location: src/types/catalyzer.ts
 * Data: src/data/catalyzerCards.ts
 */

/**
 * Role type for catalyzer cards
 */
export type RoleType = 'human' | 'patient-robot' | 'violent-robot';

/**
 * Robot fault types (patient and violent robots only)
 */
export type RobotFault =
  | 'ltm'          // Long-term memory fault (patient robot)
  | 'stm'          // Short-term memory fault (patient robot)
  | 'proprioception'  // Body awareness fault (patient robot)
  | 'empathy'      // Empathy fault (violent robot)
  | 'impulse'      // Impulse control fault (violent robot)
  | 'self-preservation'; // Self-preservation fault (violent robot)

/**
 * Catalyzer Card Interface (UPDATED for PDF asset integration)
 *
 * NEW FIELD: `cardImage` - Optional path to full card image PNG
 * When present, UI should display this image instead of building custom widgets
 *
 * Integration Notes:
 * - `cardImage` is optional (?) for backward compatibility
 * - Points to PNG files in `public/assets/cards/suspect/` directory
 * - Example: "/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png"
 * - UI renders card image when present, falls back to custom widgets if undefined
 */
export interface CatalyzerCard {
  /**
   * Unique identifier for this catalyzer card
   * Format: '{module}-{roleType}-{number}' or '{module}-{fault}-{number}'
   * Examples: 'small-talk-human-01', 'imagination-ltm-02', 'threat-empathy-01'
   */
  id: string;

  /**
   * Reference to parent packet/module
   * Must match a valid Packet.id
   * Examples: 'small-talk', 'imagination', 'threat-assessment'
   */
  packetId: string;

  /**
   * Role type for this card
   * - 'human': Human player (no robot faults)
   * - 'patient-robot': Patient robot (ltm, stm, or proprioception fault)
   * - 'violent-robot': Violent robot (empathy, impulse, or self-preservation fault)
   */
  roleType: RoleType;

  /**
   * Robot malfunction type (patient-robot or violent-robot only)
   * Undefined for human roles
   *
   * Patient robot faults: 'ltm', 'stm', 'proprioception'
   * Violent robot faults: 'empathy', 'impulse', 'self-preservation'
   */
  fault?: RobotFault;

  /**
   * Human-readable role description
   * Used for screen readers and fallback text display
   * Examples: "Patient Robot with long-term memory fault",
   *           "Human player",
   *           "Violent Robot with empathy fault"
   */
  description: string;

  /**
   * Character traits for role-playing
   * Optional guidance for Suspect player
   * Examples: ["forgetful", "curious"], ["analytical", "cold"]
   */
  traits?: string[];

  /**
   * Behavioral restrictions (patient robots only)
   * Array of restriction statements the robot must follow
   * Examples:
   * - "Cannot reference specific events from more than 24 hours ago"
   * - "Cannot remember names of specific people"
   * - "Cannot coordinate multiple limbs simultaneously"
   *
   * Undefined for human roles and violent robots
   */
  restrictions?: string[];

  /**
   * Secret tasks (violent robots only)
   * Array of covert objectives the robot must accomplish
   * Examples:
   * - "Touch your face exactly 3 times during the interview"
   * - "Steer conversation toward topic of violence"
   * - "Make prolonged eye contact when discussing emotions"
   *
   * Undefined for human roles and patient robots
   */
  tasks?: string[];

  /**
   * Path to inducer maze image (5x5 grid directional puzzle)
   * Required for all roles (human, patient, violent)
   * Points to PNG in public/assets/mazes/
   * Examples: "/assets/mazes/small-talk-01-maze.png"
   */
  inducerMazeImage: string;

  /**
   * Solution path for the inducer maze
   * Optional encoded solution string
   * Format: directional sequence (e.g., "RRDDLLUURR")
   */
  inducerSolution?: string;

  /**
   * [NEW] Path to full card image PNG
   *
   * Points to extracted PDF card asset showing complete card design
   * Located in public/assets/cards/suspect/ directory
   *
   * Format: "/assets/cards/suspect/{module}_suspect_p{page}_c{num}_{type}-card.png"
   * Where:
   * - {module}: Module identifier (e.g., "01_small_talk")
   * - {page}: Page number (1=human, 2=patient, 3=violent)
   * - {num}: Card number (01, 02, 03)
   * - {type}: Role type (human, patient, violent)
   *
   * Examples:
   * - "/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png"
   * - "/assets/cards/suspect/03_imagination_suspect_p2_c02_patient-card.png"
   * - "/assets/cards/suspect/08_threat_suspect_p3_c01_violent-card.png"
   *
   * UI Behavior:
   * - If defined: Display full card image (includes maze, restrictions/tasks, all design)
   * - If undefined: Render custom widgets showing individual fields
   *
   * Validation:
   * - Must start with "/assets/cards/suspect/"
   * - Must reference existing PNG file
   * - File must exist in public/assets/cards/suspect/ directory
   */
  cardImage?: string;
}

/**
 * Type guard to check if a card is a robot (patient or violent)
 */
export function isRobot(card: CatalyzerCard): boolean {
  return card.roleType === 'patient-robot' || card.roleType === 'violent-robot';
}

/**
 * Type guard to check if a card is a patient robot
 */
export function isPatientRobot(card: CatalyzerCard): boolean {
  return card.roleType === 'patient-robot';
}

/**
 * Type guard to check if a card is a violent robot
 */
export function isViolentRobot(card: CatalyzerCard): boolean {
  return card.roleType === 'violent-robot';
}

/**
 * Type guard to check if a card is human
 */
export function isHuman(card: CatalyzerCard): boolean {
  return card.roleType === 'human';
}

/**
 * Validation function for CatalyzerCard
 * Returns array of validation error messages (empty if valid)
 */
export function validateCatalyzerCard(card: CatalyzerCard): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!card.id) errors.push('id is required');
  if (!card.packetId) errors.push('packetId is required');
  if (!card.roleType) errors.push('roleType is required');
  if (!card.description) errors.push('description is required');
  if (!card.inducerMazeImage) errors.push('inducerMazeImage is required');

  // Role-specific validation
  if (card.roleType === 'patient-robot') {
    if (!card.fault) errors.push('fault is required for patient robots');
    if (!card.restrictions || card.restrictions.length === 0) {
      errors.push('restrictions are required for patient robots');
    }
    if (card.tasks) {
      errors.push('tasks should not be present for patient robots');
    }
  }

  if (card.roleType === 'violent-robot') {
    if (!card.fault) errors.push('fault is required for violent robots');
    if (!card.tasks || card.tasks.length === 0) {
      errors.push('tasks are required for violent robots');
    }
    if (card.restrictions) {
      errors.push('restrictions should not be present for violent robots');
    }
  }

  if (card.roleType === 'human') {
    if (card.fault) errors.push('fault should not be present for humans');
    if (card.restrictions) errors.push('restrictions should not be present for humans');
    if (card.tasks) errors.push('tasks should not be present for humans');
  }

  // cardImage path validation (if present)
  if (card.cardImage) {
    if (!card.cardImage.startsWith('/assets/cards/suspect/')) {
      errors.push('cardImage path must start with "/assets/cards/suspect/"');
    }
    if (!card.cardImage.endsWith('.png')) {
      errors.push('cardImage must be a PNG file');
    }
  }

  return errors;
}
