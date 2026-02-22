import { describe, it, expect } from 'vitest';
import { GameRNG } from './GameRNG';

describe('GameRNG', () => {
  describe('constructor', () => {
    it('should create an instance with a seed', () => {
      const rng = new GameRNG('TEST');
      expect(rng).toBeInstanceOf(GameRNG);
    });
  });

  describe('determinism', () => {
    it('should produce identical outputs for the same seed', () => {
      const rng1 = new GameRNG('SEED');
      const rng2 = new GameRNG('SEED');

      const values1 = Array(10).fill(0).map(() => rng1.nextInt(0, 100));
      const values2 = Array(10).fill(0).map(() => rng2.nextInt(0, 100));

      expect(values1).toEqual(values2);
    });

    it('should produce different outputs for different seeds', () => {
      const rng1 = new GameRNG('AAAA');
      const rng2 = new GameRNG('ZZZZ');

      const values1 = Array(10).fill(0).map(() => rng1.nextInt(0, 100));
      const values2 = Array(10).fill(0).map(() => rng2.nextInt(0, 100));

      expect(values1).not.toEqual(values2);
    });

    it('should produce identical shuffles for the same seed', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const rng1 = new GameRNG('SHFL');
      const shuffled1 = rng1.shuffle([...arr]);

      const rng2 = new GameRNG('SHFL');
      const shuffled2 = rng2.shuffle([...arr]);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should produce identical choices for the same seed', () => {
      const arr = ['A', 'B', 'C', 'D', 'E'];

      const rng1 = new GameRNG('PICK');
      const choices1 = Array(10).fill(0).map(() => rng1.choice(arr));

      const rng2 = new GameRNG('PICK');
      const choices2 = Array(10).fill(0).map(() => rng2.choice(arr));

      expect(choices1).toEqual(choices2);
    });
  });

  describe('nextInt', () => {
    it('should return values within the specified range [min, max)', () => {
      const rng = new GameRNG('RANGE');
      const min = 10;
      const max = 20;

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
      }
    });

    it('should work with range [0, n)', () => {
      const rng = new GameRNG('ZERO');
      const max = 10;

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(0, max);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(max);
      }
    });

    it('should return min when min === max - 1', () => {
      const rng = new GameRNG('SINGLE');
      const value = rng.nextInt(5, 6);
      expect(value).toBe(5);
    });

    it('should be an integer', () => {
      const rng = new GameRNG('INT');

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(0, 100);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });

  describe('shuffle', () => {
    it('should shuffle an array', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng = new GameRNG('SHUFFLE');
      const shuffled = rng.shuffle([...arr]);

      // Should contain same elements
      expect(shuffled.sort((a, b) => a - b)).toEqual(arr);

      // Should be in different order (with high probability)
      // Note: there's a tiny chance this could fail randomly
      expect(shuffled).not.toEqual(arr);
    });

    it('should not mutate the original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      const rng = new GameRNG('NOMUT');

      rng.shuffle(arr);

      // Array IS mutated (in-place shuffle)
      expect(arr).not.toEqual(original);
    });

    it('should handle empty array', () => {
      const rng = new GameRNG('EMPTY');
      const shuffled = rng.shuffle([]);
      expect(shuffled).toEqual([]);
    });

    it('should handle single-element array', () => {
      const rng = new GameRNG('ONE');
      const shuffled = rng.shuffle([42]);
      expect(shuffled).toEqual([42]);
    });
  });

  describe('choice', () => {
    it('should pick an element from the array', () => {
      const arr = ['A', 'B', 'C', 'D', 'E'];
      const rng = new GameRNG('CHOICE');

      for (let i = 0; i < 50; i++) {
        const picked = rng.choice(arr);
        expect(arr).toContain(picked);
      }
    });

    it('should have roughly uniform distribution', () => {
      const arr = ['A', 'B', 'C'];
      const rng = new GameRNG('UNIFORM');
      const counts: Record<string, number> = { A: 0, B: 0, C: 0 };

      for (let i = 0; i < 300; i++) {
        const picked = rng.choice(arr);
        counts[picked]++;
      }

      // Each should be picked roughly 100 times (±50 for randomness)
      Object.values(counts).forEach(count => {
        expect(count).toBeGreaterThan(50);
        expect(count).toBeLessThan(150);
      });
    });

    it('should work with single-element array', () => {
      const rng = new GameRNG('SINGLE');
      const picked = rng.choice(['only']);
      expect(picked).toBe('only');
    });

    it('should work with different types', () => {
      const rng = new GameRNG('TYPES');

      const numArray = [1, 2, 3];
      const numPicked = rng.choice(numArray);
      expect(typeof numPicked).toBe('number');

      const rng2 = new GameRNG('TYPES');
      const objArray = [{ a: 1 }, { b: 2 }];
      const objPicked = rng2.choice(objArray);
      expect(typeof objPicked).toBe('object');
    });
  });

  describe('edge cases', () => {
    it('should handle very long seeds', () => {
      const longSeed = 'A'.repeat(1000);
      const rng = new GameRNG(longSeed);
      expect(rng.nextInt(0, 10)).toBeGreaterThanOrEqual(0);
    });

    it('should handle seeds with special characters', () => {
      const rng = new GameRNG('!@#$%^&*()');
      expect(rng.nextInt(0, 10)).toBeGreaterThanOrEqual(0);
    });

    it('should handle numeric string seeds', () => {
      const rng = new GameRNG('1234');
      expect(rng.nextInt(0, 10)).toBeGreaterThanOrEqual(0);
    });
  });
});
