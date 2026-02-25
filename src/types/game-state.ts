/**
 * Game State Machine
 * 12 linear states following official Inhuman Conditions game flow
 * Official order: Seed → Mode → Penalty Selection → Penalty Calibration → Packet → Role Selection → Role Reveal → Inducer → Background → Ready → Interview → Conclusion
 */

export type GameState =
  | 'seed-entry'
  | 'mode-selection'
  | 'penalty-selection'
  | 'penalty-calibration'
  | 'packet-display'
  | 'role-selection'
  | 'role-reveal'
  | 'inducer-puzzle'
  | 'background-display'
  | 'ready-to-start'
  | 'interview'
  | 'conclusion';

export const GameState = {
  SeedEntry: 'seed-entry' as const,
  ModeSelection: 'mode-selection' as const,
  PenaltySelection: 'penalty-selection' as const,
  PenaltyCalibration: 'penalty-calibration' as const,
  PacketDisplay: 'packet-display' as const,
  RoleSelection: 'role-selection' as const,
  RoleReveal: 'role-reveal' as const,
  InducerPuzzle: 'inducer-puzzle' as const,
  BackgroundDisplay: 'background-display' as const,
  ReadyToStart: 'ready-to-start' as const,
  Interview: 'interview' as const,
  Conclusion: 'conclusion' as const,
} as const;
