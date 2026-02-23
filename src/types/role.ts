/**
 * Role Types
 * Human, Patient Robot, and Violent Robot variants
 */

export type RoleType = 'human' | 'patient-robot' | 'violent-robot';

export const RoleType = {
  Human: 'human' as const,
  PatientRobot: 'patient-robot' as const,
  ViolentRobot: 'violent-robot' as const,
} as const;

export type RobotFault =
  | 'long-term-memory'
  | 'friendship'
  | 'evaluation'
  | 'taste'
  | 'humor'
  | 'empathy'
  | 'self-preservation'
  | 'curiosity'
  | 'pain'
  | 'deception';

export const RobotFault = {
  LongTermMemory: 'long-term-memory' as const,
  Friendship: 'friendship' as const,
  Evaluation: 'evaluation' as const,
  Taste: 'taste' as const,
  Humor: 'humor' as const,
  Empathy: 'empathy' as const,
  SelfPreservation: 'self-preservation' as const,
  Curiosity: 'curiosity' as const,
  Pain: 'pain' as const,
  Deception: 'deception' as const,
} as const;

export interface RoleAssignment {
  roleType: RoleType;
  fault?: RobotFault; // Only for robots
  description: string;
  traits: string[];
  tasks?: string[]; // Only for violent robots
  restrictions?: string[]; // Only for patient robots
  inducerMazeImage?: string; // Only for robots - path to maze image
  inducerSolution?: string; // Only for robots - expected maze solution
}
