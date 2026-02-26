/**
 * SuspectView Component
 * Persistent view for the Suspect role
 * Shows role information, tasks, and what the suspect needs to do
 */

import { type FC, useEffect } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import { PenaltyCalibration } from '../game/PenaltyCalibration';
import { PenaltySelection } from '../game/PenaltySelection';
import { BackgroundDisplay } from '../game/BackgroundDisplay';
import { PacketDisplay } from '../game/PacketDisplay';
import { RoleReveal } from '../game/RoleReveal';
import { SuspectRoleCard } from '../cards/SuspectRoleCard';
import { SeedEntry } from '../game/SeedEntry';
import PenaltyCardImage from '../cards/PenaltyCardImage';
import { backgrounds } from '../../data/backgrounds';
import type { Background } from '../../types/background';
import styles from './SuspectView.module.css';

/**
 * Get the background card image path from a background object
 * Finds the original index to ensure card images match background names after shuffling
 */
function getBackgroundCardPath(background: Background): string {
  const originalIndex = backgrounds.findIndex(bg => bg.id === background.id);
  if (originalIndex === -1) {
    console.error(`Background not found: ${background.id}`);
    return '/assets/cards/backgrounds/backgrounds_p1_c01_background.png';
  }
  const page = Math.floor(originalIndex / 6) + 1;
  const cardNum = (originalIndex % 6) + 1;
  const paddedCardNum = cardNum.toString().padStart(2, '0');
  return `/assets/cards/backgrounds/backgrounds_p${page}_c${paddedCardNum}_background.png`;
}

export const SuspectView: FC = () => {
  const {
    gameState,
    selectedRole,
    selectedPacket,
    selectedPenalty,
    selectedBackground,
    penaltyCalibration,
    advanceState,
  } = useGameStore();

  // Auto-advance from inducer-puzzle phase (maze is shown on suspect card)
  useEffect(() => {
    if (gameState === 'inducer-puzzle') {
      advanceState();
    }
  }, [gameState, advanceState]);

  // Helper to determine what to show
  const renderContent = () => {
    switch (gameState) {
      case 'seed-entry':
        // Both players can enter the seed independently
        return <SeedEntry />;

      case 'mode-selection':
        // Auto-advance - no UI needed (handled by SuspectGameFlow)
        return null;

      case 'penalty-selection':
        return <PenaltySelection role="suspect" />;

      case 'packet-display':
        return <PacketDisplay role="suspect" onContinue={advanceState} />;

      case 'role-selection':
      case 'role-reveal':
        if (!selectedRole || !selectedPacket) {
          return (
            <div className={styles.waiting}>
              <p>Assigning your role...</p>
            </div>
          );
        }

        // Show role reveal for all roles (humans and robots)
        return (
          <RoleReveal
            role={selectedRole}
            packetId={selectedPacket.id}
            inducerMazeImage={selectedRole.inducerMazeImage || ''}
            onContinue={advanceState}
          />
        );

      case 'penalty-calibration':
        if (!selectedPenalty) {
          return <div>Loading penalty...</div>;
        }

        return (
          <div>
            <PenaltyCalibration
              penalty={selectedPenalty}
              role="suspect"
              currentAttempt={penaltyCalibration.practiceAttempts}
              onComplete={advanceState}
            />
          </div>
        );

      case 'inducer-puzzle':
        // Inducer maze is shown on the suspect card itself, no separate puzzle phase needed
        // Auto-advances via useEffect
        return null;

      case 'background-display':
        return (
          <div>
            <BackgroundDisplay role="suspect" onContinue={advanceState} />
          </div>
        );

      case 'ready-to-start':
        return (
          <div className={styles.roleCard}>
            <h2>Ready to Start</h2>
            <p>When the Investigator starts the interview, press Continue below.</p>
            <p className={styles.infoText}>
              The interview lasts 5 minutes. Answer questions based on your role and background.
            </p>
            <button onClick={advanceState} className={styles.continueButton}>
              Continue (Interview Started)
            </button>
          </div>
        );

      case 'interview':
        return (
          <div className={styles.interviewCard}>
            <h2>Interview in Progress</h2>
            <p className={styles.infoText}>
              Refer to your cards in the sidebar. Answer questions based on your role and background.
            </p>
          </div>
        );

      case 'conclusion':
        // Conclusion is now handled by SuspectGameFlow
        // This case shouldn't be reached, but show a fallback
        return (
          <div className={styles.roleCard}>
            <h2>Interview Complete</h2>
            <p>The interview has ended.</p>
          </div>
        );

      default:
        return (
          <div className={styles.waiting}>
            <p>Preparing...</p>
          </div>
        );
    }
  };

  // Determine if we should show the sidebar with cards
  // Note: Don't show during 'role-reveal' since RoleReveal component already shows the card
  // Note: Cards only appear AFTER role reveal (suspect card is not known during penalty calibration)
  const showCards = selectedRole && selectedPacket && [
    'background-display',
    'ready-to-start',
    'interview',
  ].includes(gameState);

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>

      {/* Persistent Cards Below Content */}
      {showCards && (
        <div className={styles.cardsContainer}>
          {/* Left: Suspect Role Card */}
          <div className={styles.cardLeft}>
            <SuspectRoleCard
              role={selectedRole}
              packetId={selectedPacket?.id}
              compact={gameState === 'interview'}
            />
          </div>

          {/* Right: Penalty (top) and Background (bottom) */}
          <div className={styles.cardRight}>
            {/* Penalty Card (shown after calibration is complete) */}
            {selectedPenalty && ['ready-to-start', 'interview'].includes(gameState) && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Penalty</h3>
                <PenaltyCardImage penalty={selectedPenalty} className={styles.cardImage} />
              </div>
            )}

            {/* Background Card (shown after background display is complete) */}
            {selectedBackground && ['ready-to-start', 'interview'].includes(gameState) && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Background</h3>
                <img
                  src={getBackgroundCardPath(selectedBackground)}
                  alt={`Background: ${selectedBackground.name}`}
                  className={styles.cardImage}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
