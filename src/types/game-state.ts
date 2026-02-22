/**
 * Game State Machine
 * 10 linear states with manual button-driven transitions
 */

export type GameState =
  | 'seed-entry'
  | 'mode-selection'
  | 'role-selection'
  | 'penalty-calibration'
  | 'packet-display'
  | 'inducer-puzzle'
  | 'background-display'
  | 'ready-to-start'
  | 'interview'
  | 'conclusion';

export const GameState = {
  SeedEntry: 'seed-entry' as const,
  ModeSelection: 'mode-selection' as const,
  RoleSelection: 'role-selection' as const,
  PenaltyCalibration: 'penalty-calibration' as const,
  PacketDisplay: 'packet-display' as const,
  InducerPuzzle: 'inducer-puzzle' as const,
  BackgroundDisplay: 'background-display' as const,
  ReadyToStart: 'ready-to-start' as const,
  Interview: 'interview' as const,
  Conclusion: 'conclusion' as const,
} as const;
