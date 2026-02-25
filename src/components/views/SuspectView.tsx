/**
 * SuspectView Component
 * Persistent view for the Suspect role
 * Shows role information, tasks, and what the suspect needs to do
 */

import { type FC } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import { PenaltyCalibration } from '../game/PenaltyCalibration';
import { PenaltySelection } from '../game/PenaltySelection';
import { InducerPuzzleDisplay } from '../game/InducerPuzzleDisplay';
import { BackgroundDisplay } from '../game/BackgroundDisplay';
import { PacketDisplay } from '../game/PacketDisplay';
import { RoleReveal } from '../game/RoleReveal';
import { SuspectRoleCard } from '../cards/SuspectRoleCard';
import { SeedEntry } from '../game/SeedEntry';
import styles from './SuspectView.module.css';

export const SuspectView: FC = () => {
  const {
    gameState,
    selectedRole,
    selectedPenalty,
    selectedBackground,
    penaltyCalibration,
    advanceState,
    updateFormInducerResult,
  } = useGameStore();

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
        if (!selectedRole) {
          return (
            <div className={styles.waiting}>
              <p>Assigning your role...</p>
            </div>
          );
        }

        // Show role reveal for robots
        if (selectedRole.roleType !== 'human') {
          return (
            <RoleReveal
              role={selectedRole}
              inducerMazeImage={selectedRole.inducerMazeImage || ''}
              onContinue={advanceState}
            />
          );
        }

        // Humans just see a brief message
        return (
          <div className={styles.roleCard}>
            <h2>Your Role: Human</h2>
            <p>You are a human being interviewed by an investigator.</p>
            <p>Answer questions naturally and honestly based on your background.</p>
            <button onClick={advanceState} className={styles.continueButton}>
              Continue
            </button>
          </div>
        );

      case 'penalty-calibration':
        if (!selectedPenalty) {
          return <div>Loading penalty...</div>;
        }

        return (
          <div>
            <div className={styles.phaseHeader}>
              <h2>Practice the Penalty</h2>
              <p>The investigator will read your penalty aloud. Practice it 3 times.</p>
            </div>
            <PenaltyCalibration
              penalty={selectedPenalty}
              role="suspect"
              currentAttempt={penaltyCalibration.practiceAttempts}
              onComplete={advanceState}
            />
          </div>
        );

      case 'inducer-puzzle':
        if (!selectedRole || selectedRole.roleType === 'human') {
          // Humans don't have inducer puzzles
          advanceState();
          return null;
        }

        const mazeImage = selectedRole.inducerMazeImage || '';
        const solution = selectedRole.inducerSolution || '';

        return (
          <div>
            <div className={styles.phaseHeader}>
              <h2>Inducer Puzzle (Interference Task)</h2>
              <p>Solve the maze and report your answer to the investigator.</p>
            </div>
            <InducerPuzzleDisplay
              mazeImage={mazeImage}
              question="Navigate through the maze and report the sequence of letters along your path."
              expectedSolution={solution}
              onSolutionSubmit={(submittedSolution, isCorrect) => {
                console.log(`Inducer puzzle: ${submittedSolution}, correct: ${isCorrect}`);
                // Update form with result
                updateFormInducerResult(isCorrect ? 'yes' : 'no');
                // Allow continuation
                if (isCorrect) {
                  advanceState();
                }
              }}
            />
          </div>
        );

      case 'background-display':
        return (
          <div>
            <div className={styles.phaseHeader}>
              <h2>Choose Your Background</h2>
              <p>Select a character background and provide your name to the investigator.</p>
            </div>
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

            {/* Show role reminder */}
            <div className={styles.roleReminder}>
              <h3>Your Role</h3>
              {selectedRole?.roleType === 'human' ? (
                <p><strong>Human</strong> - Answer questions naturally and honestly.</p>
              ) : (
                <>
                  <p><strong>Robot</strong> ({selectedRole?.fault})</p>
                  {selectedRole?.restrictions && selectedRole.restrictions.length > 0 && (
                    <div className={styles.restrictions}>
                      <h4>Restrictions:</h4>
                      <ul>
                        {selectedRole.restrictions.map((restriction, i) => (
                          <li key={i}>{restriction}</li>
                        ))}
                      </ul>
                      <p className={styles.warning}>
                        ⚠️ Perform your penalty when you break a restriction!
                      </p>
                    </div>
                  )}
                  {selectedRole?.tasks && selectedRole.tasks.length > 0 && (
                    <div className={styles.tasks}>
                      <h4>Tasks to Complete:</h4>
                      <ul>
                        {selectedRole.tasks.map((task, i) => (
                          <li key={i}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Show background */}
            {selectedBackground && (
              <div className={styles.backgroundReminder}>
                <h3>Your Background</h3>
                <p><strong>{selectedBackground.name}</strong></p>
                {selectedBackground.description && (
                  <p>{selectedBackground.description}</p>
                )}
              </div>
            )}
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

  // Determine if we should show the role card sidebar
  const showRoleCard = selectedRole && [
    'role-reveal',
    'inducer-puzzle',
    'background-display',
    'ready-to-start',
    'interview',
  ].includes(gameState);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Suspect</h1>
        <div className={styles.stateIndicator}>
          Current Phase: <strong>{formatGameState(gameState)}</strong>
        </div>
      </div>

      {/* Layout with optional sidebar */}
      <div className={showRoleCard ? styles.layoutWithSidebar : styles.layout}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {renderContent()}
        </div>

        {/* Persistent Role Card Sidebar */}
        {showRoleCard && (
          <div className={styles.roleCardSidebar}>
            <SuspectRoleCard
              role={selectedRole}
              compact={gameState === 'interview'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to format game state for display
function formatGameState(state: string): string {
  const stateMap: Record<string, string> = {
    'seed-entry': 'Seed Entry',
    'mode-selection': 'Mode Selection',
    'penalty-calibration': 'Penalty Calibration',
    'packet-display': 'Module Selection',
    'role-selection': 'Role Selection',
    'role-reveal': 'Role Reveal',
    'inducer-puzzle': 'Inducer Puzzle',
    'background-display': 'Background Selection',
    'ready-to-start': 'Ready to Start',
    'interview': 'Interview',
    'conclusion': 'Conclusion',
  };

  return stateMap[state] || state;
}
