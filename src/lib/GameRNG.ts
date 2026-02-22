import seedrandom from 'seedrandom';

/**
 * Seeded random number generator for deterministic gameplay.
 *
 * Uses the seedrandom library to ensure that the same seed always
 * produces the same sequence of random values, enabling synchronized
 * gameplay across multiple devices without network communication.
 *
 * @example
 * ```ts
 * const rng = new GameRNG('ABCD');
 * const randomNum = rng.nextInt(0, 10); // Always same for seed 'ABCD'
 * const shuffled = rng.shuffle([1, 2, 3, 4, 5]);
 * const picked = rng.choice(['A', 'B', 'C']);
 * ```
 */
export class GameRNG {
  private rng: seedrandom.PRNG;

  /**
   * Creates a new seeded random number generator.
   *
   * @param seed - The seed string (typically 4 uppercase letters like "ABCD")
   */
  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }

  /**
   * Generates a random integer in the range [min, max).
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer in [min, max)
   *
   * @example
   * ```ts
   * const rng = new GameRNG('SEED');
   * rng.nextInt(0, 10); // Returns 0-9
   * rng.nextInt(1, 7);  // Returns 1-6 (like a die)
   * ```
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min)) + min;
  }

  /**
   * Shuffles an array in-place using the Fisher-Yates algorithm.
   *
   * **Note:** This method mutates the input array.
   *
   * @param array - The array to shuffle (will be mutated)
   * @returns The same array, shuffled
   *
   * @example
   * ```ts
   * const rng = new GameRNG('SEED');
   * const cards = [1, 2, 3, 4, 5];
   * rng.shuffle(cards); // cards is now shuffled
   * ```
   */
  shuffle<T>(array: T[]): T[] {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Picks a random element from an array.
   *
   * @param array - The array to pick from
   * @returns A randomly selected element from the array
   *
   * @example
   * ```ts
   * const rng = new GameRNG('SEED');
   * const packet = rng.choice(['Small Talk', 'Imagination', 'Grief']);
   * ```
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }
}
