/**
 * SuspectCardImage Component
 * Displays suspect role card images (human, patient-robot, or violent-robot cards)
 * Following the "assets as source of truth" principle - shows card image without text duplication
 */

import { type FC } from 'react';
import type { RoleType } from '../../types/role';

export interface SuspectCardImageProps {
  roleType: RoleType;
  suspectCardPath: string;
  className?: string;
}

export const SuspectCardImage: FC<SuspectCardImageProps> = ({
  roleType,
  suspectCardPath,
  className = '',
}) => {
  return (
    <img
      src={suspectCardPath}
      alt={`${roleType} Suspect Card`}
      className={`suspect-card-image ${className}`}
      data-testid="suspect-card-image"
    />
  );
};
