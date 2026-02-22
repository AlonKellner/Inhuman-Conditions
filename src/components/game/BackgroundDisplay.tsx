/**
 * BackgroundDisplay Component
 * Displays Suspect background (character identity) with cycling controls
 * Allows players to cycle through all 30 available backgrounds
 */

import { useGameStore } from '../../store/gameStore';
import { CyclingButtons } from './CyclingButtons';
import styles from './BackgroundDisplay.module.css';

export interface BackgroundDisplayProps {
  /** Player role determines view permissions */
  role: 'investigator' | 'suspect' | 'spectator';
  /** Callback when player confirms background selection */
  onContinue: () => void;
}

/**
 * BackgroundDisplay Component
 *
 * Displays the Suspect's character background and allows cycling through alternatives.
 * - Investigator: Waits for Suspect to review background
 * - Suspect: Sees background and confirms when ready
 * - Spectator: Sees read-only background information
 *
 * The background defines who the Suspect is pretending to be during the interview.
 */
export function BackgroundDisplay({ role, onContinue }: BackgroundDisplayProps) {
  const {
    selectedBackground,
    contentIndices,
    permutationSizes,
    cycleContent,
  } = useGameStore();

  const handleCyclePrevious = () => {
    cycleContent('background', 'previous');
  };

  const handleCycleNext = () => {
    cycleContent('background', 'next');
  };

  if (!selectedBackground) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.errorMessage}>No background selected</p>
        </div>
      </div>
    );
  }

  // Spectator view - read-only
  if (role === 'spectator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Suspect Background</h2>

          <CyclingButtons
            label="Background"
            currentIndex={contentIndices.backgroundIndex}
            totalItems={permutationSizes.backgrounds}
            onPrevious={handleCyclePrevious}
            onNext={handleCycleNext}
          />

          <div className={styles.backgroundBox}>
            <p className={styles.backgroundName}>{selectedBackground.name}</p>
            {selectedBackground.description && (
              <p className={styles.backgroundDescription}>
                {selectedBackground.description}
              </p>
            )}
          </div>

          <p className={styles.waitingMessage}>
            Waiting for Suspect to review background...
          </p>
        </div>
      </div>
    );
  }

  // Investigator view - waiting for Suspect
  if (role === 'investigator') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Suspect Background</h2>

          <CyclingButtons
            label="Background"
            currentIndex={contentIndices.backgroundIndex}
            totalItems={permutationSizes.backgrounds}
            onPrevious={handleCyclePrevious}
            onNext={handleCycleNext}
          />

          <div className={styles.instructions}>
            <p className={styles.instructionText}>
              The Suspect is reviewing their character background.
            </p>
          </div>

          <div className={styles.backgroundBox}>
            <p className={styles.backgroundName}>{selectedBackground.name}</p>
            {selectedBackground.description && (
              <p className={styles.backgroundDescription}>
                {selectedBackground.description}
              </p>
            )}
          </div>

          <p className={styles.waitingMessage}>
            Waiting for Suspect to continue...
          </p>
        </div>
      </div>
    );
  }

  // Suspect view - main interactive view
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Your Background</h2>

        <div className={styles.instructions}>
          <p className={styles.instructionText}>
            <strong>You are playing the role of:</strong>
          </p>
        </div>

        <CyclingButtons
          label="Background"
          currentIndex={contentIndices.backgroundIndex}
          totalItems={permutationSizes.backgrounds}
          onPrevious={handleCyclePrevious}
          onNext={handleCycleNext}
        />

        <div className={styles.backgroundBox}>
          <p className={styles.backgroundName}>{selectedBackground.name}</p>
          {selectedBackground.description && (
            <p className={styles.backgroundDescription}>
              {selectedBackground.description}
            </p>
          )}
        </div>

        <div className={styles.hint}>
          <p className={styles.hintText}>
            During the interview, answer questions as if you are this person.
            Remember your role, penalty, and restrictions.
          </p>
        </div>

        <button
          className={styles.continueButton}
          onClick={onContinue}
          aria-label="Continue to next stage"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
