/**
 * Penalty Selection State
 * Tracks the interactive penalty selection phase where:
 * 1. Investigator eliminates 1 of 3 penalties
 * 2. Suspect chooses 1 from the remaining 2
 */

import type { Penalty } from './penalty';

export interface PenaltySelectionState {
  // 3 penalties presented to both players
  availablePenalties: Penalty[];

  // Step 1: Investigator eliminates one
  investigatorEliminated: string | null; // penalty ID

  // Step 2: Suspect chooses from remaining two
  suspectChosen: string | null; // penalty ID (must NOT be investigatorEliminated)

  // Completion flag
  isComplete: boolean;
}
