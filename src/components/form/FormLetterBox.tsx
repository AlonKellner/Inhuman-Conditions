/**
 * FormLetterBox Component
 * Renders a single letter box for suspect name display
 * Shows one character at a time in a fixed-width box
 */

import type { FC } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormLetterBox.module.css';

export interface FormLetterBoxProps {
  position: FormWidgetPosition;
  letter: string; // Single character or empty string
  index: number; // Position in name (0-14 for first/last, 0 for middle)
  readOnly?: boolean;
}

export const FormLetterBox: FC<FormLetterBoxProps> = ({
  position,
  letter,
  index: _index, // Prefix with _ to mark as intentionally unused
  readOnly: _readOnly = true, // Default to read-only (name is typed elsewhere, displayed here)
}) => {
  // Ensure only single character
  const displayLetter = letter.charAt(0).toUpperCase();

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
};
