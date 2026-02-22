import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateSeed,
  generateDefaultSeed,
  generateRandomSeed,
} from './seedGeneration';

describe('seedGeneration', () => {
  describe('validateSeed', () => {
    it('should accept valid 4-letter uppercase seeds', () => {
      const result = validateSeed('ABCD');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept seeds with any uppercase letters', () => {
      expect(validateSeed('WXYZ').isValid).toBe(true);
      expect(validateSeed('QWER').isValid).toBe(true);
      expect(validateSeed('ZZZZ').isValid).toBe(true);
    });

    it('should reject seeds with lowercase letters', () => {
      const result = validateSeed('abcd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('uppercase');
    });

    it('should reject seeds with mixed case', () => {
      const result = validateSeed('AbCd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject seeds with numbers', () => {
      const result = validateSeed('AB12');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('letters');
    });

    it('should reject seeds with special characters', () => {
      const result = validateSeed('AB@#');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject seeds that are too short', () => {
      const result = validateSeed('ABC');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('4');
    });

    it('should reject seeds that are too long', () => {
      const result = validateSeed('ABCDE');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('4');
    });

    it('should reject empty string', () => {
      const result = validateSeed('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject seeds with spaces', () => {
      const result = validateSeed('AB D');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateDefaultSeed', () => {
    beforeEach(() => {
      // Mock Date to control time
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate a valid 4-letter uppercase seed', () => {
      vi.setSystemTime(new Date('2024-01-15T14:32:00Z'));
      const seed = generateDefaultSeed();

      const validation = validateSeed(seed);
      expect(validation.isValid).toBe(true);
      expect(seed).toHaveLength(4);
      expect(seed).toMatch(/^[A-Z]{4}$/);
    });

    it('should round to 5-minute intervals', () => {
      // 14:32 should round to 14:30
      vi.setSystemTime(new Date('2024-01-15T14:32:00Z'));
      const seed1 = generateDefaultSeed();

      // 14:34 should also round to 14:30
      vi.setSystemTime(new Date('2024-01-15T14:34:59Z'));
      const seed2 = generateDefaultSeed();

      expect(seed1).toBe(seed2);
    });

    it('should generate different seeds for different 5-minute windows', () => {
      // 14:30-14:35 window
      vi.setSystemTime(new Date('2024-01-15T14:32:00Z'));
      const seed1 = generateDefaultSeed();

      // 14:35-14:40 window
      vi.setSystemTime(new Date('2024-01-15T14:36:00Z'));
      const seed2 = generateDefaultSeed();

      expect(seed1).not.toBe(seed2);
    });

    it('should generate same seed for times within same 5-minute window', () => {
      const seeds: string[] = [];

      // Test all times in 14:30-14:35 window
      for (let minute = 30; minute < 35; minute++) {
        for (let second = 0; second < 60; second += 15) {
          vi.setSystemTime(
            new Date(`2024-01-15T14:${minute}:${String(second).padStart(2, '0')}Z`)
          );
          seeds.push(generateDefaultSeed());
        }
      }

      // All seeds in same window should be identical
      const uniqueSeeds = new Set(seeds);
      expect(uniqueSeeds.size).toBe(1);
    });
  });

  describe('generateRandomSeed', () => {
    it('should generate a valid 4-letter uppercase seed', () => {
      const seed = generateRandomSeed();

      const validation = validateSeed(seed);
      expect(validation.isValid).toBe(true);
      expect(seed).toHaveLength(4);
      expect(seed).toMatch(/^[A-Z]{4}$/);
    });

    it('should generate different seeds on multiple calls', () => {
      const seeds = new Set<string>();

      // Generate 100 seeds
      for (let i = 0; i < 100; i++) {
        seeds.add(generateRandomSeed());
      }

      // Should have high probability of uniqueness
      // (not all 100 will be unique, but should be > 95)
      expect(seeds.size).toBeGreaterThan(95);
    });

    it('should use all letters A-Z', () => {
      const allLetters = new Set<string>();

      // Generate many seeds to collect letter distribution
      for (let i = 0; i < 1000; i++) {
        const seed = generateRandomSeed();
        for (const char of seed) {
          allLetters.add(char);
        }
      }

      // Should have seen most letters (allow some statistical variance)
      expect(allLetters.size).toBeGreaterThan(20);
    });
  });
});
