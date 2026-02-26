import type { CatalyzerCard } from '../data/catalyzerCards';

/**
 * Maps a catalyzer card to its corresponding suspect card image path
 * Pattern: {moduleNum}_{moduleName}_suspect_p{page}_c{cardnum}_{type}-card.png
 *
 * Page numbers:
 * - Page 1: human cards (c01, c02, c03)
 * - Page 2: patient cards (c01, c02, c03)
 * - Page 3: violent cards (c01, c02, c03)
 */
export function getSuspectCardImagePath(card: CatalyzerCard): string | null {
  // If card already has a suspect card image path, use it
  if (card.cardImage && card.cardImage.includes('/suspect/')) {
    return card.cardImage;
  }

  // For cards without cardImage populated, derive the path from metadata
  // Extract card number from card.id (e.g., "smalltalk-ltm-01" → 1)
  const cardNumberMatch = card.id.match(/-(\d+)$/);
  const cardNumber = cardNumberMatch ? parseInt(cardNumberMatch[1], 10) : 1;

  // Use the deriveSuspectCardPath utility to generate the path
  return deriveSuspectCardPath(card.packetId, card.roleType, cardNumber);
}

/**
 * Alternative utility to derive suspect card path from card metadata
 * (Currently not used - requires additional metadata in card definitions)
 */
export function deriveSuspectCardPath(
  packetId: string,
  roleType: string,
  cardNumber: number // 1, 2, or 3
): string | null {
  // Extract module number from packetId
  const moduleMap: Record<string, string> = {
    'small-talk': '01',
    'problem-solving': '02',
    'imagination': '03',
    'cooperation': '04',
    'hopes': '05',
    'body': '06',
    'grief': '07',
    'threat': '08',
    'moral-failings': '09',
    'self-image': '10',
    'intentions': '11',
  };

  const moduleNum = moduleMap[packetId];
  if (!moduleNum) return null;

  // Map roleType to card type and page number
  const typeConfig: Record<string, { type: string; page: number }> = {
    'human': { type: 'human-card', page: 1 },
    'patient-robot': { type: 'patient-card', page: 2 },
    'violent-robot': { type: 'violent-card', page: 3 },
  };

  const config = typeConfig[roleType];
  if (!config) return null;

  // Format card number (1 → "01", 2 → "02", 3 → "03")
  const cardNum = cardNumber.toString().padStart(2, '0');

  // Convert packetId to module name (small-talk → small_talk)
  const moduleName = packetId.replace(/-/g, '_');

  return `/assets/cards/suspect/${moduleNum}_${moduleName}_suspect_p${config.page}_c${cardNum}_${config.type}.png`;
}
