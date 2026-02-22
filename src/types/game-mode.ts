/**
 * Game Mode and Player Role Types
 */

export enum GameMode {
  SingleDevice = 'single-device',
  MultiDevice = 'multi-device',
  TimerOnly = 'timer-only',
}

export enum PlayerRole {
  Investigator = 'investigator',
  Suspect = 'suspect',
  Spectator = 'spectator',
}
