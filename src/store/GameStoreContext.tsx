/**
 * GameStore Context Provider
 * Provides role-specific store instances to components via React Context
 * Enables independent game instances for Investigator and Suspect views
 */

import { createContext, useContext, type FC, type ReactNode } from 'react';
import { useInvestigatorStore, useSuspectStore } from './gameStore';

// Type for the store hook (both stores have the same signature)
type GameStoreHook = typeof useInvestigatorStore;

// Create context to hold the appropriate store hook
const GameStoreContext = createContext<GameStoreHook | null>(null);

export interface GameStoreProviderProps {
  children: ReactNode;
  role: 'investigator' | 'suspect';
}

/**
 * Provider component that injects the appropriate store based on role
 */
export const GameStoreProvider: FC<GameStoreProviderProps> = ({ children, role }) => {
  // Select the appropriate store hook based on role
  const storeHook = role === 'investigator' ? useInvestigatorStore : useSuspectStore;

  return (
    <GameStoreContext.Provider value={storeHook}>
      {children}
    </GameStoreContext.Provider>
  );
};

/**
 * Context-aware hook to access the appropriate game store
 * Must be used within a GameStoreProvider
 *
 * This replaces the direct import of useGameStore from gameStore.ts
 */
export function useGameStore() {
  const storeHook = useContext(GameStoreContext);

  if (!storeHook) {
    throw new Error(
      'useGameStore must be used within a GameStoreProvider. ' +
      'Wrap your component tree with <GameStoreProvider role="investigator|suspect">.'
    );
  }

  return storeHook();
}
