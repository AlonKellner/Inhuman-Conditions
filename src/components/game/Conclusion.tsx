import { type FC } from 'react';
import { useGameStore } from '../../store/GameStoreContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './Conclusion.module.css';

export const Conclusion: FC = () => {
  // Use context-aware store - works for both Investigator and Suspect flows
  const { outcome, selectedRole, resetGame } = useGameStore();

  if (!outcome || !selectedRole) {
    return <div>Loading...</div>;
  }

  const { determination, actualRole, correct } = outcome;

  return (
    <div className={styles.container}>
      <Card title="Interview Complete">
        <div className={styles.result}>
          <h2 className={correct ? styles.correct : styles.incorrect}>
            {correct ? '✓ Correct!' : '✗ Incorrect'}
          </h2>

          <div className={styles.details}>
            <div className={styles.row}>
              <span className={styles.label}>Your Determination:</span>
              <span className={styles.value}>{determination === 'human' ? 'Human' : 'Robot'}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Actual Role:</span>
              <span className={styles.value}>
                {actualRole === 'human' ? 'Human' : `Robot (${selectedRole.fault || 'Unknown'})`}
              </span>
            </div>
          </div>

          <div className={styles.roleInfo}>
            <h3>Role Details:</h3>
            <p><strong>Description:</strong> {selectedRole.description}</p>
            <p><strong>Traits:</strong> {selectedRole.traits.join(', ')}</p>
            {selectedRole.restrictions && (
              <p><strong>Restrictions:</strong> {selectedRole.restrictions.join(', ')}</p>
            )}
            {selectedRole.tasks && (
              <p><strong>Tasks:</strong> {selectedRole.tasks.join(', ')}</p>
            )}
          </div>
        </div>

        <Button onClick={resetGame} className={styles.playAgain}>
          Play Again
        </Button>
      </Card>
    </div>
  );
};
