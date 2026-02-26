/**
 * FormCheckbox Component
 * Renders a transparent checkbox with handwritten checkmark when checked
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
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

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
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {checked && (
        <svg
          className={styles.checkmark}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Handwritten-style checkmark */}
          <path
            d="M4 12 L9 17 L20 6"
            stroke="#000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              strokeDasharray: '30',
              strokeDashoffset: checked ? '0' : '30',
              transition: 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>
      )}
    </div>
  );
};
