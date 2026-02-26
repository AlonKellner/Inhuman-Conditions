/**
 * BackgroundDisplay Component
 * Displays Suspect background (character identity) with cycling controls
 * Allows players to cycle through all 30 available backgrounds
 */

import { useGameStore } from '../../store/GameStoreContext';
import { CyclingButtons } from './CyclingButtons';
import { backgrounds } from '../../data/backgrounds';
import type { Background } from '../../types/background';
import styles from './BackgroundDisplay.module.css';

/**
 * Get the background card image path from a background object
 * Finds the original index in the backgrounds array (not the permuted index)
 * to ensure card images match background names after shuffling
 * Pattern: backgrounds_p{page}_c{cardnum}_background.png
 * 6 cards per page across 5 pages (30 total)
 */
function getBackgroundCardPath(background: Background): string {
  // Find the original index of this background in the backgrounds array
  const originalIndex = backgrounds.findIndex(bg => bg.id === background.id);

  if (originalIndex === -1) {
    console.error(`Background not found in backgrounds array: ${background.id}`);
    return '/assets/cards/backgrounds/backgrounds_p1_c01_background.png'; // Fallback
  }

  const page = Math.floor(originalIndex / 6) + 1;
  const cardNum = (originalIndex % 6) + 1;
  const paddedCardNum = cardNum.toString().padStart(2, '0');
  return `/assets/cards/backgrounds/backgrounds_p${page}_c${paddedCardNum}_background.png`;
}

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
  const backgroundCardPath = getBackgroundCardPath(selectedBackground);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Your Background</h2>

        <CyclingButtons
          label="Background"
          currentIndex={contentIndices.backgroundIndex}
          totalItems={permutationSizes.backgrounds}
          onPrevious={handleCyclePrevious}
          onNext={handleCycleNext}
        />

        <div className={styles.cardImageContainer}>
          <img
            src={backgroundCardPath}
            alt={`Background: ${selectedBackground.name}`}
            className={styles.backgroundCardImage}
          />
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
