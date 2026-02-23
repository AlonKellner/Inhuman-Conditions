/**
 * Question Packet Types
 * Themed sets of interview questions with role variants
 */

import type { RoleType } from './role';

export interface Question {
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  examples: string[];
  cardImage?: string; // Path to question card image PNG from extracted PDFs
}

export interface PacketRole {
  roleType: RoleType;
  description: string;
  fault?: string; // Only for robot roles
  traits: string[];
  tasks?: string[]; // Only for violent robots
  catalyzerCardId?: string; // Links to CatalyzerCard.id for robots
}

export interface Packet {
  id: string;
  name: string;
  difficulty: 'intro' | 'easy' | 'intermediate' | 'hard';
  icon: string; // Unicode emoji or icon identifier
  prompt: string; // Instructions for Investigator
  questions: Question[];
  roles: PacketRole[];
  coverSheetImage?: string; // Path to cover sheet image PNG from extracted PDFs
}
