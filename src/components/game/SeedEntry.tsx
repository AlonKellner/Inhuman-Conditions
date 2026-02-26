import { type FC, useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './SeedEntry.module.css';

export const SeedEntry: FC = () => {
  const { setSeed, generateDefaultSeed, generateRandomSeed, validateSeed, advanceState } =
    useGameStore();

  // Initialize with default time-based seed
  const [seedLetters, setSeedLetters] = useState<string[]>(() => {
    const defaultSeed = generateDefaultSeed();
    return defaultSeed.split('');
  });
  const [error, setError] = useState('');

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleSubmit = () => {
    const seedInput = seedLetters.join('');
    const validation = validateSeed(seedInput);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid seed');
      return;
    }

    try {
      setSeed(seedInput);
      advanceState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
    }
  };

  const handleUseDefault = () => {
    const seed = generateDefaultSeed();
    setSeedLetters(seed.split(''));
    setError('');
  };

  const handleRandomize = () => {
    const seed = generateRandomSeed();
    setSeedLetters(seed.split(''));
    setError('');
  };

  const handleLetterChange = (index: number, value: string) => {
    const newValue = value.toUpperCase();
    const lastChar = newValue.charAt(newValue.length - 1);

    // Only allow letters
    if (lastChar && !/^[A-Z]$/i.test(lastChar)) {
      return;
    }

    const newLetters = [...seedLetters];
    newLetters[index] = lastChar || '';
    setSeedLetters(newLetters);
    setError('');

    // Auto-advance to next box
    if (lastChar && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!seedLetters[index] && index > 0) {
        // Current box is empty - move to previous box and delete its letter
        e.preventDefault();
        const newLetters = [...seedLetters];
        newLetters[index - 1] = '';
        setSeedLetters(newLetters);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  // Check if current seed differs from time-based seed
  const currentTimeBasedSeed = generateDefaultSeed();
  const currentSeedValue = seedLetters.join('');
  const showTimeBasedButton = currentSeedValue !== currentTimeBasedSeed;

  return (
    <div className={styles.container}>
      <Card title="Enter Game Seed">
        <p className={styles.description}>
          Enter a 4-letter seed to begin. Players on different devices must use the same seed to
          play together.
        </p>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Seed (4 uppercase letters):</label>
          <div className={styles.letterBoxes}>
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                value={seedLetters[index] || ''}
                onChange={(e) => handleLetterChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={styles.letterBox}
                maxLength={1}
                autoComplete="off"
                spellCheck={false}
              />
            ))}
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.buttons}>
          {showTimeBasedButton && (
            <Button onClick={handleUseDefault} variant="secondary" size="small">
              Use Time-Based Seed
            </Button>
          )}
          <Button onClick={handleRandomize} variant="secondary" size="small">
            Randomize Seed
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={seedLetters.some((letter) => !letter)}
          className={styles.submit}
        >
          Start Game
        </Button>
      </Card>
    </div>
  );
};
