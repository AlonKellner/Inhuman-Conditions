/**
 * FormIconSelector Component
 * Renders clickable COG and BRAIN icons with circle overlay for selection
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
      {/* COG Icon (Robot) */}
      <button
        type="button"
        className={`${styles.iconButton} ${isRobotSelected ? styles.selected : ''}`}
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
      >
        {isRobotSelected && <div className={styles.circleOverlay} />}
      </button>

      {/* BRAIN Icon (Human) */}
      <button
        type="button"
        className={`${styles.iconButton} ${isHumanSelected ? styles.selected : ''}`}
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
      >
        {isHumanSelected && <div className={styles.circleOverlay} />}
      </button>
    </>
  );
};
