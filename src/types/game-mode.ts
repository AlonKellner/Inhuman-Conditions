/**
 * Game Mode and Player Role Types
 */

export type GameMode = 'single-device' | 'multi-device' | 'timer-only';

export const GameMode = {
  SingleDevice: 'single-device' as const,
  MultiDevice: 'multi-device' as const,
  TimerOnly: 'timer-only' as const,
} as const;

export type PlayerRole = 'investigator' | 'suspect' | 'spectator';

export const PlayerRole = {
  Investigator: 'investigator' as const,
  Suspect: 'suspect' as const,
  Spectator: 'spectator' as const,
} as const;
