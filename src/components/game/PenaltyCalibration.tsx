import { useGameStore } from '../../store/GameStoreContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Penalty } from '../../types/penalty';
import PenaltyCardImage from '../cards/PenaltyCardImage';
import styles from './PenaltySelection.module.css';

export interface PenaltyCalibrationProps {
  penalty: Penalty;
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
  // Get calibration state from store
  const {
    penaltyCalibration,
    incrementCalibration,
  } = useGameStore();

  // Use store's practice attempts (synced with engine)
  const attempts = penaltyCalibration.practiceAttempts;
  const isComplete = penaltyCalibration.isComplete;

  const handleButtonClick = () => {
    if (isComplete) {
      onComplete();
    } else {
      incrementCalibration();
    }
  };

  // Get button text based on current attempts
  const getButtonText = () => {
    switch (attempts) {
      case 0:
        return 'First Practice Done';
      case 1:
        return 'Second Practice Done';
      case 2:
        return 'Third Practice Done';
      default:
        return 'Continue';
    }
  };

  // Spectator view - read-only
  if (role === 'spectator') {
    return (
      <Card title="Penalty Calibration">
        <div className={styles.finalPenalty}>
          <PenaltyCardImage penalty={penalty} />
        </div>
        <p className={styles.instructions}>
          Calibration in progress...
        </p>
      </Card>
    );
  }

  // Investigator view - confirmation prompt
  if (role === 'investigator') {
    return (
      <Card title="Penalty Calibration">
        <p className={styles.instructions}>
          Has the Suspect finished practicing the penalty 3 times?
        </p>

        <div className={styles.finalPenalty}>
          <PenaltyCardImage penalty={penalty} />
        </div>

        <Button onClick={() => onComplete()} className={styles.continueButton}>
          Continue
        </Button>
      </Card>
    );
  }

  // Suspect view - interactive practice
  return (
    <Card title="Penalty Calibration">
      <p className={styles.instructions}>
        Practice performing this penalty 3 times.
      </p>

      <div className={styles.finalPenalty}>
        <PenaltyCardImage penalty={penalty} />
      </div>

      <Button onClick={handleButtonClick} className={styles.continueButton}>
        {getButtonText()}
      </Button>
    </Card>
  );
}
