import { type FC, useEffect } from 'react';
import { useInvestigatorStore } from '../store/gameStore';
import { GameState } from '../types';
import { InvestigatorView } from './views/InvestigatorView';
import { Conclusion } from './game/Conclusion';
import { GameStoreProvider } from '../store/GameStoreContext';

export const InvestigatorGameFlow: FC = () => {
  const { gameState, advanceState, initializePenaltySelection, penaltySelection } =
    useInvestigatorStore();

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

  // Route based on INVESTIGATOR gameState
  switch (gameState) {
    case GameState.Conclusion:
      return (
        <GameStoreProvider role="investigator">
          <Conclusion />
        </GameStoreProvider>
      );

    default:
      // All other states render InvestigatorView
      // InvestigatorView internally handles rendering based on gameState
      return (
        <GameStoreProvider role="investigator">
          <InvestigatorView />
        </GameStoreProvider>
      );
  }
};
