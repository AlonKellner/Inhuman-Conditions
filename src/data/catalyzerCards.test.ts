import { describe, it, expect } from 'vitest';
import { catalyzerCards } from './catalyzerCards';
import { packets } from './packets';

describe('CatalyzerCards Data', () => {
  it('should have at least 10 catalyzer cards for MVP dataset', () => {
    // TODO: Expand to 60+ cards by extracting from PDFs at /tmp/ic-pdfs/images/
    expect(catalyzerCards.length).toBeGreaterThanOrEqual(10);
  });

  it('should have restrictions for all patient robots', () => {
    const patientRobots = catalyzerCards.filter((c) => c.roleType === 'patient-robot');
    expect(patientRobots.length).toBeGreaterThan(0);

    patientRobots.forEach((card) => {
      expect(card.restrictions).toBeDefined();
      expect(card.restrictions!.length).toBeGreaterThan(0);
      expect(card.restrictions).not.toContain('Cannot mention certain topics');
    });
  });

  it('should have tasks for all violent robots', () => {
    const violentRobots = catalyzerCards.filter((c) => c.roleType === 'violent-robot');
    expect(violentRobots.length).toBeGreaterThan(0);

    violentRobots.forEach((card) => {
      expect(card.tasks).toBeDefined();
      expect(card.tasks!.length).toBeGreaterThan(0);
    });
  });

  it('should have valid inducer maze image paths', () => {
    catalyzerCards.forEach((card) => {
      expect(card.inducerMazeImage).toMatch(/^\/assets\/mazes\/.*\.png$/);
    });
  });

  it('should link to packets correctly', () => {
    const packetIds = packets.map((p) => p.id);
    catalyzerCards.forEach((card) => {
      expect(packetIds).toContain(card.packetId);
    });
  });

  it('should have unique IDs', () => {
    const ids = catalyzerCards.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have valid role types', () => {
    const validRoleTypes = ['patient-robot', 'violent-robot'];
    catalyzerCards.forEach((card) => {
      expect(validRoleTypes).toContain(card.roleType);
    });
  });

  it('should have non-empty descriptions', () => {
    catalyzerCards.forEach((card) => {
      expect(card.description).toBeDefined();
      expect(card.description.length).toBeGreaterThan(0);
    });
  });

  it('should have at least one trait per card', () => {
    catalyzerCards.forEach((card) => {
      expect(card.traits).toBeDefined();
      expect(card.traits.length).toBeGreaterThan(0);
    });
  });

  it('should have fault defined for all cards', () => {
    catalyzerCards.forEach((card) => {
      expect(card.fault).toBeDefined();
      expect(typeof card.fault).toBe('string');
      expect(card.fault.length).toBeGreaterThan(0);
    });
  });
});
