/**
 * FormTextField Component
 * Renders a text input field overlaid at exact position
 */

import type { FC } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormTextField.module.css';

export interface FormTextFieldProps {
  position: FormWidgetPosition;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  maxLength?: number;
  ariaLabel?: string;
}

export const FormTextField: FC<FormTextFieldProps> = ({
  position,
  value,
  onChange,
  placeholder = '',
  readOnly = false,
  maxLength,
  ariaLabel,
}) => {
  return (
    <div
      className={styles.textFieldContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={maxLength}
        aria-label={ariaLabel}
        className={styles.textField}
      />
    </div>
  );
};
