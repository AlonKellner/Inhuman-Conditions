import { type FC } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { RoleAssignment } from '../../types/role';
import styles from './RoleReveal.module.css';

export interface RoleRevealProps {
  role: RoleAssignment;
  inducerMazeImage: string;
  onContinue: () => void;
}

/**
 * RoleReveal Component
 *
 * Displays the Robot Catalyzer card to the Suspect BEFORE the timer starts.
 * This is a critical phase where the Suspect learns their restrictions or tasks.
 *
 * Official game flow:
 * - Suspect privately views their Robot Catalyzer card
 * - Reads restrictions (patient robot) or tasks (violent robot)
 * - Sees preview of inducer maze they'll solve during interview
 * - Confirms understanding before proceeding
 */
export const RoleReveal: FC<RoleRevealProps> = ({ role, inducerMazeImage, onContinue }) => {
  // Format fault name for display (e.g., "long-term-memory" -> "Long-Term Memory")
  const formatFaultName = (fault?: string): string => {
    if (!fault) return '';
    return fault
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  };

  const isPatientRobot = role.roleType === 'patient-robot';
  const isViolentRobot = role.roleType === 'violent-robot';

  return (
    <div className={styles.container}>
      <Card title="Robot Catalyzer Card">
        <div className={styles.content}>
          {/* Fault Header */}
          <div className={styles.faultHeader}>
            <h2 className={styles.faultName}>{formatFaultName(role.fault)}</h2>
            <p className={styles.roleType}>
              {isPatientRobot ? 'Patient Robot' : isViolentRobot ? 'Violent Robot' : 'Robot'}
            </p>
          </div>

          {/* Description */}
          <div className={styles.description}>
            <p>{role.description}</p>
          </div>

          {/* Traits */}
          {role.traits && role.traits.length > 0 && (
            <div className={styles.traits}>
              <h3>Your Traits</h3>
              <ul>
                {role.traits.map((trait, i) => (
                  <li key={i}>{trait}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Restrictions (Patient Robots) */}
          {role.restrictions && role.restrictions.length > 0 && (
            <div className={styles.restrictions}>
              <h3>Your Restrictions</h3>
              <ul>
                {role.restrictions.map((restriction, i) => (
                  <li key={i}>{restriction}</li>
                ))}
              </ul>
              <p className={styles.warning}>
                <strong>⚠️ Perform your penalty when you break a restriction!</strong>
              </p>
            </div>
          )}

          {/* Tasks (Violent Robots) */}
          {role.tasks && role.tasks.length > 0 && (
            <div className={styles.tasks}>
              <h3>Tasks to Complete</h3>
              <ul>
                {role.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Inducer Maze Preview */}
          <div className={styles.mazePreview}>
            <h3>Inducer Pattern</h3>
            <div className={styles.mazeImageWrapper}>
              <img
                src={inducerMazeImage}
                alt="Inducer Maze Preview"
                className={styles.mazeImage}
              />
            </div>
            <p className={styles.mazeHint}>
              You will solve this maze during the interview
            </p>
          </div>

          {/* Confirmation Button */}
          <div className={styles.buttonWrapper}>
            <Button onClick={onContinue} size="large">
              I Understand My Role
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
