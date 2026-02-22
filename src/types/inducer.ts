/**
 * Inducer Pattern Types
 * Maze-like puzzle with directional connections and letter markers
 */

export enum Direction {
  North = 1 << 0, // 0001
  East = 1 << 1, // 0010
  South = 1 << 2, // 0100
  West = 1 << 3, // 1000
}

export interface Cell {
  row: number;
  col: number;
  connections: number; // Bitflags of Direction enum
  label?: string; // Letter marker (A, B, C, ...)
}

export interface InducerPattern {
  grid: Cell[][]; // 5x5 grid
  solutionPath: string; // Sequence of letters (e.g., "ABCDEF")
  question: string; // Question about the pattern
}
