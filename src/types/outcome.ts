/**
 * Determination and Game Outcome Types
 */

import type { RoleType } from './role';

export type Determination = 'human' | 'robot';

export const Determination = {
  Human: 'human' as const,
  Robot: 'robot' as const,
} as const;

export interface GameOutcome {
  determination: Determination;
  actualRole: RoleType;
  correct: boolean;
}
