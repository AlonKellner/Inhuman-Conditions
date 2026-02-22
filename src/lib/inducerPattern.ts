/**
 * Inducer Pattern Generation
 * Generates maze-like puzzles with directional connections and letter markers
 * Based on RobotInterrogation's InterferencePattern.cs
 */

import type { GameRNG } from './GameRNG';
import type { Cell, InducerPattern } from '../types/inducer';
import { Direction } from '../types/inducer';

/**
 * Generates an inducer pattern (5x5 maze puzzle)
 * Uses depth-first search with seeded randomness
 */
export function generateInducerPattern(rng: GameRNG): InducerPattern {
  // Create 5x5 grid of cells with no connections initially
  const grid: Cell[][] = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => ({
      row,
      col,
      connections: 0,
      label: undefined,
    }))
  );

  // Track visited cells
  const visited: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));

  // Path of cells visited during maze generation
  const path: Cell[] = [];

  // Start at random cell
  const startRow = rng.nextInt(0, 5);
  const startCol = rng.nextInt(0, 5);

  // Depth-first search to create maze
  function dfs(row: number, col: number): void {
    visited[row][col] = true;
    path.push(grid[row][col]);

    // Get neighbors in random order
    const directions: Array<[number, number, Direction, Direction]> = [
      [-1, 0, Direction.North, Direction.South], // North
      [0, 1, Direction.East, Direction.West], // East
      [1, 0, Direction.South, Direction.North], // South
      [0, -1, Direction.West, Direction.East], // West
    ];

    // Shuffle directions for randomness
    const shuffledDirections = rng.shuffle([...directions]);

    for (const [dRow, dCol, dir, oppositeDir] of shuffledDirections) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      // Check bounds
      if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
        if (!visited[newRow][newCol]) {
          // Create connection
          grid[row][col].connections |= dir;
          grid[newRow][newCol].connections |= oppositeDir;

          // Recurse
          dfs(newRow, newCol);
        }
      }
    }
  }

  // Generate maze
  dfs(startRow, startCol);

  // Place letter markers at intervals along the path
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letterInterval = Math.max(2, Math.floor(path.length / 6)); // ~6 letters
  const labeledCells: Cell[] = [];

  for (let i = 0; i < path.length; i += letterInterval) {
    const letterIndex = Math.floor(i / letterInterval);
    if (letterIndex < letters.length) {
      const cell = path[i];
      cell.label = letters[letterIndex];
      labeledCells.push(cell);
    }
  }

  // Generate solution path from labeled cells
  const solutionPath = labeledCells.map((cell) => cell.label!).join('');

  // Generate question about the pattern
  const questions = [
    `What letter comes after ${solutionPath[0]} in this sequence?`,
    `What is the third letter in the sequence?`,
    `What letter is at position (${labeledCells[1]?.row}, ${labeledCells[1]?.col})?`,
    `How many letters are marked in the pattern?`,
  ];

  const question = rng.choice(questions);

  return {
    grid,
    solutionPath,
    question,
  };
}
