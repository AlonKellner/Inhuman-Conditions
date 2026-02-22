/**
 * Seed Generation Utilities
 * Generates and validates 4-letter seeds for game synchronization
 */

import type { Seed, SeedValidation } from '../types/seed';

/**
 * Validates a seed format
 * Must be exactly 4 uppercase letters (A-Z)
 */
export function validateSeed(seed: Seed): SeedValidation {
  // Check length
  if (seed.length !== 4) {
    return {
      isValid: false,
      error: 'Seed must be exactly 4 characters',
    };
  }

  // Check format: only uppercase letters A-Z
  if (!/^[A-Z]{4}$/.test(seed)) {
    if (/[a-z]/.test(seed)) {
      return {
        isValid: false,
        error: 'Seed must be uppercase letters only',
      };
    }
    if (/\d/.test(seed)) {
      return {
        isValid: false,
        error: 'Seed must be letters only (no numbers)',
      };
    }
    return {
      isValid: false,
      error: 'Seed must contain only uppercase letters (A-Z)',
    };
  }

  return { isValid: true };
}

/**
 * Generates a default seed based on current UTC time
 * Rounds to nearest 5-minute interval for global synchronization
 *
 * @returns 4-letter uppercase seed
 */
export function generateDefaultSeed(): Seed {
  const now = new Date();

  // Round to nearest 5-minute interval
  const minutes = now.getUTCMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;

  // Create timestamp rounded to 5-minute window
  const roundedTime = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      roundedMinutes,
      0,
      0
    )
  );

  // Convert timestamp to number and hash it
  const timestamp = roundedTime.getTime();

  // Simple hash function to convert timestamp to 4 letters
  // Uses modulo to map to A-Z range (26 letters)
  let hash = timestamp;
  const letters: string[] = [];

  for (let i = 0; i < 4; i++) {
    const letterIndex = hash % 26;
    letters.push(String.fromCharCode(65 + letterIndex)); // 65 = 'A'
    hash = Math.floor(hash / 26);
  }

  return letters.join('');
}

/**
 * Generates a cryptographically random seed
 * Uses Web Crypto API for true randomness
 *
 * @returns 4-letter uppercase seed
 */
export function generateRandomSeed(): Seed {
  // Use Web Crypto API for cryptographic randomness
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);

  // Map each byte to a letter A-Z (0-25)
  const letters = Array.from(array).map((byte) => {
    const letterIndex = byte % 26;
    return String.fromCharCode(65 + letterIndex); // 65 = 'A'
  });

  return letters.join('');
}
