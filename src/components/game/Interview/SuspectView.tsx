import { type FC } from 'react';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { CountdownTimer } from '../../ui/CountdownTimer';
import styles from './SuspectView.module.css';

export const SuspectView: FC = () => {
  const {
    selectedRole,
    selectedBackground,
    selectedPenalty,
    timerStarted,
    onTimerElapsed,
    roleVisible,
    toggleRoleVisibility,
  } = useGameStore();

  if (!selectedRole || !selectedBackground || !selectedPenalty) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {timerStarted && <CountdownTimer onElapsed={onTimerElapsed} startTimer={timerStarted} />}

      <Card title="Suspect - Your Role">
        <div className={styles.background}>
          <strong>Your Character:</strong> {selectedBackground.name}
        </div>

        <div className={styles.penalty}>
          <strong>Your Penalty:</strong> {selectedPenalty.text}
          {selectedPenalty.examples && selectedPenalty.examples.length > 0 && (
            <div className={styles.examples}>
              Examples: {selectedPenalty.examples.join(', ')}
            </div>
          )}
        </div>

        <div className={styles.roleSection}>
          <div className={styles.roleHeader}>
            <h3>Your Secret Role</h3>
            <Button onClick={toggleRoleVisibility} variant="secondary" size="small">
              {roleVisible ? 'Hide Role' : 'Show Role'}
            </Button>
          </div>

          {roleVisible && (
            <div className={styles.roleContent}>
              <div className={styles.roleType}>
                <strong>Role Type:</strong>{' '}
                {selectedRole.roleType === 'human'
                  ? 'Human'
                  : selectedRole.roleType === 'patient-robot'
                    ? 'Patient Robot'
                    : 'Violent Robot'}
                {selectedRole.fault && ` (${selectedRole.fault})`}
              </div>

              <div className={styles.description}>
                <strong>Description:</strong>
                <p>{selectedRole.description}</p>
              </div>

              <div className={styles.traits}>
                <strong>Traits:</strong>
                <ul>
                  {selectedRole.traits.map((trait, i) => (
                    <li key={i}>{trait}</li>
                  ))}
                </ul>
              </div>

              {selectedRole.restrictions && selectedRole.restrictions.length > 0 && (
                <div className={styles.restrictions}>
                  <strong>Restrictions:</strong>
                  <ul>
                    {selectedRole.restrictions.map((restriction, i) => (
                      <li key={i}>{restriction}</li>
                    ))}
                  </ul>
                  <p className={styles.penaltyReminder}>
                    <em>Perform your penalty when you break a restriction!</em>
                  </p>
                </div>
              )}

              {selectedRole.tasks && selectedRole.tasks.length > 0 && (
                <div className={styles.tasks}>
                  <strong>Tasks to Complete:</strong>
                  <ul>
                    {selectedRole.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
