/**
 * CatalyzerCardImage Component
 * Feature: 003-pdf-asset-extraction (US5)
 * Displays official PDF card images for catalyzer cards
 * Shows minimal error if card image not available (following "assets as source of truth" principle)
 */

import type { CatalyzerCard } from '../../data/catalyzerCards';

interface CatalyzerCardImageProps {
  card: CatalyzerCard;
  className?: string;
}

export default function CatalyzerCardImage({ card, className = '' }: CatalyzerCardImageProps) {
  // If cardImage is present, render the official PDF card image
  if (card.cardImage) {
    const altText = `${card.packetId} catalyzer card - ${card.roleType} robot (${card.fault} fault)`;

    return (
      <img
        src={card.cardImage}
        alt={altText}
        loading="lazy"
        className={`catalyzer-card-image ${className}`}
      />
    );
  }

  // Error: card image not available
  return (
    <div className="catalyzer-card-error" data-testid="catalyzer-card-error">
      <p>Card image not available</p>
      <p className="card-id">Card: {card.id}</p>
    </div>
  );
}
