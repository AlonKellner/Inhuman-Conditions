/**
 * Card Image Path Utilities
 *
 * Feature: 003-pdf-asset-extraction
 * Phase: Integration (US5)
 * Purpose: Utility functions for generating and validating card image paths
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
