/**
 * Game State Machine
 * 10 linear states with manual button-driven transitions
 */

export enum GameState {
  SeedEntry = 'seed-entry',
  ModeSelection = 'mode-selection',
  RoleSelection = 'role-selection',
  PenaltyCalibration = 'penalty-calibration',
  PacketDisplay = 'packet-display',
  InducerPuzzle = 'inducer-puzzle',
  BackgroundDisplay = 'background-display',
  ReadyToStart = 'ready-to-start',
  Interview = 'interview',
  Conclusion = 'conclusion',
}
