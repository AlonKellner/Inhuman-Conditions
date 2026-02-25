/**
 * FormIconSelector Component
 * Renders clickable COG and BRAIN icons with dotted circle overlay for selection
 * Built using TDD methodology - see FormIconSelector.test.tsx
 */

import type { FC } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormIconSelector.module.css';

export interface FormIconSelectorProps {
  cogPosition: FormWidgetPosition;
  brainPosition: FormWidgetPosition;
  value: 'human' | 'robot' | null;
  onChange: (value: 'human' | 'robot') => void;
  disabled?: boolean;
}

// Dotted circle overlay
const HandDrawnCircle: FC = () => (
  <svg
    className={styles.circleOverlay}
    viewBox="-5 -5 110 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Simple dotted circle outline */}
    <circle
      cx="50"
      cy="50"
      r="50"
      stroke="#000"
      strokeWidth="5"
      strokeDasharray="4 4"
      fill="none"
    />
  </svg>
);

export const FormIconSelector: FC<FormIconSelectorProps> = ({
  cogPosition,
  brainPosition,
  value,
  onChange,
  disabled = false,
}) => {
  const isRobotSelected = value === 'robot';
  const isHumanSelected = value === 'human';

  return (
    <>
      {/* COG Icon (Robot) - Invisible button, dotted circle on selection */}
      <button
        type="button"
        className={styles.iconButton}
        style={{
          position: 'absolute',
          left: `${cogPosition.x}px`,
          top: `${cogPosition.y}px`,
          width: `${cogPosition.width}px`,
          height: `${cogPosition.height}px`,
        }}
        onClick={() => onChange('robot')}
        disabled={disabled}
        aria-label="Select Robot (COG)"
        title="Robot (COG)"
      >
        {isRobotSelected && <HandDrawnCircle />}
      </button>

      {/* BRAIN Icon (Human) - Invisible button, dotted circle on selection */}
      <button
        type="button"
        className={styles.iconButton}
        style={{
          position: 'absolute',
          left: `${brainPosition.x}px`,
          top: `${brainPosition.y}px`,
          width: `${brainPosition.width}px`,
          height: `${brainPosition.height}px`,
        }}
        onClick={() => onChange('human')}
        disabled={disabled}
        aria-label="Select Human (BRAIN)"
        title="Human (BRAIN)"
      >
        {isHumanSelected && <HandDrawnCircle />}
      </button>
    </>
  );
};
