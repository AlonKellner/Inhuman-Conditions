/**
 * TypeScript Utility Contract: Card Image Path Mapping
 *
 * Feature: 003-pdf-asset-extraction
 * Phase: Integration (US5)
 * Purpose: Utility functions for generating and validating card image paths
 *
 * Location: src/utils/cardImagePaths.ts (suggested)
 * Dependencies: None (pure utility functions)
 */

/**
 * Entity type for card image path generation
 */
export type CardEntityType = 'suspect' | 'investigator' | 'background' | 'penalty';

/**
 * Content type for suspect cards
 */
export type SuspectContentType = 'human-card' | 'patient-card' | 'violent-card';

/**
 * Content type for investigator cards
 */
export type InvestigatorContentType = 'cover-sheet' | 'primary-prompts' | 'secondary-prompts';

/**
 * All content types
 */
export type ContentType = SuspectContentType | InvestigatorContentType | 'background' | 'penalty';

/**
 * Module identifier mapping (PDF filename → game data packetId)
 * Based on extraction/src/integration/asset_mapper.py MODULE_MAPPING
 */
export const MODULE_MAPPING: Record<string, string> = {
  '01_small_talk': 'small-talk',
  '02_problem_solving': 'creative-problem-solving',
  '03_imagination': 'imagination',
  '04_cooperation': 'cooperation',
  '05_hopes': 'hopes-and-dreams',
  '06_body': 'the-body',
  '07_grief': 'grief-and-loss',
  '08_threat': 'threat-assessment',
  '09_moral_failings': 'moral-failings',
  '10_self_image': 'self-image',
  '11_intentions': 'intentions',
};

/**
 * Reverse mapping: packetId → PDF module identifier
 */
export const REVERSE_MODULE_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(MODULE_MAPPING).map(([key, value]) => [value, key])
);

/**
 * Get card image path for suspect cards
 *
 * @param module - Module identifier (e.g., '01_small_talk')
 * @param page - Page number (1=human, 2=patient, 3=violent)
 * @param cardNumber - Card number (1-based, typically 1-3)
 * @param contentType - Content type ('human-card', 'patient-card', 'violent-card')
 * @returns Absolute path to card image
 *
 * @example
 * getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card')
 * // Returns: '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png'
 */
export function getSuspectCardImagePath(
  module: string,
  page: number,
  cardNumber: number,
  contentType: SuspectContentType
): string {
  const paddedCard = cardNumber.toString().padStart(2, '0');
  return `/assets/cards/suspect/${module}_suspect_p${page}_c${paddedCard}_${contentType}.png`;
}

/**
 * Get card image path for investigator cards
 *
 * @param module - Module identifier (e.g., '01_small_talk')
 * @param page - Page number (1=cover, 2=primary, 3=secondary)
 * @param cardNumber - Card number (1-based, typically 1-3)
 * @param contentType - Content type ('cover-sheet', 'primary-prompts', 'secondary-prompts')
 * @returns Absolute path to card image
 *
 * @example
 * getInvestigatorCardImagePath('01_small_talk', 2, 1, 'primary-prompts')
 * // Returns: '/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png'
 */
export function getInvestigatorCardImagePath(
  module: string,
  page: number,
  cardNumber: number,
  contentType: InvestigatorContentType
): string {
  const paddedCard = cardNumber.toString().padStart(2, '0');
  return `/assets/cards/investigator/${module}_investigator_p${page}_c${paddedCard}_${contentType}.png`;
}

/**
 * Get card image path for background cards
 *
 * @param page - Page number (1-based)
 * @param cardNumber - Card number (1-based)
 * @returns Absolute path to background card image
 *
 * @example
 * getBackgroundCardImagePath(1, 1)
 * // Returns: '/assets/cards/backgrounds/backgrounds_p1_c01_background.png'
 */
export function getBackgroundCardImagePath(page: number, cardNumber: number): string {
  const paddedCard = cardNumber.toString().padStart(2, '0');
  return `/assets/cards/backgrounds/backgrounds_p${page}_c${paddedCard}_background.png`;
}

/**
 * Get card image path for penalty cards
 *
 * @param page - Page number (1-based)
 * @param cardNumber - Card number (1-based)
 * @returns Absolute path to penalty card image
 *
 * @example
 * getPenaltyCardImagePath(1, 1)
 * // Returns: '/assets/cards/penalties/penalties_p1_c01_penalty.png'
 */
export function getPenaltyCardImagePath(page: number, cardNumber: number): string {
  const paddedCard = cardNumber.toString().padStart(2, '0');
  return `/assets/cards/penalties/penalties_p${page}_c${paddedCard}_penalty.png`;
}

/**
 * Validate card image path format
 *
 * @param path - Card image path to validate
 * @param entityType - Expected entity type
 * @returns True if path format is valid
 *
 * @example
 * validateCardImagePath('/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png', 'suspect')
 * // Returns: true
 */
export function validateCardImagePath(path: string, entityType: CardEntityType): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Check base path
  const expectedPrefix = `/assets/cards/${entityType}/`;
  if (!path.startsWith(expectedPrefix)) {
    return false;
  }

  // Check file extension
  if (!path.endsWith('.png')) {
    return false;
  }

  // Entity-specific validation
  switch (entityType) {
    case 'suspect':
      // Format: {module}_suspect_p{page}_c{num}_{type}-card.png
      return /^\/assets\/cards\/suspect\/\d{2}_[\w_]+_suspect_p\d_c\d{2}_(human|patient|violent)-card\.png$/.test(path);

    case 'investigator':
      // Format: {module}_investigator_p{page}_c{num}_{type}.png
      return /^\/assets\/cards\/investigator\/\d{2}_[\w_]+_investigator_p\d_c\d{2}_(cover-sheet|primary-prompts|secondary-prompts)\.png$/.test(path);

    case 'background':
      // Format: backgrounds_p{page}_c{num}_background.png
      return /^\/assets\/cards\/backgrounds\/backgrounds_p\d+_c\d{2}_background\.png$/.test(path);

    case 'penalty':
      // Format: penalties_p{page}_c{num}_penalty.png
      return /^\/assets\/cards\/penalties\/penalties_p\d+_c\d{2}_penalty\.png$/.test(path);

    default:
      return false;
  }
}

/**
 * Extract metadata from card image path
 *
 * @param path - Card image path
 * @returns Metadata object or null if path is invalid
 *
 * @example
 * extractCardImageMetadata('/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png')
 * // Returns: { entityType: 'suspect', module: '01_small_talk', page: 1, cardNumber: 1, contentType: 'human-card' }
 */
export function extractCardImageMetadata(path: string): {
  entityType: CardEntityType;
  module?: string;
  page: number;
  cardNumber: number;
  contentType: ContentType;
} | null {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Suspect card pattern
  const suspectMatch = path.match(
    /^\/assets\/cards\/suspect\/(\d{2}_[\w_]+)_suspect_p(\d)_c(\d{2})_(human|patient|violent)-card\.png$/
  );
  if (suspectMatch) {
    return {
      entityType: 'suspect',
      module: suspectMatch[1],
      page: parseInt(suspectMatch[2], 10),
      cardNumber: parseInt(suspectMatch[3], 10),
      contentType: `${suspectMatch[4]}-card` as SuspectContentType,
    };
  }

  // Investigator card pattern
  const investigatorMatch = path.match(
    /^\/assets\/cards\/investigator\/(\d{2}_[\w_]+)_investigator_p(\d)_c(\d{2})_(cover-sheet|primary-prompts|secondary-prompts)\.png$/
  );
  if (investigatorMatch) {
    return {
      entityType: 'investigator',
      module: investigatorMatch[1],
      page: parseInt(investigatorMatch[2], 10),
      cardNumber: parseInt(investigatorMatch[3], 10),
      contentType: investigatorMatch[4] as InvestigatorContentType,
    };
  }

  // Background card pattern
  const backgroundMatch = path.match(/^\/assets\/cards\/backgrounds\/backgrounds_p(\d+)_c(\d{2})_background\.png$/);
  if (backgroundMatch) {
    return {
      entityType: 'background',
      page: parseInt(backgroundMatch[1], 10),
      cardNumber: parseInt(backgroundMatch[2], 10),
      contentType: 'background',
    };
  }

  // Penalty card pattern
  const penaltyMatch = path.match(/^\/assets\/cards\/penalties\/penalties_p(\d+)_c(\d{2})_penalty\.png$/);
  if (penaltyMatch) {
    return {
      entityType: 'penalty',
      page: parseInt(penaltyMatch[1], 10),
      cardNumber: parseInt(penaltyMatch[2], 10),
      contentType: 'penalty',
    };
  }

  return null;
}

/**
 * Get module identifier from packet ID
 *
 * @param packetId - Packet ID (e.g., 'small-talk')
 * @returns Module identifier (e.g., '01_small_talk') or null if not found
 *
 * @example
 * getModuleFromPacketId('small-talk')
 * // Returns: '01_small_talk'
 */
export function getModuleFromPacketId(packetId: string): string | null {
  return REVERSE_MODULE_MAPPING[packetId] || null;
}

/**
 * Get packet ID from module identifier
 *
 * @param module - Module identifier (e.g., '01_small_talk')
 * @returns Packet ID (e.g., 'small-talk') or null if not found
 *
 * @example
 * getPacketIdFromModule('01_small_talk')
 * // Returns: 'small-talk'
 */
export function getPacketIdFromModule(module: string): string | null {
  return MODULE_MAPPING[module] || null;
}

/**
 * Check if card image file exists (requires file system access)
 * This is a contract definition - implementation depends on runtime environment
 *
 * @param path - Card image path (relative to public/)
 * @returns Promise resolving to true if file exists
 *
 * Implementation notes:
 * - In Node.js: Use fs.access() or fs.stat()
 * - In browser: Use fetch() with HEAD request
 * - In tests: Mock with test fixtures
 */
export async function cardImageExists(path: string): Promise<boolean> {
  // Implementation provided at runtime
  // This is a contract definition
  throw new Error('cardImageExists() must be implemented');
}

/**
 * Batch validate multiple card image paths
 *
 * @param paths - Array of card image paths
 * @param entityType - Expected entity type for all paths
 * @returns Array of validation results (true/false for each path)
 *
 * @example
 * validateCardImagePaths([
 *   '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png',
 *   '/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png',
 * ], 'suspect')
 * // Returns: [true, true]
 */
export function validateCardImagePaths(paths: string[], entityType: CardEntityType): boolean[] {
  return paths.map(path => validateCardImagePath(path, entityType));
}

/**
 * Get all suspect card image paths for a module
 *
 * @param module - Module identifier (e.g., '01_small_talk')
 * @returns Object with arrays of paths for each role type
 *
 * @example
 * getAllSuspectCardPaths('01_small_talk')
 * // Returns: {
 * //   human: ['/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png', ...],
 * //   patient: ['/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png', ...],
 * //   violent: ['/assets/cards/suspect/01_small_talk_suspect_p3_c01_violent-card.png', ...]
 * // }
 */
export function getAllSuspectCardPaths(module: string): {
  human: string[];
  patient: string[];
  violent: string[];
} {
  // Typically 3 cards per page (11 modules × 3 cards = 33 per role type)
  const cardsPerPage = 3;

  return {
    human: Array.from({ length: cardsPerPage }, (_, i) =>
      getSuspectCardImagePath(module, 1, i + 1, 'human-card')
    ),
    patient: Array.from({ length: cardsPerPage }, (_, i) =>
      getSuspectCardImagePath(module, 2, i + 1, 'patient-card')
    ),
    violent: Array.from({ length: cardsPerPage }, (_, i) =>
      getSuspectCardImagePath(module, 3, i + 1, 'violent-card')
    ),
  };
}

/**
 * Get all investigator card image paths for a module
 *
 * @param module - Module identifier (e.g., '01_small_talk')
 * @returns Object with paths for cover sheet, primary prompts, and secondary prompts
 *
 * @example
 * getAllInvestigatorCardPaths('01_small_talk')
 * // Returns: {
 * //   coverSheet: '/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png',
 * //   primary: ['/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png', ...],
 * //   secondary: ['/assets/cards/investigator/01_small_talk_investigator_p3_c01_secondary-prompts.png', ...]
 * // }
 */
export function getAllInvestigatorCardPaths(module: string): {
  coverSheet: string;
  primary: string[];
  secondary: string[];
} {
  // Typically 3 cards per page for questions
  const cardsPerPage = 3;

  return {
    coverSheet: getInvestigatorCardImagePath(module, 1, 1, 'cover-sheet'),
    primary: Array.from({ length: cardsPerPage }, (_, i) =>
      getInvestigatorCardImagePath(module, 2, i + 1, 'primary-prompts')
    ),
    secondary: Array.from({ length: cardsPerPage }, (_, i) =>
      getInvestigatorCardImagePath(module, 3, i + 1, 'secondary-prompts')
    ),
  };
}
