import { type FC, useEffect } from 'react';
import { useSuspectStore } from '../store/gameStore';
import { GameState } from '../types';
import { SuspectView } from './views/SuspectView';
import { Conclusion } from './game/Conclusion';
import { GameStoreProvider } from '../store/GameStoreContext';

export const SuspectGameFlow: FC = () => {
  const { gameState, advanceState, initializePenaltySelection, penaltySelection } =
    useSuspectStore();

  // Initialize penalty selection when needed
  useEffect(() => {
    if (gameState === GameState.PenaltySelection && !penaltySelection) {
      initializePenaltySelection();
    }
  }, [gameState, penaltySelection, initializePenaltySelection]);

  // Auto-advance intermediate states
  useEffect(() => {
    if (gameState === GameState.ModeSelection || gameState === GameState.RoleSelection) {
      const timer = setTimeout(() => advanceState(), 300);
      return () => clearTimeout(timer);
    }
  }, [gameState, advanceState]);

  // Route based on SUSPECT gameState
  switch (gameState) {
    case GameState.Conclusion:
      return (
        <GameStoreProvider role="suspect">
          <Conclusion />
        </GameStoreProvider>
      );

    default:
      // All other states render SuspectView
      // SuspectView internally handles rendering based on gameState
      return (
        <GameStoreProvider role="suspect">
          <SuspectView />
        </GameStoreProvider>
      );
  }
};
