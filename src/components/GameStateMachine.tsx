import { type FC, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, GameMode } from '../types';
import { SeedEntry } from './game/SeedEntry';
import { InvestigatorView } from './game/Interview/InvestigatorView';
import { SuspectView } from './game/Interview/SuspectView';
import { Conclusion } from './game/Conclusion';

export const GameStateMachine: FC = () => {
  const { gameState, mode, advanceState, startTimer } = useGameStore();

  // Auto-advance through intermediate states for MVP
  // These states will have full implementations in later phases
  useEffect(() => {
    const intermediateStates: GameState[] = [
      GameState.ModeSelection,
      GameState.RoleSelection,
      GameState.PenaltyCalibration,
      GameState.PacketDisplay,
      GameState.InducerPuzzle,
      GameState.BackgroundDisplay,
      GameState.ReadyToStart,
    ];

    if (intermediateStates.includes(gameState)) {
      // Start timer before advancing from ReadyToStart
      if (gameState === GameState.ReadyToStart) {
        startTimer();
      }

      // Auto-advance after a short delay to show loading state
      const timer = setTimeout(() => {
        advanceState();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [gameState, advanceState, startTimer]);

  // For MVP, we'll implement only the essential states
  // Additional states (ModeSelection, RoleSelection, etc.) can be added in later phases

  switch (gameState) {
    case GameState.SeedEntry:
      return <SeedEntry />;

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

    // For MVP, auto-advance through intermediate states
    case GameState.ModeSelection:
    case GameState.RoleSelection:
    case GameState.PenaltyCalibration:
    case GameState.PacketDisplay:
    case GameState.InducerPuzzle:
    case GameState.BackgroundDisplay:
    case GameState.ReadyToStart:
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
