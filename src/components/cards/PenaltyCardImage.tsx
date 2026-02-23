/**
 * PenaltyCardImage Component
 * Feature: 003-pdf-asset-extraction (US5)
 * Displays official PDF card images for penalty cards with fallback text
 */

import type { Penalty } from '../../types/penalty';

interface PenaltyCardImageProps {
  penalty: Penalty;
  className?: string;
}

export default function PenaltyCardImage({ penalty, className = '' }: PenaltyCardImageProps) {
  // If cardImage is present, render the official PDF card image
  if (penalty.cardImage) {
    const altText = `Penalty card: ${penalty.text}`;

    return (
      <img
        src={penalty.cardImage}
        alt={altText}
        loading="lazy"
        className={`penalty-card-image ${className}`}
      />
    );
  }

  // Fallback: render text display when cardImage is not available
  return (
    <div className={`penalty-card-fallback ${className}`}>
      <div className="penalty-text">{penalty.text}</div>

      {penalty.examples && penalty.examples.length > 0 && (
        <div className="penalty-examples">
          <strong>Examples:</strong>
          <ul>
            {penalty.examples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
