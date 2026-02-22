import { describe, it, expect } from 'vitest';
import { generateInducerPattern } from './inducerPattern';
import { GameRNG } from './GameRNG';
import { Direction } from '../types/inducer';

describe('inducerPattern', () => {
  describe('generateInducerPattern', () => {
    it('should generate a 5x5 grid', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      expect(pattern.grid).toHaveLength(5);
      pattern.grid.forEach((row) => {
        expect(row).toHaveLength(5);
      });
    });

    it('should generate cells with valid coordinates', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      pattern.grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          expect(cell.row).toBe(rowIndex);
          expect(cell.col).toBe(colIndex);
        });
      });
    });

    it('should generate connections using Direction bitflags', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      let hasConnections = false;

      pattern.grid.forEach((row) => {
        row.forEach((cell) => {
          // Connections should be a valid bitflag combination
          expect(cell.connections).toBeGreaterThanOrEqual(0);
          expect(cell.connections).toBeLessThan(16); // Max is North | East | South | West = 15

          if (cell.connections > 0) {
            hasConnections = true;
          }
        });
      });

      // At least some cells should have connections
      expect(hasConnections).toBe(true);
    });

    it('should generate letter markers on some cells', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      const labeled = pattern.grid
        .flat()
        .filter((cell) => cell.label !== undefined && cell.label !== '');

      // Should have some labeled cells
      expect(labeled.length).toBeGreaterThan(0);

      // Labels should be uppercase letters
      labeled.forEach((cell) => {
        expect(cell.label).toMatch(/^[A-Z]$/);
      });
    });

    it('should generate a solution path from labeled cells', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      expect(pattern.solutionPath).toBeDefined();
      expect(pattern.solutionPath.length).toBeGreaterThan(0);

      // Solution path should only contain uppercase letters
      expect(pattern.solutionPath).toMatch(/^[A-Z]+$/);
    });

    it('should generate a question about the pattern', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      expect(pattern.question).toBeDefined();
      expect(pattern.question.length).toBeGreaterThan(0);
    });

    it('should be deterministic for same seed', () => {
      const rng1 = new GameRNG('SAME');
      const pattern1 = generateInducerPattern(rng1);

      const rng2 = new GameRNG('SAME');
      const pattern2 = generateInducerPattern(rng2);

      // Grids should be identical
      expect(pattern1.grid).toEqual(pattern2.grid);
      expect(pattern1.solutionPath).toBe(pattern2.solutionPath);
      expect(pattern1.question).toBe(pattern2.question);
    });

    it('should generate different patterns for different seeds', () => {
      const rng1 = new GameRNG('AAAA');
      const pattern1 = generateInducerPattern(rng1);

      const rng2 = new GameRNG('ZZZZ');
      const pattern2 = generateInducerPattern(rng2);

      // Patterns should be different
      expect(pattern1.grid).not.toEqual(pattern2.grid);
    });

    it('should have symmetric connections (if cell A connects to B, B connects to A)', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = pattern.grid[row][col];

          // Check North connection
          if (cell.connections & Direction.North) {
            if (row > 0) {
              const northCell = pattern.grid[row - 1][col];
              expect(northCell.connections & Direction.South).toBeTruthy();
            }
          }

          // Check East connection
          if (cell.connections & Direction.East) {
            if (col < 4) {
              const eastCell = pattern.grid[row][col + 1];
              expect(eastCell.connections & Direction.West).toBeTruthy();
            }
          }

          // Check South connection
          if (cell.connections & Direction.South) {
            if (row < 4) {
              const southCell = pattern.grid[row + 1][col];
              expect(southCell.connections & Direction.North).toBeTruthy();
            }
          }

          // Check West connection
          if (cell.connections & Direction.West) {
            if (col > 0) {
              const westCell = pattern.grid[row][col - 1];
              expect(westCell.connections & Direction.East).toBeTruthy();
            }
          }
        }
      }
    });

    it('should not have connections to out-of-bounds cells', () => {
      const rng = new GameRNG('TEST');
      const pattern = generateInducerPattern(rng);

      // Top row should not have North connections
      pattern.grid[0].forEach((cell) => {
        expect(cell.connections & Direction.North).toBe(0);
      });

      // Bottom row should not have South connections
      pattern.grid[4].forEach((cell) => {
        expect(cell.connections & Direction.South).toBe(0);
      });

      // Left column should not have West connections
      for (let row = 0; row < 5; row++) {
        expect(pattern.grid[row][0].connections & Direction.West).toBe(0);
      }

      // Right column should not have East connections
      for (let row = 0; row < 5; row++) {
        expect(pattern.grid[row][4].connections & Direction.East).toBe(0);
      }
    });
  });
});
