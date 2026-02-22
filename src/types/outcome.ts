/**
 * Determination and Game Outcome Types
 */

import type { RoleType } from './role';

export enum Determination {
  Human = 'human',
  Robot = 'robot',
}

export interface GameOutcome {
  determination: Determination;
  actualRole: RoleType;
  correct: boolean;
}
