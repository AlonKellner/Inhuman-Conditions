/**
 * CyclingButtons Component
 * Reusable component for cycling through content alternatives
 * Used for penalties, packets, backgrounds, and roles
 */

import styles from './CyclingButtons.module.css';

export interface CyclingButtonsProps {
  /** Label describing what content is being cycled (e.g., "Penalty", "Packet") */
  label: string;
  /** Current index in the permutation (0-based) */
  currentIndex: number;
  /** Total number of items in the permutation */
  totalItems: number;
  /** Callback when previous button is clicked */
  onPrevious: () => void;
  /** Callback when next button is clicked */
  onNext: () => void;
  /** Optional: Disable cycling buttons */
  disabled?: boolean;
}

/**
 * CyclingButtons Component
 *
 * Displays < and > buttons for cycling through content alternatives.
 * Shows current position as "3 / 18" (1-based for user display).
 * Maintains 48x48px minimum touch target for accessibility.
 */
export function CyclingButtons({
  label,
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  disabled = false,
}: CyclingButtonsProps) {
  // Convert 0-based index to 1-based for display
  const displayIndex = currentIndex + 1;

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controls}>
        <button
          className={styles.cycleButton}
          onClick={onPrevious}
          disabled={disabled}
          aria-label={`Previous ${label.toLowerCase()}`}
          title={`Previous ${label.toLowerCase()}`}
        >
          &lt;
        </button>
        <span className={styles.counter} aria-live="polite" aria-atomic="true">
          {displayIndex} / {totalItems}
        </span>
        <button
          className={styles.cycleButton}
          onClick={onNext}
          disabled={disabled}
          aria-label={`Next ${label.toLowerCase()}`}
          title={`Next ${label.toLowerCase()}`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
