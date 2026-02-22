/**
 * ContentSelector Tests
 * 100% coverage for deterministic content selection (no React dependencies)
 */

import { describe, it, expect } from 'vitest';
import { ContentSelector } from '../../src/engine/ContentSelector';
import { RoleType } from '../../src/types';
import { packets } from '../../src/data/packets';
import { penalties } from '../../src/data/penalties';
import { backgrounds } from '../../src/data/backgrounds';

describe('ContentSelector', () => {
  describe('Deterministic Selection', () => {
    it('should select same content for same seed', () => {
      const selector1 = new ContentSelector('SAME');
      const selector2 = new ContentSelector('SAME');

      const content1 = selector1.selectContent();
      const content2 = selector2.selectContent();

      expect(content1.packet.id).toBe(content2.packet.id);
      expect(content1.penalty.id).toBe(content2.penalty.id);
      expect(content1.role.roleType).toBe(content2.role.roleType);
      expect(content1.background.id).toBe(content2.background.id);
    });

    it('should select different content for different seeds', () => {
      const selector1 = new ContentSelector('AAAA');
      const selector2 = new ContentSelector('ZZZZ');

      const content1 = selector1.selectContent();
      const content2 = selector2.selectContent();

      // At least one piece of content should be different
      const isDifferent =
        content1.packet.id !== content2.packet.id ||
        content1.penalty.id !== content2.penalty.id ||
        content1.role.roleType !== content2.role.roleType ||
        content1.background.id !== content2.background.id;

      expect(isDifferent).toBe(true);
    });
  });

  describe('Content Structure', () => {
    it('should select valid packet', () => {
      const selector = new ContentSelector('TEST');
      const content = selector.selectContent();

      expect(content.packet).toBeDefined();
      expect(content.packet.id).toBeDefined();
      expect(content.packet.name).toBeDefined();
      expect(content.packet.questions).toBeInstanceOf(Array);
      expect(content.packet.questions.length).toBeGreaterThan(0);
    });

    it('should select valid penalty', () => {
      const selector = new ContentSelector('TEST');
      const content = selector.selectContent();

      expect(content.penalty).toBeDefined();
      expect(content.penalty.id).toBeDefined();
      expect(content.penalty.text).toBeDefined();
      expect(content.penalty.text.length).toBeGreaterThan(0);
    });

    it('should select valid background', () => {
      const selector = new ContentSelector('TEST');
      const content = selector.selectContent();

      expect(content.background).toBeDefined();
      expect(content.background.id).toBeDefined();
      expect(content.background.name).toBeDefined();
    });

    it('should generate valid inducer pattern', () => {
      const selector = new ContentSelector('TEST');
      const content = selector.selectContent();

      expect(content.inducerPattern).toBeDefined();
      expect(content.inducerPattern.grid).toBeDefined();
      expect(content.inducerPattern.grid.length).toBe(5); // 5 rows
      expect(content.inducerPattern.grid[0].length).toBe(5); // 5 cols per row
    });

    it('should shuffle questions deterministically', () => {
      const selector = new ContentSelector('TEST');
      const content = selector.selectContent();

      expect(content.shuffledQuestions).toBeInstanceOf(Array);
      expect(content.shuffledQuestions.length).toBe(content.packet.questions.length);

      // Verify all questions are present (even if shuffled)
      const originalIds = content.packet.questions.map((q) => q.text);
      const shuffledIds = content.shuffledQuestions.map((q) => q.text);

      expect(shuffledIds.sort()).toEqual(originalIds.sort());
    });
  });

  describe('Role Selection', () => {
    it('should select human role', () => {
      // Find a seed that produces human role
      let humanContent: any = null;
      let attempts = 0;

      while (!humanContent && attempts < 100) {
        const testSeed = `TEST${attempts}`;
        const selector = new ContentSelector(testSeed);
        const content = selector.selectContent();

        if (content.role.roleType === RoleType.Human) {
          humanContent = content;
          break;
        }
        attempts++;
      }

      expect(humanContent).not.toBeNull();

      expect(humanContent.role.roleType).toBe(RoleType.Human);
      expect(humanContent.role.description).toBeDefined();
      expect(humanContent.role.traits).toBeDefined();
      expect(humanContent.role.traits.length).toBeGreaterThan(0);
    });

    it('should select patient robot role', () => {
      // Find a seed that produces patient robot role
      let patientContent: any = null;
      let attempts = 0;

      while (!patientContent && attempts < 100) {
        const testSeed = `TEST${attempts}`;
        const selector = new ContentSelector(testSeed);
        const content = selector.selectContent();

        if (content.role.roleType === RoleType.PatientRobot) {
          patientContent = content;
          break;
        }
        attempts++;
      }

      expect(patientContent).not.toBeNull();

      expect(patientContent.role.roleType).toBe(RoleType.PatientRobot);
      expect(patientContent.role.fault).toBeDefined();
      expect(patientContent.role.description).toBeDefined();
      expect(patientContent.role.traits).toBeDefined();
      expect(patientContent.role.restrictions).toBeDefined();
    });

    it('should select violent robot role', () => {
      // Find a seed that produces violent robot role
      let violentContent: any = null;
      let attempts = 0;

      while (!violentContent && attempts < 100) {
        const testSeed = `TEST${attempts}`;
        const selector = new ContentSelector(testSeed);
        const content = selector.selectContent();

        if (content.role.roleType === RoleType.ViolentRobot) {
          violentContent = content;
          break;
        }
        attempts++;
      }

      expect(violentContent).not.toBeNull();

      expect(violentContent.role.roleType).toBe(RoleType.ViolentRobot);
      expect(violentContent.role.fault).toBeDefined();
      expect(violentContent.role.description).toBeDefined();
      expect(violentContent.role.traits).toBeDefined();
      expect(violentContent.role.tasks).toBeDefined();
    });

    it('should follow role distribution probabilities', () => {
      const trials = 1000;
      const roleCounts = {
        human: 0,
        patient: 0,
        violent: 0,
      };

      for (let i = 0; i < trials; i++) {
        const selector = new ContentSelector(`TRIAL${i}`);
        const content = selector.selectContent();

        if (content.role.roleType === RoleType.Human) {
          roleCounts.human++;
        } else if (content.role.roleType === RoleType.PatientRobot) {
          roleCounts.patient++;
        } else if (content.role.roleType === RoleType.ViolentRobot) {
          roleCounts.violent++;
        }
      }

      // Expected: Human ~33%, Patient ~50%, Violent ~17%
      const humanPercent = (roleCounts.human / trials) * 100;
      const patientPercent = (roleCounts.patient / trials) * 100;
      const violentPercent = (roleCounts.violent / trials) * 100;

      // Allow ±10% variance
      expect(humanPercent).toBeGreaterThan(23);
      expect(humanPercent).toBeLessThan(43);

      expect(patientPercent).toBeGreaterThan(40);
      expect(patientPercent).toBeLessThan(60);

      expect(violentPercent).toBeGreaterThan(7);
      expect(violentPercent).toBeLessThan(27);
    });
  });

  describe('Question Shuffling', () => {
    it('should shuffle questions in different order each time with different seed', () => {
      const selector1 = new ContentSelector('AAAA');
      const selector2 = new ContentSelector('BBBB');

      const content1 = selector1.selectContent();
      const content2 = selector2.selectContent();

      // If they selected the same packet, questions should be shuffled differently
      if (content1.packet.id === content2.packet.id) {
        const order1 = content1.shuffledQuestions.map((q) => q.text);
        const order2 = content2.shuffledQuestions.map((q) => q.text);

        // Orders should be different (with high probability)
        const isDifferentOrder = order1.some((text, index) => text !== order2[index]);
        expect(isDifferentOrder).toBe(true);
      }
    });

    it('should shuffle questions in same order for same seed', () => {
      const selector1 = new ContentSelector('SAME');
      const selector2 = new ContentSelector('SAME');

      const content1 = selector1.selectContent();
      const content2 = selector2.selectContent();

      const order1 = content1.shuffledQuestions.map((q) => q.text);
      const order2 = content2.shuffledQuestions.map((q) => q.text);

      expect(order1).toEqual(order2);
    });
  });

  describe('Content Permutations (Cycling)', () => {
    describe('generatePermutations', () => {
      it('should generate permutations for all content types', () => {
        const selector = new ContentSelector('PERM');
        const perms = selector.generatePermutations();

        expect(perms.packets).toBeDefined();
        expect(perms.packets.length).toBeGreaterThan(0);

        expect(perms.penalties).toBeDefined();
        expect(perms.penalties.length).toBeGreaterThan(0);

        expect(perms.backgrounds).toBeDefined();
        expect(perms.backgrounds.length).toBeGreaterThan(0);

        expect(perms.roles).toBeDefined();
      });

      it('should produce same permutations for same seed', () => {
        const selector1 = new ContentSelector('SAME');
        const selector2 = new ContentSelector('SAME');

        const perms1 = selector1.generatePermutations();
        const perms2 = selector2.generatePermutations();

        // Packets permuted in same order
        expect(perms1.packets.map(p => p.id)).toEqual(perms2.packets.map(p => p.id));

        // Penalties permuted in same order
        expect(perms1.penalties.map(p => p.id)).toEqual(perms2.penalties.map(p => p.id));

        // Backgrounds permuted in same order
        expect(perms1.backgrounds.map(b => b.id)).toEqual(perms2.backgrounds.map(b => b.id));
      });

      it('should produce different permutations for different seeds', () => {
        const selector1 = new ContentSelector('AAAA');
        const selector2 = new ContentSelector('ZZZZ');

        const perms1 = selector1.generatePermutations();
        const perms2 = selector2.generatePermutations();

        // At least one permutation should be different
        const packetsDifferent = perms1.packets.map(p => p.id).join(',') !== perms2.packets.map(p => p.id).join(',');
        const penaltiesDifferent = perms1.penalties.map(p => p.id).join(',') !== perms2.penalties.map(p => p.id).join(',');
        const backgroundsDifferent = perms1.backgrounds.map(b => b.id).join(',') !== perms2.backgrounds.map(b => b.id).join(',');

        expect(packetsDifferent || penaltiesDifferent || backgroundsDifferent).toBe(true);
      });

      it('should cache permutations after first generation', () => {
        const selector = new ContentSelector('CACHE');

        const perms1 = selector.generatePermutations();
        const perms2 = selector.generatePermutations();

        // Should return same object reference (cached)
        expect(perms1).toBe(perms2);
      });

      it('should contain all original content items', () => {
        const selector = new ContentSelector('FULL');
        const perms = selector.generatePermutations();

        // All packets present in permutation
        const allPacketIds = packets.map(p => p.id).sort();
        const permPacketIds = perms.packets.map(p => p.id).sort();
        expect(permPacketIds).toEqual(allPacketIds);

        // All penalties present in permutation
        const allPenaltyIds = penalties.map(p => p.id).sort();
        const permPenaltyIds = perms.penalties.map(p => p.id).sort();
        expect(permPenaltyIds).toEqual(allPenaltyIds);

        // All backgrounds present in permutation
        const allBackgroundIds = backgrounds.map(b => b.id).sort();
        const permBackgroundIds = perms.backgrounds.map(b => b.id).sort();
        expect(permBackgroundIds).toEqual(allBackgroundIds);
      });
    });

    describe('selectContentAtIndices', () => {
      it('should select content at specific indices', () => {
        const selector = new ContentSelector('INDEX');
        const perms = selector.generatePermutations();

        const content = selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 0,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        // Should select first items from permutations
        expect(content.packet.id).toBe(perms.packets[0].id);
        expect(content.penalty.id).toBe(perms.penalties[0].id);
        expect(content.background.id).toBe(perms.backgrounds[0].id);
      });

      it('should support cycling through indices', () => {
        const selector = new ContentSelector('CYCLE');

        const content0 = selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 0,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        const content1 = selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 1,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        const content2 = selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 2,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        // Penalties should be different
        expect(content0.penalty.id).not.toBe(content1.penalty.id);
        expect(content1.penalty.id).not.toBe(content2.penalty.id);

        // Packet and background should remain same
        expect(content0.packet.id).toBe(content1.packet.id);
        expect(content0.background.id).toBe(content1.background.id);
      });

      it('should wrap indices at boundary (modulo behavior)', () => {
        const selector = new ContentSelector('WRAP');
        const perms = selector.generatePermutations();

        const packetCount = perms.packets.length;

        const content0 = selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 0,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        const contentWrapped = selector.selectContentAtIndices({
          packetIndex: packetCount, // Should wrap to 0
          penaltyIndex: 0,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        // Should select same packet (wrapped around)
        expect(contentWrapped.packet.id).toBe(content0.packet.id);
      });

      it('should maintain determinism for same seed and indices', () => {
        const selector1 = new ContentSelector('DETER');
        const selector2 = new ContentSelector('DETER');

        const indices = {
          packetIndex: 2,
          penaltyIndex: 3,
          backgroundIndex: 5,
          roleIndex: 1,
        };

        const content1 = selector1.selectContentAtIndices(indices);
        const content2 = selector2.selectContentAtIndices(indices);

        expect(content1.packet.id).toBe(content2.packet.id);
        expect(content1.penalty.id).toBe(content2.penalty.id);
        expect(content1.background.id).toBe(content2.background.id);
        expect(content1.role.roleType).toBe(content2.role.roleType);
      });

      it('should enable multiplayer sync through index-based selection', () => {
        // Player 1 and Player 2 use same seed
        const player1Selector = new ContentSelector('MULTI');
        const player2Selector = new ContentSelector('MULTI');

        // Both players cycle to penalty index 5
        const player1Content = player1Selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 5,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        const player2Content = player2Selector.selectContentAtIndices({
          packetIndex: 0,
          penaltyIndex: 5,
          backgroundIndex: 0,
          roleIndex: 0,
        });

        // Both see same penalty (synchronized through seed + index)
        expect(player1Content.penalty.id).toBe(player2Content.penalty.id);
        expect(player1Content.penalty.text).toBe(player2Content.penalty.text);
      });

      it('should generate role permutation with correct distribution', () => {
        const selector = new ContentSelector('ROLES');

        // Select a packet and generate its role permutation
        const perms = selector.generatePermutations();
        const packet = perms.packets[0];

        // Generate role permutation by selecting multiple role indices
        const roles: RoleType[] = [];
        for (let i = 0; i < 12; i++) {
          const content = selector.selectContentAtIndices({
            packetIndex: 0,
            penaltyIndex: 0,
            backgroundIndex: 0,
            roleIndex: i,
          });
          roles.push(content.role.roleType);
        }

        // Should have 12 roles total
        expect(roles.length).toBe(12);

        // Count role types
        const humanCount = roles.filter(r => r === RoleType.Human).length;
        const patientCount = roles.filter(r => r === RoleType.PatientRobot).length;
        const violentCount = roles.filter(r => r === RoleType.ViolentRobot).length;

        // Expected: 4 human, 6 patient, 2 violent (matches d12 probabilities)
        expect(humanCount).toBe(4);
        expect(patientCount).toBe(6);
        expect(violentCount).toBe(2);
      });
    });
  });
});
