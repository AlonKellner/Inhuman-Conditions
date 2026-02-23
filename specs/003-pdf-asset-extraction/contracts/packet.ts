/**
 * TypeScript Interface Contract: Packet and Question (Updated)
 *
 * Feature: 003-pdf-asset-extraction
 * Phase: Integration (US5)
 * Changes:
 * - Added optional `cardImage` field to Question interface
 * - Added optional `coverSheetImage` field to Packet interface
 *
 * Purpose: Represents game modules/packets and investigator question cards
 * Location: src/types/packet.ts
 * Data: src/data/packets.ts
 */

/**
 * Question type classification
 */
export type QuestionType = 'primary' | 'secondary';

/**
 * Question Interface (UPDATED for PDF asset integration)
 *
 * NEW FIELD: `cardImage` - Optional path to question card image PNG
 * When present, UI should display this image instead of rendering text+examples
 *
 * Integration Notes:
 * - `cardImage` is optional (?) for backward compatibility
 * - Points to PNG files in `public/assets/cards/investigator/` directory
 * - Primary questions: page 2 of investigator PDFs
 * - Secondary questions: page 3 of investigator PDFs
 * - UI renders card image when present, falls back to text display if undefined
 */
export interface Question {
  /**
   * Unique identifier for this question
   * Format: '{module}-{type}-{number}'
   * Examples: 'small-talk-primary-01', 'imagination-secondary-03'
   */
  id: string;

  /**
   * Question category
   * - 'primary': Main interview questions (page 2 of investigator PDFs)
   * - 'secondary': Follow-up questions (page 3 of investigator PDFs)
   */
  type: QuestionType;

  /**
   * Main question text
   * The core question Investigator asks Suspect
   * Examples:
   * - "What did you do yesterday?"
   * - "Can you describe your earliest memory?"
   * - "How would you solve this problem?"
   */
  text: string;

  /**
   * Example follow-up questions
   * Array of suggested prompts to dig deeper
   * Examples:
   * - "Can you be more specific?"
   * - "How did that make you feel?"
   * - "What happened next?"
   */
  examples: string[];

  /**
   * [NEW] Path to question card image PNG
   *
   * Points to extracted PDF question card asset showing complete card design
   * Located in public/assets/cards/investigator/ directory
   *
   * Format: "/assets/cards/investigator/{module}_investigator_p{page}_c{num}_{type}-prompts.png"
   * Where:
   * - {module}: Module identifier (e.g., "01_small_talk")
   * - {page}: Page number (2=primary, 3=secondary)
   * - {num}: Card number (01, 02, 03)
   * - {type}: Question type (primary, secondary)
   *
   * Examples:
   * - "/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png"
   * - "/assets/cards/investigator/03_imagination_investigator_p3_c02_secondary-prompts.png"
   *
   * UI Behavior:
   * - If defined: Display full question card image (includes text, examples, design)
   * - If undefined: Render custom widgets showing text + examples fields
   *
   * Validation:
   * - Must start with "/assets/cards/investigator/"
   * - Must reference existing PNG file
   * - Content type in filename must match `type` field (primary vs secondary)
   * - File must exist in public/assets/cards/investigator/ directory
   */
  cardImage?: string;
}

/**
 * Packet role configuration
 * Maps available catalyzer cards to this packet
 */
export interface PacketRole {
  /**
   * Role type identifier
   * Must match CatalyzerCard.roleType values
   */
  roleType: 'human' | 'patient-robot' | 'violent-robot';

  /**
   * Array of catalyzer card IDs available for this role
   * References CatalyzerCard.id values
   * Examples: ['small-talk-human-01', 'small-talk-human-02']
   */
  cardIds: string[];
}

/**
 * Packet Interface (UPDATED for PDF asset integration)
 *
 * NEW FIELD: `coverSheetImage` - Optional path to cover sheet image PNG
 * When present, UI should display this image in packet selection screen
 *
 * Integration Notes:
 * - `coverSheetImage` is optional (?) for backward compatibility
 * - Points to PNG files in `public/assets/cards/investigator/` directory
 * - Cover sheets are page 1 of investigator PDFs
 * - Displays packet overview before interview begins
 */
export interface Packet {
  /**
   * Unique packet identifier
   * Used as foreign key in CatalyzerCard.packetId
   * Examples: 'small-talk', 'imagination', 'threat-assessment'
   */
  id: string;

  /**
   * Human-readable packet name
   * Displayed in packet selection UI
   * Examples: "Small Talk", "Imagination", "Threat Assessment"
   */
  name: string;

  /**
   * Difficulty rating
   * User-facing difficulty level
   * Examples: "Beginner", "Intermediate", "Advanced", "Expert"
   */
  difficulty: string;

  /**
   * Icon identifier
   * Reference to module icon asset
   * Examples: "chat", "lightbulb", "shield"
   */
  icon: string;

  /**
   * Packet introduction text
   * Brief description of module theme and interview approach
   * Displayed to Investigator before interview begins
   */
  prompt: string;

  /**
   * Array of investigator questions for this packet
   * Includes both primary and secondary questions
   * Typically 3-5 primary questions and 3-5 secondary questions
   */
  questions: Question[];

  /**
   * Available role configurations for this packet
   * Maps role types to available catalyzer card IDs
   * Typically includes human, patient-robot, and violent-robot roles
   */
  roles: PacketRole[];

  /**
   * [NEW] Path to cover sheet image PNG
   *
   * Points to extracted PDF cover sheet asset showing packet overview
   * Located in public/assets/cards/investigator/ directory
   *
   * Format: "/assets/cards/investigator/{module}_investigator_p1_c01_cover-sheet.png"
   * Where:
   * - {module}: Module identifier (e.g., "01_small_talk")
   * - p1: Cover sheets are always on page 1
   * - c01: Usually one cover sheet per module
   *
   * Examples:
   * - "/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png"
   * - "/assets/cards/investigator/05_hopes_investigator_p1_c01_cover-sheet.png"
   *
   * UI Behavior:
   * - If defined: Display cover sheet in packet selection or before interview starts
   * - If undefined: Render packet info using name, difficulty, prompt fields
   *
   * Validation:
   * - Must start with "/assets/cards/investigator/"
   * - Must contain "cover-sheet" in filename
   * - Must reference existing PNG file
   * - File must exist in public/assets/cards/investigator/ directory
   * - Each packet should have exactly one cover sheet
   */
  coverSheetImage?: string;
}

/**
 * Type guard to check if a question is primary
 */
export function isPrimaryQuestion(question: Question): boolean {
  return question.type === 'primary';
}

/**
 * Type guard to check if a question is secondary
 */
export function isSecondaryQuestion(question: Question): boolean {
  return question.type === 'secondary';
}

/**
 * Validation function for Question
 * Returns array of validation error messages (empty if valid)
 */
export function validateQuestion(question: Question): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!question.id) errors.push('id is required');
  if (!question.type) errors.push('type is required');
  if (!question.text) errors.push('text is required');
  if (!question.examples || question.examples.length === 0) {
    errors.push('examples array is required and must have at least one item');
  }

  // Type validation
  if (question.type !== 'primary' && question.type !== 'secondary') {
    errors.push('type must be either "primary" or "secondary"');
  }

  // cardImage path validation (if present)
  if (question.cardImage) {
    if (!question.cardImage.startsWith('/assets/cards/investigator/')) {
      errors.push('cardImage path must start with "/assets/cards/investigator/"');
    }
    if (!question.cardImage.endsWith('.png')) {
      errors.push('cardImage must be a PNG file');
    }

    // Validate content type matches question type
    const isPrimaryCard = question.cardImage.includes('primary-prompts');
    const isSecondaryCard = question.cardImage.includes('secondary-prompts');

    if (question.type === 'primary' && !isPrimaryCard) {
      errors.push('primary question must have cardImage with "primary-prompts" in filename');
    }
    if (question.type === 'secondary' && !isSecondaryCard) {
      errors.push('secondary question must have cardImage with "secondary-prompts" in filename');
    }
  }

  return errors;
}

/**
 * Validation function for Packet
 * Returns array of validation error messages (empty if valid)
 */
export function validatePacket(packet: Packet): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!packet.id) errors.push('id is required');
  if (!packet.name) errors.push('name is required');
  if (!packet.difficulty) errors.push('difficulty is required');
  if (!packet.icon) errors.push('icon is required');
  if (!packet.prompt) errors.push('prompt is required');
  if (!packet.questions || packet.questions.length === 0) {
    errors.push('questions array is required and must have at least one question');
  }
  if (!packet.roles || packet.roles.length === 0) {
    errors.push('roles array is required and must have at least one role');
  }

  // Validate each question
  packet.questions.forEach((question, index) => {
    const questionErrors = validateQuestion(question);
    if (questionErrors.length > 0) {
      errors.push(`Question ${index}: ${questionErrors.join(', ')}`);
    }
  });

  // Validate question distribution (should have both primary and secondary)
  const primaryCount = packet.questions.filter(q => q.type === 'primary').length;
  const secondaryCount = packet.questions.filter(q => q.type === 'secondary').length;

  if (primaryCount === 0) {
    errors.push('packet must have at least one primary question');
  }
  if (secondaryCount === 0) {
    errors.push('packet must have at least one secondary question');
  }

  // coverSheetImage path validation (if present)
  if (packet.coverSheetImage) {
    if (!packet.coverSheetImage.startsWith('/assets/cards/investigator/')) {
      errors.push('coverSheetImage path must start with "/assets/cards/investigator/"');
    }
    if (!packet.coverSheetImage.endsWith('.png')) {
      errors.push('coverSheetImage must be a PNG file');
    }
    if (!packet.coverSheetImage.includes('cover-sheet')) {
      errors.push('coverSheetImage must contain "cover-sheet" in filename');
    }
  }

  return errors;
}

/**
 * Helper function to get all questions of a specific type from a packet
 */
export function getQuestionsByType(packet: Packet, type: QuestionType): Question[] {
  return packet.questions.filter(q => q.type === type);
}

/**
 * Helper function to get primary questions from a packet
 */
export function getPrimaryQuestions(packet: Packet): Question[] {
  return getQuestionsByType(packet, 'primary');
}

/**
 * Helper function to get secondary questions from a packet
 */
export function getSecondaryQuestions(packet: Packet): Question[] {
  return getQuestionsByType(packet, 'secondary');
}
