/**
 * FormTextArea Component
 * Renders a multi-line textarea for investigator notes
 */

import type { FC } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormTextArea.module.css';

export interface FormTextAreaProps {
  position: FormWidgetPosition;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  ariaLabel?: string;
}

export const FormTextArea: FC<FormTextAreaProps> = ({
  position,
  value,
  onChange,
  placeholder = 'Investigator notes...',
  readOnly = false,
  ariaLabel,
}) => {
  return (
    <div
      className={styles.textAreaContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-label={ariaLabel}
        className={styles.textArea}
      />
    </div>
  );
};
