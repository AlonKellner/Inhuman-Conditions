/**
 * InvestigatorView Component
 * Persistent view for the Investigator role
 * Always displays VK-82(e) form and module notebook
 */

import { type FC, useState } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import { InvestigatorFormInterface } from '../form/InvestigatorFormInterface';
import { ModuleNotebook } from './ModuleNotebook';
import { ReadyToStart } from '../game/ReadyToStart';
import { SeedEntry } from '../game/SeedEntry';
import { PenaltySelection } from '../game/PenaltySelection';
import { PenaltyCalibration } from '../game/PenaltyCalibration';
import { CyclingButtons } from '../game/CyclingButtons';
import styles from './InvestigatorView.module.css';

export const InvestigatorView: FC = () => {
  const {
    gameState,
    mode,
    selectedRole,
    selectedPenalty,
    selectedBackground,
    inducerPattern,
    penaltyCalibration,
    contentIndices,
    permutationSizes,
    advanceState,
    startTimer,
    cycleContent,
  } = useGameStore();
  const isSingleDevice = mode === 'single-device';

  // State for notebook page (0-6: cover, primary1-3, secondary1-3)
  const [notebookPage, setNotebookPage] = useState<number>(0);

  // Helper to render state-specific content
  const renderContent = () => {
    switch (gameState) {
      case 'seed-entry':
        // Show seed entry interface (before form is relevant)
        return <SeedEntry />;

      case 'penalty-selection':
        // Show penalty selection with form
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Penalty Selection below form */}
            <div className={styles.contentSection}>
              <PenaltySelection role="investigator" />
            </div>
          </>
        );

      case 'packet-display':
        // Skip packet display - just show form
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />
          </>
        );

      case 'ready-to-start':
        // Show ready to start below form
        const handleStartInterview = () => {
          startTimer();
          advanceState();
        };
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Ready to Start below form */}
            <div className={styles.contentSection}>
              <ReadyToStart
                role="investigator"
                onStartInterview={handleStartInterview}
                isMultiDevice={!isSingleDevice}
              />
            </div>
          </>
        );

      case 'penalty-calibration':
        // Show penalty calibration with form
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Penalty Calibration below form */}
            <div className={styles.contentSection}>
              {selectedPenalty && (
                <PenaltyCalibration
                  penalty={selectedPenalty}
                  role="investigator"
                  currentAttempt={penaltyCalibration.practiceAttempts}
                  onComplete={advanceState}
                />
              )}
            </div>
          </>
        );

      case 'role-reveal':
        // Confirm suspect has reviewed their role
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Role reveal confirmation below form */}
            <div className={styles.contentSection}>
              <div className={styles.infoCard}>
                <h2 className={styles.infoHeading}>Role Assignment</h2>
                <p className={styles.infoText}>
                  Has the Suspect reviewed their role assignment?
                </p>
                <button onClick={advanceState} className={styles.continueButton}>
                  Yes, Continue
                </button>
              </div>
            </div>
          </>
        );

      case 'inducer-puzzle':
        // Show schematic diagram (if available) + prompt for form
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Inducer assessment below form */}
            <div className={styles.contentSection}>
              <div className={styles.infoCard}>
                <h2 className={styles.infoHeading}>Inducer Assessment</h2>

                {/* Show schematic diagram (not full maze) */}
                {inducerPattern && inducerPattern.schematicImage && (
                  <div className={styles.schematicDisplay}>
                    <h3 className={styles.schematicHeading}>Pattern Schematic</h3>
                    <img
                      src={inducerPattern.schematicImage}
                      alt="Inducer schematic"
                      className={styles.schematicImage}
                    />
                  </div>
                )}

                <p className={styles.infoText}>
                  {selectedRole?.roleType === 'human'
                    ? 'Human suspects have no inducer puzzle.'
                    : 'Has the Suspect seen the inducer pattern?'}
                </p>

                <p className={styles.hintText}>
                  Mark the result (Yes/No) on your form based on their response.
                </p>

                <button onClick={advanceState} className={styles.continueButton}>
                  Continue
                </button>
              </div>
            </div>
          </>
        );

      case 'background-display':
        // Show background details + cycling
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Background selection below form */}
            <div className={styles.contentSection}>
              <div className={styles.infoCard}>
                <h2 className={styles.infoHeading}>Background Selection</h2>

                {/* Show current background (synced via cycling) */}
                {selectedBackground && (
                  <div className={styles.backgroundDisplay}>
                    <h3 className={styles.backgroundName}>{selectedBackground.name}</h3>
                    {selectedBackground.description && (
                      <p className={styles.backgroundDescription}>
                        {selectedBackground.description}
                      </p>
                    )}
                  </div>
                )}

                <CyclingButtons
                  label="Background"
                  currentIndex={contentIndices.backgroundIndex}
                  totalItems={permutationSizes.backgrounds}
                  onPrevious={() => cycleContent('background', 'previous')}
                  onNext={() => cycleContent('background', 'next')}
                />

                <p className={styles.infoText}>
                  Use the arrows above to cycle to the background the Suspect selected.
                </p>

                <button onClick={advanceState} className={styles.continueButton}>
                  Continue
                </button>
              </div>
            </div>
          </>
        );

      case 'interview':
      default:
        // Standard vertical layout: Form on top, Notebook below
        // Form is ALWAYS visible for investigator
        return (
          <>
            {/* VK-82(e) Form */}
            <InvestigatorFormInterface />

            {/* Module Notebook below form */}
            <div className={styles.contentSection}>
              <ModuleNotebook
                currentPage={notebookPage}
                onPageChange={setNotebookPage}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Header with game state indicator */}
      <div className={styles.header}>
        <h1 className={styles.title}>Investigator</h1>
        <div className={styles.stateIndicator}>
          Current Phase: <strong>{formatGameState(gameState)}</strong>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
};

// Helper to format game state for display
function formatGameState(state: string): string {
  const stateMap: Record<string, string> = {
    'seed-entry': 'Seed Entry',
    'mode-selection': 'Mode Selection',
    'penalty-selection': 'Penalty Selection',
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
