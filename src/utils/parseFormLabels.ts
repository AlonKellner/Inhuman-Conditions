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

    // Extract performance review options (check INCORRECT before CORRECT to avoid substring match)
    if (description.includes('INCORRECT')) {
      metadata.performanceValue = 'incorrect';
    } else if (description.includes('N/A (DEAD)')) {
      metadata.performanceValue = 'na';
    } else if (description.includes('CORRECT')) {
      metadata.performanceValue = 'correct';
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
 * Align checkboxes to a consistent grid based on their section
 * PENALTY and INDUCE share a vertical grid (columns)
 * Performance Review has its own alignment
 */
function alignCheckboxesToGrid(elements: FormElement[]): void {
  // Separate checkboxes into groups
  const penaltyCheckboxes: FormElement[] = [];
  const induceCheckboxes: FormElement[] = [];
  const performanceCheckboxes: FormElement[] = [];

  for (const element of elements) {
    if (element.type === 'checkbox') {
      if (element.section === 'penalty') {
        penaltyCheckboxes.push(element);
      } else if (element.section === 'induce') {
        induceCheckboxes.push(element);
      } else if (element.section === 'performance-review') {
        performanceCheckboxes.push(element);
      }
    }
  }

  // PENALTY and INDUCE share a vertical grid (columns)
  if (penaltyCheckboxes.length === 3 && induceCheckboxes.length === 2) {
    // Sort both by x position
    penaltyCheckboxes.sort((a, b) => a.position.x - b.position.x);
    induceCheckboxes.sort((a, b) => a.position.x - b.position.x);

    // Define columns based on penalty checkboxes
    // Column 0: First attempt (leftmost)
    // Column 1: Second attempt (exactly centered between first and third)
    // Column 2: Third attempt (rightmost)
    const col0 = penaltyCheckboxes[0].position.x;
    const col2 = penaltyCheckboxes[2].position.x;
    const col1 = (col0 + col2) / 2; // Exact midpoint

    const columns = [col0, col1, col2];

    // Align penalty checkboxes to columns
    const penaltyY = penaltyCheckboxes.reduce((sum, cb) => sum + cb.position.y, 0) / penaltyCheckboxes.length;
    penaltyCheckboxes[0].position.x = col0;
    penaltyCheckboxes[0].position.y = penaltyY;
    penaltyCheckboxes[1].position.x = col1;
    penaltyCheckboxes[1].position.y = penaltyY;
    penaltyCheckboxes[2].position.x = col2;
    penaltyCheckboxes[2].position.y = penaltyY;

    // Align induce checkboxes to columns 1 and 2 (YES at col1, NO at col2)
    const induceY = induceCheckboxes.reduce((sum, cb) => sum + cb.position.y, 0) / induceCheckboxes.length;
    induceCheckboxes[0].position.x = col1; // YES
    induceCheckboxes[0].position.y = induceY;
    induceCheckboxes[1].position.x = col2; // NO
    induceCheckboxes[1].position.y = induceY;

    // Ensure consistent checkbox size across penalty and induce (doubled for easier interaction)
    const avgWidth = [...penaltyCheckboxes, ...induceCheckboxes].reduce((sum, cb) => sum + cb.position.width, 0) /
                     (penaltyCheckboxes.length + induceCheckboxes.length);
    const avgHeight = [...penaltyCheckboxes, ...induceCheckboxes].reduce((sum, cb) => sum + cb.position.height, 0) /
                      (penaltyCheckboxes.length + induceCheckboxes.length);

    // Double the size for easier clicking
    const newWidth = avgWidth * 2;
    const newHeight = avgHeight * 2;

    for (const cb of [...penaltyCheckboxes, ...induceCheckboxes]) {
      // Adjust x and y to keep centered on original position
      cb.position.x -= (newWidth - avgWidth) / 2;
      cb.position.y -= (newHeight - avgHeight) / 2;
      cb.position.width = newWidth;
      cb.position.height = newHeight;
    }
  }

  // Performance Review has its own alignment (same height, even spacing, doubled size)
  if (performanceCheckboxes.length > 0) {
    performanceCheckboxes.sort((a, b) => a.position.x - b.position.x);

    const perfY = performanceCheckboxes.reduce((sum, cb) => sum + cb.position.y, 0) / performanceCheckboxes.length;
    const avgWidth = performanceCheckboxes.reduce((sum, cb) => sum + cb.position.width, 0) / performanceCheckboxes.length;
    const avgHeight = performanceCheckboxes.reduce((sum, cb) => sum + cb.position.height, 0) / performanceCheckboxes.length;

    // Double the size for easier clicking
    const newWidth = avgWidth * 2;
    const newHeight = avgHeight * 2;

    for (const cb of performanceCheckboxes) {
      cb.position.x -= (newWidth - avgWidth) / 2;
      cb.position.y = perfY - (newHeight - avgHeight) / 2;
      cb.position.width = newWidth;
      cb.position.height = newHeight;
    }
  }
}

/**
 * Generate letter boxes from container label
 */
function generateLetterBoxes(
  container: RawLabel,
  nameField: 'first' | 'middle' | 'last',
  maxLetters: number
): FormElement[] {
  const elements: FormElement[] = [];
  const containerWidth = container.bounding_box.width;
  const letterWidth = containerWidth / maxLetters;

  for (let i = 0; i < maxLetters; i++) {
    const position: FormWidgetPosition = {
      x: container.bounding_box.x + (i * letterWidth),
      y: container.bounding_box.y,
      width: letterWidth,
      height: container.bounding_box.height,
    };

    elements.push({
      id: `${container.id}-letter-${i}`,
      type: 'letter-box',
      section: 'suspect',
      position,
      description: `${nameField} name letter ${i + 1}/${maxLetters}`,
      metadata: {
        nameField,
        letterIndex: i,
        maxLetters,
      },
    });
  }

  return elements;
}

/**
 * Parse all form labels into structured form elements
 */
export function parseFormLabels(rawLabels: RawLabelsFile): FormElement[] {
  const elements: FormElement[] = [];
  const letterContainers: Map<string, RawLabel> = new Map();

  // First pass: identify letter-by-letter containers and other elements
  for (const label of rawLabels.labels) {
    const description = label.notes;
    const descLower = description.toLowerCase();

    // Check if this is a letter-by-letter container (case-insensitive)
    if (descLower.includes('letter-by-letter text')) {
      if (descLower.includes('first name')) {
        letterContainers.set('first', label);
      } else if (descLower.includes('middle name')) {
        letterContainers.set('middle', label);
      } else if (descLower.includes('last name')) {
        letterContainers.set('last', label);
      }
      continue; // Don't add container itself as an element
    }

    // Skip individual letter box labels - we'll generate these from containers
    if (descLower.includes('letter-by-letter single letter')) {
      continue;
    }

    // Parse non-letter-box elements normally
    const section = parseSection(description);
    const widgetType = parseWidgetType(description);
    const metadata = parseMetadata(description, widgetType);

    const position: FormWidgetPosition = {
      x: label.bounding_box.x,
      y: label.bounding_box.y,
      width: label.bounding_box.width,
      height: label.bounding_box.height,
    };

    elements.push({
      id: label.id,
      type: widgetType,
      section,
      position,
      description,
      metadata,
    });
  }

  // Second pass: generate letter boxes from containers
  const firstNameContainer = letterContainers.get('first');
  if (firstNameContainer) {
    const firstBoxes = generateLetterBoxes(firstNameContainer, 'first', 15);
    elements.push(...firstBoxes);
  }

  const middleNameContainer = letterContainers.get('middle');
  if (middleNameContainer) {
    const middleBoxes = generateLetterBoxes(middleNameContainer, 'middle', 1);
    elements.push(...middleBoxes);
  }

  const lastNameContainer = letterContainers.get('last');
  if (lastNameContainer) {
    const lastBoxes = generateLetterBoxes(lastNameContainer, 'last', 16);
    elements.push(...lastBoxes);
  }

  // Align checkboxes to grid
  alignCheckboxesToGrid(elements);

  // Equalize heights of Module and Background selectors
  const moduleElement = elements.find(el => el.description.includes('Selected Module'));
  const backgroundElement = elements.find(el => el.description.includes('Background'));

  if (moduleElement && backgroundElement) {
    const avgHeight = (moduleElement.position.height + backgroundElement.position.height) / 2;
    moduleElement.position.height = avgHeight;
    backgroundElement.position.height = avgHeight;
  }

  return elements;
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
