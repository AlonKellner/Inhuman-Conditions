/**
 * Seed Types
 * 4-letter uppercase seed that determines all game content
 */

export type Seed = string; // Format: /^[A-Z]{4}$/

export interface SeedValidation {
  isValid: boolean;
  error?: string;
}
