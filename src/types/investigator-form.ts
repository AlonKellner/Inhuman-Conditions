/**
 * VK-82(e) Investigator Form Types
 * Represents the official interview recording form
 */

export interface SuspectName {
  first: string; // Max 15 characters
  middle: string; // Max 1 character
  last: string; // Max 15 characters
}

export interface PenaltyAttempts {
  attempt1: boolean;
  attempt2: boolean;
  attempt3: boolean;
}

export type InducerResult = 'yes' | 'no' | null;

export type FinalDetermination = 'human' | 'robot' | null;

export type PerformanceReview = 'correct' | 'incorrect' | 'na' | null;

/**
 * Complete VK-82(e) form state
 */
export interface InvestigatorFormData {
  // PENALTY section
  penaltyAttempts: PenaltyAttempts;

  // INDUCE section
  selectedModule: string | null;
  inducerResult: InducerResult;

  // SUSPECT section
  selectedBackground: string | null;
  suspectName: SuspectName;

  // NOTES section
  investigatorNotes: string;

  // VERIFY section
  determination: FinalDetermination;
  signature: string;
  date: string; // Auto-filled with current date

  // PERFORMANCE REVIEW section (auto-filled after submission)
  performanceReview: PerformanceReview;
}

/**
 * Form section visibility and editability
 */
export interface FormSectionConfig {
  penalty: { visible: boolean; editable: boolean };
  induce: { visible: boolean; editable: boolean };
  suspect: { visible: boolean; editable: boolean };
  notes: { visible: boolean; editable: boolean };
  verify: { visible: boolean; editable: boolean };
  performanceReview: { visible: boolean; editable: boolean };
}

/**
 * Widget position from labeled bounding box
 */
export interface FormWidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Parsed form element from label
 */
export interface FormElement {
  id: string;
  type: 'checkbox' | 'text-input' | 'letter-box' | 'textarea' | 'dropdown' | 'icon-selector' | 'label';
  section: 'penalty' | 'induce' | 'suspect' | 'notes' | 'verify' | 'performance-review';
  position: FormWidgetPosition;
  description: string;
  metadata?: Record<string, unknown>;
}
