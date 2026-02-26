/**
 * Question Packet Types
 * Themed sets of interview questions - content from card image assets
 */

import type { RoleType } from './role';

export interface Question {
  id: string;
  type: 'primary' | 'secondary';
  cardImage: string; // Path to question card image PNG - source of truth
}

export interface PacketRole {
  roleType: RoleType;
  catalyzerCardId?: string; // Links to CatalyzerCard.id for robots
}

export interface Packet {
  id: string;
  name: string;
  icon: string; // Path to module icon SVG
  coverSheetImage: string; // Path to cover sheet image PNG
  questions: Question[]; // 6 questions (3 primary, 3 secondary) - IDs and image refs only
  roles: PacketRole[]; // Role assignments for this packet
}
