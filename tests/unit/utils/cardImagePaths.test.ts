/**
 * Unit Tests: Card Image Path Utilities
 * Feature: 003-pdf-asset-extraction (US5)
 * Tests: T006-T014
 */

import { describe, it, expect } from 'vitest';
import {
  getSuspectCardImagePath,
  getInvestigatorCardImagePath,
  validateCardImagePath,
  MODULE_MAPPING,
  getModuleFromPacketId,
  getPacketIdFromModule,
} from '../../../src/utils/cardImagePaths';

describe('Card Image Path Utilities', () => {
  describe('getSuspectCardImagePath', () => {
    // T006: Test generates correct paths for human cards
    it('generates correct path for human cards', () => {
      const path = getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card');
      expect(path).toBe('/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png');
    });

    it('generates correct path for multiple human cards', () => {
      const path1 = getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card');
      const path2 = getSuspectCardImagePath('01_small_talk', 1, 2, 'human-card');
      const path3 = getSuspectCardImagePath('01_small_talk', 1, 3, 'human-card');

      expect(path1).toBe('/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png');
      expect(path2).toBe('/assets/cards/suspect/01_small_talk_suspect_p1_c02_human-card.png');
      expect(path3).toBe('/assets/cards/suspect/01_small_talk_suspect_p1_c03_human-card.png');
    });

    // T007: Test generates correct paths for patient cards
    it('generates correct path for patient cards', () => {
      const path = getSuspectCardImagePath('03_imagination', 2, 2, 'patient-card');
      expect(path).toBe('/assets/cards/suspect/03_imagination_suspect_p2_c02_patient-card.png');
    });

    it('generates correct path for patient cards from different modules', () => {
      const path1 = getSuspectCardImagePath('01_small_talk', 2, 1, 'patient-card');
      const path2 = getSuspectCardImagePath('05_hopes', 2, 3, 'patient-card');

      expect(path1).toBe('/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png');
      expect(path2).toBe('/assets/cards/suspect/05_hopes_suspect_p2_c03_patient-card.png');
    });

    // T008: Test generates correct paths for violent cards
    it('generates correct path for violent cards', () => {
      const path = getSuspectCardImagePath('08_threat', 3, 1, 'violent-card');
      expect(path).toBe('/assets/cards/suspect/08_threat_suspect_p3_c01_violent-card.png');
    });

    it('pads card numbers with leading zeros', () => {
      const path1 = getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card');
      const path9 = getSuspectCardImagePath('01_small_talk', 1, 9, 'human-card');

      expect(path1).toContain('_c01_');
      expect(path9).toContain('_c09_');
    });
  });

  describe('getInvestigatorCardImagePath', () => {
    // T009: Test generates correct paths for cover sheets
    it('generates correct path for cover sheets', () => {
      const path = getInvestigatorCardImagePath('01_small_talk', 1, 1, 'cover-sheet');
      expect(path).toBe('/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png');
    });

    it('generates correct paths for cover sheets from all modules', () => {
      const modules = Object.keys(MODULE_MAPPING);
      modules.forEach(module => {
        const path = getInvestigatorCardImagePath(module, 1, 1, 'cover-sheet');
        expect(path).toMatch(/^\/assets\/cards\/investigator\/\d{2}_[\w_]+_investigator_p1_c01_cover-sheet\.png$/);
      });
    });

    // T010: Test generates correct paths for primary prompts
    it('generates correct path for primary prompts', () => {
      const path = getInvestigatorCardImagePath('01_small_talk', 2, 1, 'primary-prompts');
      expect(path).toBe('/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png');
    });

    it('generates correct paths for multiple primary prompts', () => {
      const path1 = getInvestigatorCardImagePath('04_cooperation', 2, 1, 'primary-prompts');
      const path2 = getInvestigatorCardImagePath('04_cooperation', 2, 2, 'primary-prompts');
      const path3 = getInvestigatorCardImagePath('04_cooperation', 2, 3, 'primary-prompts');

      expect(path1).toBe('/assets/cards/investigator/04_cooperation_investigator_p2_c01_primary-prompts.png');
      expect(path2).toBe('/assets/cards/investigator/04_cooperation_investigator_p2_c02_primary-prompts.png');
      expect(path3).toBe('/assets/cards/investigator/04_cooperation_investigator_p2_c03_primary-prompts.png');
    });

    // T011: Test generates correct paths for secondary prompts
    it('generates correct path for secondary prompts', () => {
      const path = getInvestigatorCardImagePath('11_intentions', 3, 2, 'secondary-prompts');
      expect(path).toBe('/assets/cards/investigator/11_intentions_investigator_p3_c02_secondary-prompts.png');
    });

    it('generates correct paths for secondary prompts from different modules', () => {
      const path1 = getInvestigatorCardImagePath('06_body', 3, 1, 'secondary-prompts');
      const path2 = getInvestigatorCardImagePath('09_moral_failings', 3, 3, 'secondary-prompts');

      expect(path1).toBe('/assets/cards/investigator/06_body_investigator_p3_c01_secondary-prompts.png');
      expect(path2).toBe('/assets/cards/investigator/09_moral_failings_investigator_p3_c03_secondary-prompts.png');
    });
  });

  describe('validateCardImagePath', () => {
    // T012: Test accepts valid suspect card paths
    it('validates correct suspect card paths', () => {
      const validPaths = [
        '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png',
        '/assets/cards/suspect/03_imagination_suspect_p2_c02_patient-card.png',
        '/assets/cards/suspect/08_threat_suspect_p3_c03_violent-card.png',
      ];

      validPaths.forEach(path => {
        expect(validateCardImagePath(path, 'suspect')).toBe(true);
      });
    });

    it('validates correct investigator card paths', () => {
      const validPaths = [
        '/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png',
        '/assets/cards/investigator/05_hopes_investigator_p2_c02_primary-prompts.png',
        '/assets/cards/investigator/11_intentions_investigator_p3_c03_secondary-prompts.png',
      ];

      validPaths.forEach(path => {
        expect(validateCardImagePath(path, 'investigator')).toBe(true);
      });
    });

    // T013: Test rejects invalid paths
    it('rejects paths with wrong base directory', () => {
      const invalidPath = '/wrong/path/to/card.png';
      expect(validateCardImagePath(invalidPath, 'suspect')).toBe(false);
    });

    it('rejects paths with wrong file extension', () => {
      const invalidPath = '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.jpg';
      expect(validateCardImagePath(invalidPath, 'suspect')).toBe(false);
    });

    it('rejects paths with incorrect format', () => {
      const invalidPaths = [
        '/assets/cards/suspect/wrongformat.png',
        '/assets/cards/suspect/01_small_talk_p1_c01_human-card.png', // missing 'suspect'
        '/assets/cards/suspect/01_small_talk_suspect_c01_human-card.png', // missing page
      ];

      invalidPaths.forEach(path => {
        expect(validateCardImagePath(path, 'suspect')).toBe(false);
      });
    });

    it('rejects null or undefined paths', () => {
      expect(validateCardImagePath('', 'suspect')).toBe(false);
      expect(validateCardImagePath(null as any, 'suspect')).toBe(false);
      expect(validateCardImagePath(undefined as any, 'suspect')).toBe(false);
    });

    it('rejects mismatched entity types', () => {
      const suspectPath = '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png';
      expect(validateCardImagePath(suspectPath, 'investigator')).toBe(false);

      const investigatorPath = '/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png';
      expect(validateCardImagePath(investigatorPath, 'suspect')).toBe(false);
    });
  });

  describe('MODULE_MAPPING', () => {
    // T014: Test MODULE_MAPPING correctly maps all 11 modules
    it('contains exactly 11 module mappings', () => {
      expect(Object.keys(MODULE_MAPPING)).toHaveLength(11);
    });

    it('maps all expected modules', () => {
      const expectedMappings = {
        '01_small_talk': 'small-talk',
        '02_problem_solving': 'creative-problem-solving',
        '03_imagination': 'imagination',
        '04_cooperation': 'cooperation',
        '05_hopes': 'hopes-and-dreams',
        '06_body': 'the-body',
        '07_grief': 'grief-and-loss',
        '08_threat': 'threat-assessment',
        '09_moral_failings': 'moral-failings',
        '10_self_image': 'self-image',
        '11_intentions': 'intentions',
      };

      Object.entries(expectedMappings).forEach(([module, packetId]) => {
        expect(MODULE_MAPPING[module]).toBe(packetId);
      });
    });

    it('provides reverse mapping functionality', () => {
      expect(getPacketIdFromModule('01_small_talk')).toBe('small-talk');
      expect(getPacketIdFromModule('11_intentions')).toBe('intentions');
      expect(getModuleFromPacketId('small-talk')).toBe('01_small_talk');
      expect(getModuleFromPacketId('intentions')).toBe('11_intentions');
    });

    it('returns null for unknown modules or packet IDs', () => {
      expect(getPacketIdFromModule('99_unknown')).toBeNull();
      expect(getModuleFromPacketId('unknown-packet')).toBeNull();
    });
  });
});
