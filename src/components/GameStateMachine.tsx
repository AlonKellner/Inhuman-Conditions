import { type FC, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, GameMode } from '../types';
import { SeedEntry } from './game/SeedEntry';
import { PenaltyCalibration } from './game/PenaltyCalibration';
import { PacketDisplay } from './game/PacketDisplay';
import { BackgroundDisplay } from './game/BackgroundDisplay';
import { RoleReveal } from './game/RoleReveal';
import { ReadyToStart } from './game/ReadyToStart';
import { InvestigatorView } from './game/Interview/InvestigatorView';
import { SuspectView } from './game/Interview/SuspectView';
import { Conclusion } from './game/Conclusion';
import { InducerPuzzleDisplay } from './game/InducerPuzzleDisplay';
import { InvestigatorFormInterface } from './form/InvestigatorFormInterface';

export const GameStateMachine: FC = () => {
  const {
    gameState,
    mode,
    playerRole,
    selectedPenalty,
    selectedRole,
    // Note: selectedPacket and selectedBackground are accessed by
    // PacketDisplay and BackgroundDisplay via their own useGameStore hooks
    penaltyCalibration,
    advanceState,
    startTimer,
  } = useGameStore();

  // Auto-advance through intermediate states ONLY for states not yet implemented
  // PenaltyCalibration, PacketDisplay, BackgroundDisplay, RoleReveal, ReadyToStart have manual progression
  // InducerPuzzle has manual progression once implemented
  useEffect(() => {
    const intermediateStates: GameState[] = [
      GameState.ModeSelection,
      GameState.RoleSelection,
    ];

    if (intermediateStates.includes(gameState)) {
      // Auto-advance after a short delay to show loading state
      const timer = setTimeout(() => {
        advanceState();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [gameState, advanceState]);

  // For MVP, we'll implement only the essential states
  // Additional states (ModeSelection, RoleSelection, etc.) can be added in later phases

  switch (gameState) {
    case GameState.SeedEntry:
      return <SeedEntry />;

    case GameState.PenaltyCalibration:
      // In single-device mode, always show Suspect view during penalty calibration
      // (Suspect needs to click "I Practiced" button 3 times)
      const calibrationRole = mode === 'single-device' ? 'suspect' : (playerRole || 'spectator');

      if (!selectedPenalty) {
        return <div>Loading penalty...</div>;
      }

      return (
        <PenaltyCalibration
          penalty={selectedPenalty}
          role={calibrationRole}
          currentAttempt={penaltyCalibration.practiceAttempts}
          onComplete={advanceState}
        />
      );

    case GameState.PacketDisplay: {
      // In single-device mode, show Investigator view (they see full question list)
      // In multi-device mode, use playerRole
      const packetRole = mode === 'single-device' ? 'investigator' : (playerRole || 'spectator');

      return (
        <PacketDisplay
          role={packetRole}
          onContinue={advanceState}
        />
      );
    }

    case GameState.RoleReveal: {
      // Show Robot Catalyzer card to Suspect BEFORE timer starts
      // This is where Suspect learns their restrictions or tasks
      // Only robots see this state; humans skip it automatically
      if (!selectedRole || selectedRole.roleType === 'human') {
        // Human players skip role reveal - advance immediately
        advanceState();
        return null;
      }

      // For robots, show the catalyzer card with restrictions/tasks and maze preview
      const inducerMazeImage = selectedRole.inducerMazeImage || '/assets/mazes/default.png';

      return (
        <RoleReveal
          role={selectedRole}
          inducerMazeImage={inducerMazeImage}
          onContinue={advanceState}
        />
      );
    }

    case GameState.BackgroundDisplay: {
      // In single-device mode, show Suspect view (they confirm background)
      // In multi-device mode, use playerRole
      const backgroundRole = mode === 'single-device' ? 'suspect' : (playerRole || 'spectator');

      return (
        <BackgroundDisplay
          role={backgroundRole}
          onContinue={advanceState}
        />
      );
    }

    case GameState.ReadyToStart: {
      const handleStartInterview = () => {
        // CRITICAL: Start timer FIRST, then advance to interview
        startTimer();
        advanceState();
      };

      // In single-device mode, always show Investigator view at ready-to-start
      // (Investigator needs to click "Start Interview" button)
      const readyRole = mode === 'single-device' ? 'investigator' : (playerRole || 'spectator');

      return (
        <ReadyToStart
          role={readyRole}
          onStartInterview={handleStartInterview}
          isMultiDevice={mode === GameMode.MultiDevice}
        />
      );
    }

    case GameState.Interview:
      // In single-device mode, default to Investigator view
      // User can manually switch views by passing device
      // In multi-device mode, show based on playerRole
      if (mode === GameMode.SingleDevice) {
        return (
          <div>
            {/* VK-82(e) Form Interface for Investigator */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>VK-82(e) Investigator Form</h2>
              <InvestigatorFormInterface />
            </div>

            {/* Original Investigator View (for comparison/testing) */}
            <div style={{ marginTop: '40px', borderTop: '3px solid #333', paddingTop: '40px' }}>
              <h3 style={{ textAlign: 'center', color: '#666' }}>Legacy Investigator View (for testing)</h3>
              <InvestigatorView />
            </div>

            <div style={{ marginTop: '40px', borderTop: '3px dashed #ccc', paddingTop: '40px' }}>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                <strong>Pass device to Suspect to view their role ↓</strong>
              </p>
              <SuspectView />
            </div>
          </div>
        );
      }
      // For multi-device mode, show form for investigator role
      if (playerRole === 'investigator') {
        return <InvestigatorFormInterface />;
      }
      return <InvestigatorView />;

    case GameState.Conclusion:
      return <Conclusion />;

    case GameState.InducerPuzzle:
      // Show inducer maze puzzle for robots during interview
      if (!selectedRole || selectedRole.roleType === 'human') {
        // Humans don't have inducer puzzles - skip this state
        advanceState();
        return null;
      }

      const mazeImage = selectedRole.inducerMazeImage || '';
      const solution = selectedRole.inducerSolution || '';

      return (
        <InducerPuzzleDisplay
          mazeImage={mazeImage}
          question="Navigate through the maze and report the sequence of letters along your path."
          expectedSolution={solution}
          onSolutionSubmit={(submittedSolution, isCorrect) => {
            // Log the result for debugging
            console.log(`Inducer puzzle submitted: ${submittedSolution}, correct: ${isCorrect}`);
            // For now, allow continuation after any submission
            // In a full implementation, this might track attempts or require correctness
            if (isCorrect) {
              advanceState();
            }
          }}
        />
      );

    // For MVP, auto-advance through intermediate states not yet implemented
    case GameState.ModeSelection:
    case GameState.RoleSelection:
    case GameState.RoleReveal:
      // Show loading state while auto-advancing
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Setting up your game...</h2>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <div className="loading-spinner" />
          </div>
        </div>
      );

    default:
      return <div>Unknown state: {gameState}</div>;
  }
};
