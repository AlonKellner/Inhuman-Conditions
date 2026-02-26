import { useState } from 'react';
import styles from './ReadyToStart.module.css';

export interface ReadyToStartProps {
  role: 'investigator' | 'suspect' | 'spectator';
  onStartInterview: () => void;
  isMultiDevice?: boolean;
}

/**
 * ReadyToStart Component
 *
 * Implements the final confirmation stage before the interview begins:
 * - Both players review their roles and preparation
 * - Investigator manually clicks "Start Interview" button
 * - Timer starts ONLY after button click (not on mount, not auto-advance)
 * - This prevents the critical bug where timer starts too early
 *
 * CRITICAL: This component must NOT start the timer automatically.
 * Timer starts only when onStartInterview is called after button click.
 */
export function ReadyToStart({
  role,
  onStartInterview,
  isMultiDevice = false
}: ReadyToStartProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartClick = () => {
    if (!onStartInterview || isStarting) return;

    // Disable button to prevent double-clicks
    setIsStarting(true);

    // Call parent to start timer and advance to interview
    onStartInterview();
  };

  // Spectator view - waiting
  if (role === 'spectator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Ready to Begin</h2>
          <p className={styles.waitingMessage} aria-live="polite">
            Waiting for Investigator to start the interview...
          </p>
        </div>
      </div>
    );
  }

  // Suspect view - waiting
  if (role === 'suspect') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Ready to Begin</h2>

          <div className={styles.checklist}>
            <h3 className={styles.checklistHeading}>Pre-Interview Checklist:</h3>
            <ul className={styles.checklistItems}>
              <li className={styles.checklistItem}>✓ You know your role (Human or Robot)</li>
              <li className={styles.checklistItem}>✓ You understand your penalty</li>
              <li className={styles.checklistItem}>✓ You have reviewed your background</li>
              <li className={styles.checklistItem}>✓ You are ready for the 5-minute interview</li>
            </ul>
          </div>

          <p className={styles.waitingMessage} aria-live="polite">
            Waiting for Investigator to start the interview...
          </p>
        </div>
      </div>
    );
  }

  // Invalid role - show nothing
  if (role !== 'investigator' && role !== 'suspect' && role !== 'spectator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Ready to Begin</h2>
          <p className={styles.waitingMessage}>Waiting for role assignment...</p>
        </div>
      </div>
    );
  }

  // Investigator view - interactive
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Ready to Begin</h2>

        <div className={styles.instructions}>
          <p className={styles.instructionText} aria-live="polite">
            Ready to begin the interview?
          </p>

          {isMultiDevice ? (
            <>
              <p className={styles.instructionText}>
                Both players should be ready and viewing their respective screens.
              </p>
              <p className={styles.instructionText}>
                Click "Start Interview" when both players confirm readiness.
              </p>
            </>
          ) : (
            <p className={styles.instructionText}>
              Position the device where both players can see the screen during the interview.
            </p>
          )}
        </div>

        <div className={styles.checklist}>
          <h3 className={styles.checklistHeading}>Pre-Interview Checklist:</h3>
          <ul className={styles.checklistItems}>
            <li className={styles.checklistItem}>✓ Penalty has been calibrated (3 practice attempts)</li>
            <li className={styles.checklistItem}>✓ You have reviewed your questions</li>
            <li className={styles.checklistItem}>✓ Suspect has reviewed their role and background</li>
            <li className={styles.checklistItem}>✓ Both players are ready to start the 5-minute timer</li>
          </ul>
        </div>

        <div className={styles.buttonContainer}>
          <button
            className={styles.startButton}
            onClick={handleStartClick}
            disabled={isStarting}
            aria-label="Start Interview"
          >
            {isStarting ? 'Starting...' : 'Start Interview'}
          </button>
        </div>

        <p className={styles.timerNote}>
          <strong>Note:</strong> The 5-minute countdown timer will start immediately when you click the button.
        </p>
      </div>
    </div>
  );
}
