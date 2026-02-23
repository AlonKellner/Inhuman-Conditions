/**
 * FormCheckbox Component
 * Renders a checkbox overlaid at exact position from labeled bounding box
 */

import type { FC } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormCheckbox.module.css';

export interface FormCheckboxProps {
  position: FormWidgetPosition;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const FormCheckbox: FC<FormCheckboxProps> = ({
  position,
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}) => {
  return (
    <div
      className={styles.checkboxContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={styles.checkbox}
      />
    </div>
  );
};
