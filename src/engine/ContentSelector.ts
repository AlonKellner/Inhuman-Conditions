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
import { getCardById } from '../data/catalyzerCards';
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

export interface ContentPermutations {
  packets: Packet[];
  penalties: Penalty[];
  backgrounds: Background[];
  roles: RoleAssignment[]; // Depends on selected packet
}

export interface ContentIndices {
  packetIndex: number;
  penaltyIndex: number;
  backgroundIndex: number;
  roleIndex: number;
}

/**
 * ContentSelector class
 * Handles all deterministic content selection based on seed
 */
export class ContentSelector {
  private rng: GameRNG;
  private seed: Seed;
  private permutations: ContentPermutations | null = null;

  constructor(seed: Seed) {
    this.seed = seed;
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
   * Generate full permutations of all content types
   * Enables content cycling by providing deterministic ordered lists
   */
  generatePermutations(): ContentPermutations {
    if (this.permutations) {
      return this.permutations;
    }

    // Create separate RNG instances for each content type to ensure independence
    // This allows changing one index without affecting others
    const packetRNG = new GameRNG(this.seed + '-packets');
    const penaltyRNG = new GameRNG(this.seed + '-penalties');
    const backgroundRNG = new GameRNG(this.seed + '-backgrounds');

    this.permutations = {
      packets: packetRNG.permute(packets),
      penalties: penaltyRNG.permute(penalties),
      backgrounds: backgroundRNG.permute(backgrounds),
      roles: [], // Generated on demand based on selected packet
    };

    return this.permutations;
  }

  /**
   * Select content at specific indices from permutations
   * Enables content cycling while maintaining determinism
   */
  selectContentAtIndices(indices: ContentIndices): SelectedContent {
    const perms = this.generatePermutations();

    // Wrap indices to handle cycling (e.g., index 18 wraps to 0 for 18-item array)
    const packetIndex = indices.packetIndex % perms.packets.length;
    const penaltyIndex = indices.penaltyIndex % perms.penalties.length;
    const backgroundIndex = indices.backgroundIndex % perms.backgrounds.length;

    const packet = perms.packets[packetIndex];
    const penalty = perms.penalties[penaltyIndex];
    const background = perms.backgrounds[backgroundIndex];

    // Generate role permutation for this specific packet
    const rolePermutation = this.generateRolePermutation(packet);
    const roleIndex = indices.roleIndex % rolePermutation.length;
    const role = rolePermutation[roleIndex];

    // Generate inducer pattern (non-cycling, deterministic per seed)
    const inducerPattern = generateInducerPattern(this.rng);

    // Shuffle questions based on packet
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
   * Generate permutation of all possible roles for a given packet
   * Returns array of 12 roles: 4 human, 6 patient robot, 2 violent robot
   */
  private generateRolePermutation(packet: Packet): RoleAssignment[] {
    const roles: RoleAssignment[] = [];

    // Create human role (4 copies, 33% probability matches d12 rolls 1-4)
    const humanRole = this.selectHumanRole(packet);
    for (let i = 0; i < 4; i++) {
      roles.push(humanRole);
    }

    // Create patient robot roles (6 copies, 50% probability matches d12 rolls 5-10)
    const patientRoles = packet.roles.filter((r) => r.roleType === RoleType.PatientRobot);
    for (let i = 0; i < 6; i++) {
      const patientRole = patientRoles[i % patientRoles.length];
      const catalyzerCard = patientRole.catalyzerCardId
        ? getCardById(patientRole.catalyzerCardId)
        : null;

      roles.push({
        roleType: RoleType.PatientRobot,
        fault: patientRole.fault as any,
        description: patientRole.description,
        traits: patientRole.traits,
        restrictions: catalyzerCard?.restrictions || ['You must follow your programming'],
        inducerMazeImage: catalyzerCard?.inducerMazeImage,
        inducerSolution: catalyzerCard?.inducerSolution,
      });
    }

    // Create violent robot roles (2 copies, 17% probability matches d12 rolls 11-12)
    const violentRoles = packet.roles.filter((r) => r.roleType === RoleType.ViolentRobot);
    for (let i = 0; i < 2; i++) {
      const violentRole = violentRoles[i % violentRoles.length];
      const catalyzerCard = violentRole.catalyzerCardId
        ? getCardById(violentRole.catalyzerCardId)
        : null;

      roles.push({
        roleType: RoleType.ViolentRobot,
        fault: violentRole.fault as any,
        description: violentRole.description,
        traits: violentRole.traits,
        tasks: catalyzerCard?.tasks || violentRole.tasks || ['Complete assigned tasks'],
        inducerMazeImage: catalyzerCard?.inducerMazeImage,
        inducerSolution: catalyzerCard?.inducerSolution,
      });
    }

    // Permute the 12 roles based on seed
    const roleRNG = new GameRNG(this.seed + '-roles-' + packet.name);
    return roleRNG.permute(roles);
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
    const catalyzerCard = patientRole.catalyzerCardId
      ? getCardById(patientRole.catalyzerCardId)
      : null;

    return {
      roleType: RoleType.PatientRobot,
      fault: patientRole.fault as any,
      description: patientRole.description,
      traits: patientRole.traits,
      restrictions: catalyzerCard?.restrictions || ['You must follow your programming'],
      inducerMazeImage: catalyzerCard?.inducerMazeImage,
      inducerSolution: catalyzerCard?.inducerSolution,
    };
  }

  /**
   * Select violent robot role from packet
   */
  private selectViolentRobotRole(packet: Packet): RoleAssignment {
    const violentRoles = packet.roles.filter((r) => r.roleType === RoleType.ViolentRobot);
    const violentRole = this.rng.choice(violentRoles);
    const catalyzerCard = violentRole.catalyzerCardId
      ? getCardById(violentRole.catalyzerCardId)
      : null;

    return {
      roleType: RoleType.ViolentRobot,
      fault: violentRole.fault as any,
      description: violentRole.description,
      traits: violentRole.traits,
      tasks: catalyzerCard?.tasks || violentRole.tasks || ['Complete assigned tasks'],
      inducerMazeImage: catalyzerCard?.inducerMazeImage,
      inducerSolution: catalyzerCard?.inducerSolution,
    };
  }
}
