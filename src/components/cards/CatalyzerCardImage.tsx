/**
 * CatalyzerCardImage Component
 * Feature: 003-pdf-asset-extraction (US5)
 * Displays official PDF card images for catalyzer cards with fallback widget
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

  // Fallback: render custom widget when cardImage is not available
  return (
    <div className={`catalyzer-card-fallback ${className}`} data-testid="catalyzer-card-fallback">
      <div className="card-header">
        <h3>{card.packetId}</h3>
        <span className="role-type">{card.roleType}</span>
      </div>
      <div className="card-body">
        <p className="fault">Fault: {card.fault}</p>
        <p className="description">{card.description}</p>

        {card.traits && card.traits.length > 0 && (
          <div className="traits">
            <strong>Traits:</strong>
            <ul>
              {card.traits.map((trait, idx) => (
                <li key={idx}>{trait}</li>
              ))}
            </ul>
          </div>
        )}

        {card.restrictions && card.restrictions.length > 0 && (
          <div className="restrictions">
            <strong>Restrictions:</strong>
            <ul>
              {card.restrictions.map((restriction, idx) => (
                <li key={idx}>{restriction}</li>
              ))}
            </ul>
          </div>
        )}

        {card.tasks && card.tasks.length > 0 && (
          <div className="tasks">
            <strong>Tasks:</strong>
            <ul>
              {card.tasks.map((task, idx) => (
                <li key={idx}>{task}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
