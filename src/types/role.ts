/**
 * Role Types
 * Human, Patient Robot, and Violent Robot variants
 */

export enum RoleType {
  Human = 'human',
  PatientRobot = 'patient-robot',
  ViolentRobot = 'violent-robot',
}

export enum RobotFault {
  LongTermMemory = 'long-term-memory',
  Friendship = 'friendship',
  Evaluation = 'evaluation',
  Taste = 'taste',
  Humor = 'humor',
  Empathy = 'empathy',
  SelfPreservation = 'self-preservation',
  Curiosity = 'curiosity',
  Pain = 'pain',
  Deception = 'deception',
}

export interface RoleAssignment {
  roleType: RoleType;
  fault?: RobotFault; // Only for robots
  description: string;
  traits: string[];
  tasks?: string[]; // Only for violent robots
  restrictions?: string[]; // Only for patient robots
}
