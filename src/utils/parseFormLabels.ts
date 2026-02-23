/**
 * Parse VK-82(e) form labels from extraction/data/labels/form_labels.json
 * Maps textual descriptions to form widget types and sections
 */

import type { FormElement, FormWidgetPosition } from '../types/investigator-form';

interface RawLabel {
  id: string;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  notes: string;
}

interface RawLabelsFile {
  labels: RawLabel[];
}

/**
 * Parse section from label description
 */
function parseSection(description: string): FormElement['section'] {
  const desc = description.toLowerCase();

  if (desc.startsWith('penalty:')) return 'penalty';
  if (desc.startsWith('induce:')) return 'induce';
  if (desc.startsWith('suspect:')) return 'suspect';
  if (desc.startsWith('notes:')) return 'notes';
  if (desc.startsWith('verify:')) return 'verify';
  if (desc.startsWith('performance review:')) return 'performance-review';

  return 'notes'; // Default fallback
}

/**
 * Parse widget type from label description
 */
function parseWidgetType(description: string): FormElement['type'] {
  const desc = description.toLowerCase();

  if (desc.includes('checkbox')) return 'checkbox';
  if (desc.includes('letter-by-letter single letter')) return 'letter-box';
  if (desc.includes('letter-by-letter text')) return 'text-input';
  if (desc.includes('free text') || desc.includes('date/free text')) return 'text-input';
  if (desc.includes('large empty section')) return 'textarea';
  if (desc.includes('dropdown')) return 'dropdown';
  if (desc.includes('icon to circle')) return 'icon-selector';
  if (desc.includes('signature and date line')) return 'label'; // Non-interactive visual element

  return 'text-input'; // Default fallback
}

/**
 * Extract metadata from description
 */
function parseMetadata(description: string, widgetType: FormElement['type']): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  if (widgetType === 'checkbox') {
    // Extract which attempt number for penalty checkboxes
    if (description.includes('first calibration attempt')) {
      metadata.attemptNumber = 1;
    } else if (description.includes('second calibration attempt')) {
      metadata.attemptNumber = 2;
    } else if (description.includes('third calibration attempt')) {
      metadata.attemptNumber = 3;
    }

    // Extract YES/NO for inducer result
    if (description.includes('YES')) {
      metadata.inducerValue = 'yes';
    } else if (description.includes('NO')) {
      metadata.inducerValue = 'no';
    }

    // Extract performance review options
    if (description.includes('CORRECT')) {
      metadata.performanceValue = 'correct';
    } else if (description.includes('INCORRECT')) {
      metadata.performanceValue = 'incorrect';
    } else if (description.includes('N/A (DEAD)')) {
      metadata.performanceValue = 'na';
    }
  }

  if (widgetType === 'letter-box') {
    // Extract name field and letter position
    const firstNameMatch = description.match(/First name.*?letter (\d+)\/(\d+)/i);
    const lastNameMatch = description.match(/Last name.*?letter (\d+)\/(\d+)/i);
    const middleNameMatch = description.match(/Middle name initial/i);

    if (firstNameMatch) {
      metadata.nameField = 'first';
      metadata.letterIndex = parseInt(firstNameMatch[1]) - 1; // 0-indexed
      metadata.maxLetters = parseInt(firstNameMatch[2]);
    } else if (lastNameMatch) {
      metadata.nameField = 'last';
      metadata.letterIndex = parseInt(lastNameMatch[1]) - 1;
      metadata.maxLetters = parseInt(lastNameMatch[2]);
    } else if (middleNameMatch) {
      metadata.nameField = 'middle';
      metadata.letterIndex = 0;
      metadata.maxLetters = 1;
    }
  }

  if (widgetType === 'icon-selector') {
    // Extract which icon (COG/BRAIN)
    if (description.includes('COG')) {
      metadata.iconValue = 'robot';
      metadata.iconLabel = 'COG';
    } else if (description.includes('BRAIN')) {
      metadata.iconValue = 'human';
      metadata.iconLabel = 'BRAIN';
    }
  }

  return metadata;
}

/**
 * Parse all form labels into structured form elements
 */
export function parseFormLabels(rawLabels: RawLabelsFile): FormElement[] {
  return rawLabels.labels.map((label) => {
    const description = label.notes;
    const section = parseSection(description);
    const widgetType = parseWidgetType(description);
    const metadata = parseMetadata(description, widgetType);

    const position: FormWidgetPosition = {
      x: label.bounding_box.x,
      y: label.bounding_box.y,
      width: label.bounding_box.width,
      height: label.bounding_box.height,
    };

    return {
      id: label.id,
      type: widgetType,
      section,
      position,
      description,
      metadata,
    };
  });
}

/**
 * Group form elements by section for easier rendering
 */
export function groupElementsBySection(elements: FormElement[]) {
  return {
    penalty: elements.filter((el) => el.section === 'penalty'),
    induce: elements.filter((el) => el.section === 'induce'),
    suspect: elements.filter((el) => el.section === 'suspect'),
    notes: elements.filter((el) => el.section === 'notes'),
    verify: elements.filter((el) => el.section === 'verify'),
    performanceReview: elements.filter((el) => el.section === 'performance-review'),
  };
}
