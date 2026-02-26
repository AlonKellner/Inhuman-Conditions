/**
 * FormLetterBox Component
 * Renders a single letter box for suspect name input
 * Shows one character at a time in a fixed-width box with auto-advance
 */

import { type FC, type KeyboardEvent, useRef, useEffect } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormLetterBox.module.css';

export interface FormLetterBoxProps {
  position: FormWidgetPosition;
  letter: string; // Single character or empty string
  index: number; // Position in name (0-14 for first/last, 0 for middle)
  nameField: 'first' | 'middle' | 'last';
  readOnly?: boolean;
  onChange?: (nameField: 'first' | 'middle' | 'last', index: number, value: string) => void;
  onAdvance?: (targetField: 'first' | 'middle' | 'last' | 'notes') => void; // Called when should move to next field
  autoFocus?: boolean;
}

export const FormLetterBox: FC<FormLetterBoxProps> = ({
  position,
  letter,
  index,
  nameField,
  readOnly = false,
  onChange,
  onAdvance,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Ensure only single character
  const displayLetter = letter.charAt(0).toUpperCase();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;

    // Handle spacebar, enter, and tab - skip to next name section or notes
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (onAdvance) {
        // Determine the next field
        const nextField = nameField === 'first' ? 'middle' : nameField === 'middle' ? 'last' : 'notes';
        onAdvance(nextField);
      }
      return;
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!letter) {
        // Current box is empty - move to previous box and delete its letter
        e.preventDefault();
        const prevBox = getPreviousBox();
        if (prevBox) {
          const prevIndex = parseInt(prevBox.dataset.index || '0');
          // Clear the previous box's letter
          if (onChange) {
            onChange(nameField, prevIndex, '');
          }
          // Focus the previous box
          prevBox.focus();
        } else if (nameField !== 'first' && onAdvance) {
          // Move to previous name section
          const prevField = nameField === 'last' ? 'middle' : 'first';
          onAdvance(prevField);
        }
      }
      // If current box has a letter, let default behavior delete it
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !onChange) return;

    const value = e.target.value.toUpperCase();
    const newLetter = value.charAt(value.length - 1); // Get last character typed

    // Only allow letters
    if (newLetter && !/^[A-Z]$/i.test(newLetter)) {
      e.target.value = letter; // Reset to previous value
      return;
    }

    // Update the letter
    onChange(nameField, index, newLetter);

    // Auto-advance to next box
    if (newLetter) {
      const nextBox = getNextBox();
      if (nextBox) {
        nextBox.focus();
      } else if (onAdvance) {
        // Move to next name section or notes
        const nextField = nameField === 'first' ? 'middle' : nameField === 'middle' ? 'last' : 'notes';
        onAdvance(nextField);
      }
    }
  };

  const getNextBox = (): HTMLInputElement | null => {
    const allBoxes = document.querySelectorAll<HTMLInputElement>(
      `input[data-name-field="${nameField}"]`
    );
    const currentIndex = Array.from(allBoxes).indexOf(inputRef.current!);
    return allBoxes[currentIndex + 1] || null;
  };

  const getPreviousBox = (): HTMLInputElement | null => {
    const allBoxes = document.querySelectorAll<HTMLInputElement>(
      `input[data-name-field="${nameField}"]`
    );
    const currentIndex = Array.from(allBoxes).indexOf(inputRef.current!);
    return allBoxes[currentIndex - 1] || null;
  };

  if (readOnly) {
    return (
      <div
        className={styles.letterBoxContainer}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.width}px`,
          height: `${position.height}px`,
        }}
      >
        <span className={styles.letter}>
          {displayLetter || '\u00A0'} {/* Non-breaking space if empty */}
        </span>
      </div>
    );
  }

  return (
    <div
      className={styles.letterBoxContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={displayLetter}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        className={styles.letterInput}
        maxLength={1}
        data-name-field={nameField}
        data-index={index}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
};
