/**
 * SuspectRoleCard Component
 * Displays the suspect's role information (Human or Robot with restrictions/tasks)
 * Supports both full card view and compact sidebar view
 */

import type { RoleAssignment } from '../../types';
import styles from './SuspectRoleCard.module.css';

export interface SuspectRoleCardProps {
  role: RoleAssignment;
  compact?: boolean; // Show condensed version during interview
}

export function SuspectRoleCard({ role, compact = false }: SuspectRoleCardProps) {
  if (!role) return null;

  const isHuman = role.roleType === 'human';
  const isPatient = role.roleType === 'patient-robot';
  const isViolent = role.roleType === 'violent-robot';

  // Compact version for interview phase
  if (compact) {
    return (
      <div className={styles.compactCard}>
        <h3 className={styles.compactHeading}>
          {isHuman ? 'Human' : `Robot: ${role.fault}`}
        </h3>

        {isPatient && role.restrictions && role.restrictions.length > 0 && (
          <div className={styles.compactSection}>
            <strong className={styles.compactLabel}>Restrictions:</strong>
            <ul className={styles.compactList}>
              {role.restrictions.map((restriction, i) => (
                <li key={i}>{restriction}</li>
              ))}
            </ul>
            <p className={styles.compactWarning}>
              ⚠️ Perform penalty when you break a restriction!
            </p>
          </div>
        )}

        {isViolent && role.tasks && role.tasks.length > 0 && (
          <div className={styles.compactSection}>
            <strong className={styles.compactLabel}>Tasks:</strong>
            <ul className={styles.compactList}>
              {role.tasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <div className={styles.roleCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.roleHeading}>
          {isHuman ? 'Human' : `${role.fault} Robot`}
        </h2>
      </div>

      {role.inducerMazeImage && (
        <div className={styles.mazeSection}>
          <h3 className={styles.sectionHeading}>Inducer Pattern</h3>
          <img
            src={role.inducerMazeImage}
            alt="Inducer Pattern"
            className={styles.mazeImage}
          />
        </div>
      )}

      {isPatient && role.restrictions && role.restrictions.length > 0 && (
        <div className={styles.restrictionsSection}>
          <h3 className={styles.sectionHeading}>Restrictions (Patient Robot)</h3>
          <ul className={styles.rulesList}>
            {role.restrictions.map((restriction, i) => (
              <li key={i} className={styles.ruleItem}>{restriction}</li>
            ))}
          </ul>
          <p className={styles.warning}>
            ⚠️ Perform the penalty when you break a restriction!
          </p>
        </div>
      )}

      {isViolent && role.tasks && role.tasks.length > 0 && (
        <div className={styles.tasksSection}>
          <h3 className={styles.sectionHeading}>Tasks (Violent Robot)</h3>
          <ul className={styles.rulesList}>
            {role.tasks.map((task, i) => (
              <li key={i} className={styles.ruleItem}>{task}</li>
            ))}
          </ul>
          <p className={styles.warning}>
            Complete these tasks while appearing human!
          </p>
        </div>
      )}

      {role.description && (
        <div className={styles.descriptionSection}>
          <p className={styles.description}>{role.description}</p>
        </div>
      )}
    </div>
  );
}
