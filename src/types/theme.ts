/**
 * Theme and Visual Design Type Definitions
 * For Official Design Polish feature
 */

/**
 * Asset type enumeration
 */
export type AssetType = 'font' | 'icon' | 'pattern' | 'image' | 'audio';

/**
 * Metadata for visual assets
 */
export interface AssetMetadata {
  size?: string;           // e.g., "24x24", "150KB"
  source?: string;         // Attribution source
  license?: string;        // CC BY-NC-SA 4.0
  color?: string;          // Hex color if applicable
}

/**
 * Visual asset reference
 */
export interface DesignAsset {
  type: AssetType;
  name: string;
  path: string;
  format: string;
  metadata?: AssetMetadata;
}

/**
 * Color palette configuration
 */
export interface ColorPalette {
  primary: string;         // #6f6b6b
  primaryHover: string;    // #646060
  background: string;      // #ffffff
  backgroundAlt: string;   // #f5f5f5
  text: string;            // #000000
  textMuted: string;       // #666666
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  fontFamily: string;
  baseFontSize: string;
  lineHeight: number;
  fontWeights: {
    normal: number;
    bold: number;
  };
}

/**
 * Halftone pattern configuration
 */
export interface HalftoneConfig {
  subtle: string;          // CSS radial-gradient value
  medium: string;
  dense: string;
  spacing: string;         // e.g., "5px"
  opacity: number;         // 0.1 - 0.3 range
}

/**
 * Module icon name type (all 11 question packets)
 */
export type ModuleIconName =
  | 'small_talk'              // Telephone (Intro)
  | 'creative'                // Scissors (Easy)
  | 'imagination'             // Unicorn (Easy)
  | 'cooperation'             // Tandem Bicycle (Easy)
  | 'hopes_dreams'            // Sprout (Intermediate)
  | 'body_integration'        // Heart (Intermediate)
  | 'grief'                   // Rose (Intermediate)
  | 'threat_assessment'       // Snake (Intermediate)
  | 'moral_failings'          // Devil (Intermediate)
  | 'self_image'              // Mirror (Intermediate)
  | 'recognizing_intentions'; // Water Spout (Hard)

/**
 * Icon mapping from module name to asset path
 */
export interface IconMapping {
  small_talk: string;
  creative: string;
  imagination: string;
  cooperation: string;
  hopes_dreams: string;
  body_integration: string;
  grief: string;
  threat_assessment: string;
  moral_failings: string;
  self_image: string;
  recognizing_intentions: string;
}

/**
 * Animation preferences
 */
export interface AnimationPreferences {
  transitionDuration: string;
  easingFunction: string;
  respectReducedMotion: boolean;
}

/**
 * Complete visual theme configuration
 */
export interface VisualTheme {
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: {
    [key: string]: string;
  };
  halftone: HalftoneConfig;
  icons: IconMapping;
  animations: AnimationPreferences;
}

/**
 * Game stage status
 */
export type StageStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Game stage configuration
 */
export interface GameStage {
  id: string;                      // GameState enum value
  name: string;                    // Human-readable name
  description: string;             // Instructions for this stage
  completionStatus: StageStatus;   // Current status
  timerActive: boolean;            // Whether countdown timer should be running
  requiredActions: string[];       // Actions needed to complete
  allowsManualAdvance: boolean;    // Whether stage requires manual progression
}

/**
 * Penalty calibration state
 */
export interface PenaltyCalibrationState {
  penaltyText: string;             // The selected penalty description
  practiceAttempts: number;        // Current attempt count (0-3)
  maxAttempts: number;             // Maximum attempts required (always 3)
  isComplete: boolean;             // Whether all 3 attempts are done
  lastAttemptTimestamp: number | null; // Timestamp of last practice
}

/**
 * Attribution requirements for CC BY-NC-SA 4.0
 */
export interface Attribution {
  creators: string[];       // ['Tommy Maranges', 'Cory O'Brien']
  illustrator: string;      // 'Mac Schubert'
  license: string;          // 'CC BY-NC-SA 4.0'
  source: string;           // 'https://robots.management/'
  adaptedBy: string;        // 'Inhuman Conditions Web App'
}
