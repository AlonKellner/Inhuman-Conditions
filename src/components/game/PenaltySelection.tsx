/**
 * PenaltySelection Component
 * Handles the interactive penalty selection phase:
 * - Investigator eliminates 1 of 3 penalties
 * - Suspect chooses 1 from the remaining 2
 */

import { type FC } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import PenaltyCardImage from '../cards/PenaltyCardImage';
import type { Penalty } from '../../types';
import styles from './PenaltySelection.module.css';

interface PenaltySelectionProps {
  role: 'investigator' | 'suspect';
}

export const PenaltySelection: FC<PenaltySelectionProps> = ({ role }) => {
  const { penaltySelection, eliminatePenalty, choosePenalty, advanceState } = useGameStore();

  if (!penaltySelection) {
    return (
      <Card title="Penalty Selection">
        <p className={styles.error}>Penalty selection not initialized</p>
      </Card>
    );
  }

  const {
    availablePenalties,
    investigatorEliminated,
    suspectChosen,
  } = penaltySelection;

  // Helper to get penalty from ID
  const getPenalty = (penaltyId: string): Penalty | undefined => {
    return availablePenalties.find((p) => p.id === penaltyId);
  };

  // === INVESTIGATOR VIEW ===
  if (role === 'investigator') {
    // Step 1: Eliminate one penalty by clicking card
    if (!investigatorEliminated) {
      return (
        <Card title="Penalty Selection">
          <p className={styles.instructions}>
            Click a penalty card to eliminate it:
          </p>

          <div className={styles.penaltyRow}>
            {availablePenalties.map((penalty) => (
              <div
                key={penalty.id}
                className={styles.clickableCard}
                onClick={() => eliminatePenalty(penalty.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    eliminatePenalty(penalty.id);
                  }
                }}
              >
                <PenaltyCardImage penalty={penalty} />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Step 2: Click which penalty suspect chose
    if (!suspectChosen) {
      const remaining = availablePenalties.filter(
        (p) => p.id !== investigatorEliminated
      );

      return (
        <Card title="Penalty Selection">
          <p className={styles.instructions}>
            Click the penalty the Suspect chose:
          </p>

          <div className={styles.penaltyRow}>
            {remaining.map((penalty) => (
              <div
                key={penalty.id}
                className={styles.clickableCard}
                onClick={() => choosePenalty(penalty.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    choosePenalty(penalty.id);
                  }
                }}
              >
                <PenaltyCardImage penalty={penalty} />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Step 3: Complete - show final selection
    const chosenPenalty = getPenalty(suspectChosen);

    return (
      <Card title="Penalty Selected">
        {chosenPenalty && (
          <div className={styles.finalPenalty}>
            <PenaltyCardImage penalty={chosenPenalty} />
          </div>
        )}

        <Button onClick={advanceState} className={styles.continueButton}>
          Continue to Calibration
        </Button>
      </Card>
    );
  }

  // === SUSPECT VIEW ===
  else {
    // Step 1: Click which penalty Investigator eliminated
    if (!investigatorEliminated) {
      return (
        <Card title="Penalty Selection">
          <p className={styles.instructions}>
            Click the penalty the Investigator eliminated:
          </p>

          <div className={styles.penaltyRow}>
            {availablePenalties.map((penalty) => (
              <div
                key={penalty.id}
                className={styles.clickableCard}
                onClick={() => eliminatePenalty(penalty.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    eliminatePenalty(penalty.id);
                  }
                }}
              >
                <PenaltyCardImage penalty={penalty} />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Step 2: Click to choose from remaining two
    if (!suspectChosen) {
      const remaining = availablePenalties.filter(
        (p) => p.id !== investigatorEliminated
      );

      return (
        <Card title="Penalty Selection">
          <p className={styles.instructions}>
            Click a penalty to choose it:
          </p>

          <div className={styles.penaltyRow}>
            {remaining.map((penalty) => (
              <div
                key={penalty.id}
                className={styles.clickableCard}
                onClick={() => choosePenalty(penalty.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    choosePenalty(penalty.id);
                  }
                }}
              >
                <PenaltyCardImage penalty={penalty} />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Step 3: Complete - can advance independently
    const chosenPenalty = getPenalty(suspectChosen);

    return (
      <Card title="Penalty Selected">
        {chosenPenalty && (
          <div className={styles.finalPenalty}>
            <PenaltyCardImage penalty={chosenPenalty} />
          </div>
        )}

        <Button onClick={advanceState} className={styles.continueButton}>
          Continue to Calibration
        </Button>
      </Card>
    );
  }
};
