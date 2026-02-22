import { type FC, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, GameMode } from '../types';
import { SeedEntry } from './game/SeedEntry';
import { PenaltyCalibration } from './game/PenaltyCalibration';
import { ReadyToStart } from './game/ReadyToStart';
import { InvestigatorView } from './game/Interview/InvestigatorView';
import { SuspectView } from './game/Interview/SuspectView';
import { Conclusion } from './game/Conclusion';

export const GameStateMachine: FC = () => {
  const {
    gameState,
    mode,
    playerRole,
    selectedPenalty,
    penaltyCalibration,
    advanceState,
    startTimer,
  } = useGameStore();

  // Auto-advance through intermediate states ONLY for states not yet implemented
  // PenaltyCalibration and ReadyToStart now have manual progression
  useEffect(() => {
    const intermediateStates: GameState[] = [
      GameState.ModeSelection,
      GameState.RoleSelection,
      GameState.PacketDisplay,
      GameState.InducerPuzzle,
      GameState.BackgroundDisplay,
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

      return (
        <PenaltyCalibration
          penalty={selectedPenalty?.text || ''}
          role={calibrationRole}
          currentAttempt={penaltyCalibration.practiceAttempts}
          onComplete={advanceState}
        />
      );

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
            <InvestigatorView />
            <div style={{ marginTop: '40px', borderTop: '3px dashed #ccc', paddingTop: '40px' }}>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                <strong>Pass device to Suspect to view their role ↓</strong>
              </p>
              <SuspectView />
            </div>
          </div>
        );
      }
      return <InvestigatorView />;

    case GameState.Conclusion:
      return <Conclusion />;

    // For MVP, auto-advance through intermediate states not yet implemented
    case GameState.ModeSelection:
    case GameState.RoleSelection:
    case GameState.PacketDisplay:
    case GameState.InducerPuzzle:
    case GameState.BackgroundDisplay:
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
