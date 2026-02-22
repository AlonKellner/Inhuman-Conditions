import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CyclingButtons } from './CyclingButtons';
import styles from './PenaltyCalibration.module.css';

export interface PenaltyCalibrationProps {
  penalty: string;
  role: 'investigator' | 'suspect' | 'spectator';
  onComplete: () => void;
  currentAttempt?: number;
}

/**
 * PenaltyCalibration Component
 *
 * Implements the penalty calibration stage where:
 * - Investigator reads penalty aloud to Suspect
 * - Suspect practices performing the penalty 3 times
 * - Both players agree on what counts as performing the penalty
 * - NO TIMER is active during this stage
 *
 * This stage MUST complete before the interview timer starts.
 */
export function PenaltyCalibration({
  penalty,
  role,
  onComplete,
  currentAttempt: _currentAttempt = 0 // Deprecated: now using store's penaltyCalibration.practiceAttempts
}: PenaltyCalibrationProps) {
  // Get cycling state and methods from store
  const {
    contentIndices,
    permutationSizes,
    penaltyCalibration,
    cycleContent,
    incrementCalibration,
  } = useGameStore();

  // Use store's practice attempts (synced with engine)
  const attempts = penaltyCalibration.practiceAttempts;
  const maxAttempts = penaltyCalibration.maxAttempts;
  const isComplete = penaltyCalibration.isComplete;

  // Track previous penalty to detect changes
  const prevPenaltyRef = useRef(penalty);

  // Reset local UI state when penalty changes (engine already handles this)
  useEffect(() => {
    if (prevPenaltyRef.current !== penalty) {
      prevPenaltyRef.current = penalty;
      // Attempts reset is handled by engine when cycling penalties
    }
  }, [penalty]);

  const handlePractice = () => {
    incrementCalibration();
  };

  const handleContinue = () => {
    if (isComplete) {
      onComplete();
    }
  };

  const handleCyclePrevious = () => {
    cycleContent('penalty', 'previous');
  };

  const handleCycleNext = () => {
    cycleContent('penalty', 'next');
  };

  // Spectator view - read-only
  if (role === 'spectator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Penalty Calibration</h2>

          <CyclingButtons
            label="Penalty"
            currentIndex={contentIndices.penaltyIndex}
            totalItems={permutationSizes.penalties}
            onPrevious={handleCyclePrevious}
            onNext={handleCycleNext}
          />

          <div className={styles.penaltyBox}>
            <p className={styles.penaltyText}>{penalty}</p>
          </div>
          <p className={styles.waitingMessage}>
            Calibration in progress...
          </p>
        </div>
      </div>
    );
  }

  // Investigator view - waiting for Suspect to complete
  if (role === 'investigator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Penalty Calibration</h2>

          <div className={styles.instructions}>
            <p className={styles.instructionText}>
              <strong>Read this aloud to the Suspect:</strong>
            </p>
          </div>

          <CyclingButtons
            label="Penalty"
            currentIndex={contentIndices.penaltyIndex}
            totalItems={permutationSizes.penalties}
            onPrevious={handleCyclePrevious}
            onNext={handleCycleNext}
          />

          <div className={styles.penaltyBox}>
            <p className={styles.penaltyText}>{penalty}</p>
          </div>

          <p className={styles.waitingMessage}>
            Waiting for Suspect to complete 3 practice attempts...
          </p>
        </div>
      </div>
    );
  }

  // Suspect view - interactive practice
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Penalty Calibration</h2>

        <div className={styles.instructions}>
          <p className={styles.instructionText}>
            The Investigator will read your penalty aloud.
            Practice performing it <strong>3 times</strong> to calibrate.
          </p>
        </div>

        <CyclingButtons
          label="Penalty"
          currentIndex={contentIndices.penaltyIndex}
          totalItems={permutationSizes.penalties}
          onPrevious={handleCyclePrevious}
          onNext={handleCycleNext}
        />

        <div className={styles.penaltyBox}>
          <p className={styles.penaltyText}>{penalty}</p>
        </div>

        <div className={styles.attemptCounter}>
          <p className={styles.counterText} aria-live="polite" aria-atomic="true">
            Practice Attempt {attempts} of {maxAttempts}
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.practiceButton}
            onClick={handlePractice}
            disabled={isComplete}
            aria-label="I Practiced"
          >
            I Practiced
          </button>

          <button
            className={styles.continueButton}
            onClick={handleContinue}
            disabled={!isComplete}
            aria-label="Continue"
          >
            Continue
          </button>
        </div>

        {isComplete && (
          <p className={styles.completeMessage}>
            ✓ Practice complete. Click "Continue" when ready.
          </p>
        )}
      </div>
    </div>
  );
}
