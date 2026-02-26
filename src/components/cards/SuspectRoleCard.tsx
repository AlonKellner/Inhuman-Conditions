/**
 * SuspectRoleCard Component
 * Displays the suspect card image in the sidebar
 * Following "assets as source of truth" principle - shows card image without text duplication
 */

import type { RoleAssignment } from '../../types';
import { catalyzerCards } from '../../data/catalyzerCards';
import { getSuspectCardImagePath } from '../../utils/getSuspectCardImagePath';
import styles from './SuspectRoleCard.module.css';

export interface SuspectRoleCardProps {
  role: RoleAssignment;
  packetId?: string; // Optional: packet ID for deriving human suspect card paths
  compact?: boolean; // Ignored - always shows card image at appropriate size
}

export function SuspectRoleCard({ role, packetId }: SuspectRoleCardProps) {
  if (!role) return null;

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

  // Find matching catalyzer card (for fallback to catalyzer image)
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

  if (!suspectCardPath) {
    return (
      <div className={styles.errorCard}>
        <p>Card image not available</p>
        {matchingCard && <p className={styles.cardId}>Card: {matchingCard.id}</p>}
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <img
        src={suspectCardPath}
        alt="Suspect Role Card"
        className={styles.cardImage}
      />
    </div>
  );
}
