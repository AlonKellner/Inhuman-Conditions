/**
 * ContentSelector Tests
 * 100% coverage for deterministic content selection (no React dependencies)
 */

import { describe, it, expect } from 'vitest';
import { ContentSelector } from '../../src/engine/ContentSelector';
import { RoleType } from '../../src/types';

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
});
