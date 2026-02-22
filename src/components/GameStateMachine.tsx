import { type FC } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, GameMode } from '../types';
import { SeedEntry } from './game/SeedEntry';
import { InvestigatorView } from './game/Interview/InvestigatorView';
import { SuspectView } from './game/Interview/SuspectView';
import { Conclusion } from './game/Conclusion';

export const GameStateMachine: FC = () => {
  const { gameState, mode } = useGameStore();

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

    // For MVP, skip intermediate states and jump straight to interview
    case GameState.ModeSelection:
    case GameState.RoleSelection:
    case GameState.PenaltyCalibration:
    case GameState.PacketDisplay:
    case GameState.InducerPuzzle:
    case GameState.BackgroundDisplay:
    case GameState.ReadyToStart:
      // Auto-advance through these states for MVP
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Setting up your game...</h2>
          <p>
            Game State: <strong>{gameState}</strong>
          </p>
          <button
            onClick={() => {
              const store = useGameStore.getState();
              if (gameState === GameState.ReadyToStart) {
                store.startTimer();
              }
              store.advanceState();
            }}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              marginTop: '20px',
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      );

    default:
      return <div>Unknown state: {gameState}</div>;
  }
};
