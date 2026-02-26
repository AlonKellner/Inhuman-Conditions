import { type FC } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { RoleAssignment } from '../../types/role';
import { catalyzerCards } from '../../data/catalyzerCards';
import CatalyzerCardImage from '../cards/CatalyzerCardImage';
import { SuspectCardImage } from '../cards/SuspectCardImage';
import { getSuspectCardImagePath } from '../../utils/getSuspectCardImagePath';
import '../../styles/cards.css';
import styles from './RoleReveal.module.css';

export interface RoleRevealProps {
  role: RoleAssignment;
  packetId?: string; // Optional: packet ID for deriving human suspect card paths
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
export const RoleReveal: FC<RoleRevealProps> = ({ role, packetId, onContinue }) => {
  // Derive suspect card path from packetId and roleType
  const getSuspectCardPath = (pId: string, roleType: string): string | null => {
    const moduleMap: Record<string, string> = {
      'small-talk': '01',
      'problem-solving': '02',
      'imagination': '03',
      'cooperation': '04',
      'hopes': '05',
      'body': '06',
      'grief': '07',
      'threat': '08',
      'moral-failings': '09',
      'self-image': '10',
      'intentions': '11',
    };

    const moduleNum = moduleMap[pId];
    if (!moduleNum) return null;

    const moduleName = pId.replace(/-/g, '_');

    // Map roleType to page and card type
    const typeMap: Record<string, { page: number; type: string }> = {
      'human': { page: 1, type: 'human-card' },
      'patient-robot': { page: 2, type: 'patient-card' },
      'violent-robot': { page: 3, type: 'violent-card' },
    };

    const config = typeMap[roleType];
    if (!config) return null;

    // Use c01 for all cards (first of the 3 available)
    return `/assets/cards/suspect/${moduleNum}_${moduleName}_suspect_p${config.page}_c01_${config.type}.png`;
  };

  // Try to find matching catalyzer card (for fallback to catalyzer image)
  const matchingCard = role.fault
    ? catalyzerCards.find(
        card => card.roleType === role.roleType && card.fault === role.fault
      )
    : undefined;

  // Get suspect card image path - derive from packetId if available
  const suspectCardPath = packetId
    ? getSuspectCardPath(packetId, role.roleType)
    : matchingCard
    ? getSuspectCardImagePath(matchingCard)
    : null;

  return (
    <div className={styles.container}>
      <Card title="Your Role Card">
        <div className={styles.content}>
          {/* Show suspect card image (preferred), or catalyzer card, or error */}
          {suspectCardPath ? (
            <div className={styles.cardImageContainer}>
              <SuspectCardImage roleType={role.roleType} suspectCardPath={suspectCardPath} />
            </div>
          ) : matchingCard && matchingCard.cardImage ? (
            <div className={styles.cardImageContainer}>
              <CatalyzerCardImage card={matchingCard} />
            </div>
          ) : (
            <div className={styles.error}>
              <p>Card image not available</p>
              {matchingCard && <p className={styles.cardId}>Card: {matchingCard.id}</p>}
            </div>
          )}

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
