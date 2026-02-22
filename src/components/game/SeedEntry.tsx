import { type FC, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './SeedEntry.module.css';

export const SeedEntry: FC = () => {
  const [seedInput, setSeedInput] = useState('');
  const [error, setError] = useState('');

  const { setSeed, generateDefaultSeed, generateRandomSeed, validateSeed, advanceState } =
    useGameStore();

  const handleSubmit = () => {
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
    setSeedInput(seed);
  };

  const handleRandomize = () => {
    const seed = generateRandomSeed();
    setSeedInput(seed);
  };

  return (
    <div className={styles.container}>
      <Card title="Enter Game Seed">
        <p className={styles.description}>
          Enter a 4-letter seed to begin. Players on different devices must use the same seed to
          play together.
        </p>

        <div className={styles.inputGroup}>
          <label htmlFor="seed-input" className={styles.label}>
            Seed (4 uppercase letters):
          </label>
          <input
            id="seed-input"
            type="text"
            value={seedInput}
            onChange={(e) => {
              setSeedInput(e.target.value.toUpperCase());
              setError('');
            }}
            maxLength={4}
            className={styles.input}
            placeholder="ABCD"
            autoFocus
          />
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.buttons}>
          <Button onClick={handleUseDefault} variant="secondary" size="small">
            Use Time-Based Seed
          </Button>
          <Button onClick={handleRandomize} variant="secondary" size="small">
            Randomize Seed
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={seedInput.length !== 4} className={styles.submit}>
          Start Game
        </Button>
      </Card>
    </div>
  );
};
