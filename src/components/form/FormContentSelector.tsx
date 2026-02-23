/**
 * FormContentSelector Component
 * Combines cycling buttons (< >) with a dropdown for selecting content
 * Used for Module and Background selection in VK-82(e) form
 */

import type { FC } from 'react';
import type { FormWidgetPosition } from '../../types/investigator-form';
import styles from './FormContentSelector.module.css';

export interface FormContentSelectorProps {
  position: FormWidgetPosition;
  label: string;
  options: Array<{ id: string; name: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const FormContentSelector: FC<FormContentSelectorProps> = ({
  position,
  label,
  options,
  selectedId,
  onSelect,
  onPrevious,
  onNext,
  disabled = false,
}) => {
  const selectedIndex = options.findIndex((opt) => opt.id === selectedId);
  const displayIndex = selectedIndex >= 0 ? selectedIndex + 1 : 0;
  const selectedName = options.find((opt) => opt.id === selectedId)?.name || '';

  return (
    <div
      className={styles.selectorContainer}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <div className={styles.controls}>
        {/* Previous button */}
        <button
          type="button"
          className={styles.cycleButton}
          onClick={onPrevious}
          disabled={disabled}
          aria-label={`Previous ${label.toLowerCase()}`}
        >
          &lt;
        </button>

        {/* Dropdown for direct selection */}
        <select
          value={selectedId || ''}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className={styles.dropdown}
          aria-label={`Select ${label.toLowerCase()}`}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        {/* Next button */}
        <button
          type="button"
          className={styles.cycleButton}
          onClick={onNext}
          disabled={disabled}
          aria-label={`Next ${label.toLowerCase()}`}
        >
          &gt;
        </button>
      </div>

      {/* Display selected name and position */}
      <div className={styles.info}>
        <span className={styles.selectedName}>{selectedName}</span>
        <span className={styles.counter}>
          {displayIndex > 0 ? `${displayIndex} / ${options.length}` : '—'}
        </span>
      </div>
    </div>
  );
};
