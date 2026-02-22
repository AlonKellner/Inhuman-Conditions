/**
 * Content Selector
 * Deterministic content selection based on seeded RNG
 * Pure logic with no React dependencies
 */

import { GameRNG } from '../lib/GameRNG';
import { generateInducerPattern } from '../lib/inducerPattern';
import { packets } from '../data/packets';
import { penalties } from '../data/penalties';
import { backgrounds } from '../data/backgrounds';
import { RoleType } from '../types';
import type {
  Seed,
  Packet,
  Penalty,
  Background,
  RoleAssignment,
  InducerPattern,
  Question,
} from '../types';

export interface SelectedContent {
  packet: Packet;
  penalty: Penalty;
  role: RoleAssignment;
  background: Background;
  inducerPattern: InducerPattern;
  shuffledQuestions: Question[];
}

/**
 * ContentSelector class
 * Handles all deterministic content selection based on seed
 */
export class ContentSelector {
  private rng: GameRNG;

  constructor(seed: Seed) {
    this.rng = new GameRNG(seed);
  }

  /**
   * Select all game content deterministically
   * Same seed will always produce same content
   */
  selectContent(): SelectedContent {
    // Select packet
    const packet = this.rng.choice(packets);

    // Select penalty
    const penalty = this.rng.choice(penalties);

    // Select background
    const background = this.rng.choice(backgrounds);

    // Assign role (Human 33%, Patient Robot 50%, Violent Robot 17%)
    const role = this.selectRole(packet);

    // Generate inducer pattern
    const inducerPattern = generateInducerPattern(this.rng);

    // Shuffle questions
    const shuffledQuestions = this.rng.shuffle([...packet.questions]);

    return {
      packet,
      penalty,
      role,
      background,
      inducerPattern,
      shuffledQuestions,
    };
  }

  /**
   * Select role based on packet and dice roll
   * Mimics d12 roll: 1-4 Human, 5-10 Patient Robot, 11-12 Violent Robot
   */
  private selectRole(packet: Packet): RoleAssignment {
    const roleRoll = this.rng.nextInt(1, 13); // 1-12 like d12

    if (roleRoll <= 4) {
      // Human (1-4)
      return this.selectHumanRole(packet);
    } else if (roleRoll <= 10) {
      // Patient Robot (5-10)
      return this.selectPatientRobotRole(packet);
    } else {
      // Violent Robot (11-12)
      return this.selectViolentRobotRole(packet);
    }
  }

  /**
   * Select human role from packet
   */
  private selectHumanRole(packet: Packet): RoleAssignment {
    const humanRole = packet.roles.find((r) => r.roleType === RoleType.Human);
    return {
      roleType: RoleType.Human,
      description: humanRole?.description || 'A normal human being',
      traits: humanRole?.traits || ['Honest', 'Relaxed'],
    };
  }

  /**
   * Select patient robot role from packet
   */
  private selectPatientRobotRole(packet: Packet): RoleAssignment {
    const patientRoles = packet.roles.filter((r) => r.roleType === RoleType.PatientRobot);
    const patientRole = this.rng.choice(patientRoles);
    return {
      roleType: RoleType.PatientRobot,
      fault: patientRole.fault as any,
      description: patientRole.description,
      traits: patientRole.traits,
      restrictions: ['Cannot mention certain topics'], // Placeholder
    };
  }

  /**
   * Select violent robot role from packet
   */
  private selectViolentRobotRole(packet: Packet): RoleAssignment {
    const violentRoles = packet.roles.filter((r) => r.roleType === RoleType.ViolentRobot);
    const violentRole = this.rng.choice(violentRoles);
    return {
      roleType: RoleType.ViolentRobot,
      fault: violentRole.fault as any,
      description: violentRole.description,
      traits: violentRole.traits,
      tasks: violentRole.tasks || ['Complete assigned tasks'],
    };
  }
}
