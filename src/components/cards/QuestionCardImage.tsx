/**
 * QuestionCardImage Component
 * Feature: 003-pdf-asset-extraction (US5)
 * Displays official PDF card images for investigator questions with fallback text
 */

import type { Question } from '../../types/packet';

interface QuestionCardImageProps {
  question: Question;
  className?: string;
}

export default function QuestionCardImage({ question, className = '' }: QuestionCardImageProps) {
  // If cardImage is present, render the official PDF card image
  if (question.cardImage) {
    const altText = `${question.type} prompt: ${question.text}`;

    return (
      <img
        src={question.cardImage}
        alt={altText}
        loading="lazy"
        className={`question-card-image ${className}`}
      />
    );
  }

  // Fallback: render text display when cardImage is not available
  return (
    <div className={`question-card-fallback ${className}`}>
      <div className="question-header">
        <span className="question-type">{question.type}</span>
      </div>
      <div className="question-body">
        <p className="question-text">{question.text}</p>

        {question.examples && question.examples.length > 0 && (
          <div className="examples">
            <strong>Examples:</strong>
            <ul>
              {question.examples.map((example, idx) => (
                <li key={idx}>{example}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
