# Data Model: Official Design Polish and Authentic Game Flow

**Feature**: 002-official-design-polish
**Created**: 2026-02-22
**Purpose**: Define data structures for visual assets and game flow stages

## Overview

This feature primarily deals with visual assets and UI state management rather than core game data. The main data structures support:

1. **Visual asset references** (fonts, icons, patterns)
2. **Game flow stage progression** (tracking setup steps)
3. **Design system configuration** (tokens, theming)

## Entities

### 1. DesignAsset

Represents a visual asset (font, icon, pattern) used in the application.

**Attributes**:
- `type`: AssetType - Type of asset (font, icon, pattern, image)
- `name`: string - Unique identifier for the asset
- `path`: string - File path relative to /public directory
- `format`: string - File format (woff2, svg, png, css)
- `metadata`: AssetMetadata - Optional metadata (size, color, attribution)

**Relationships**:
- Referenced by UI components for rendering
- Organized in asset collections by module

**Validation Rules**:
- Path must start with /public or be relative
- Format must match file extension
- All assets must be self-hosted (no external URLs)

**State Transitions**: None (static references)

**Example**:
```typescript
{
  type: 'icon',
  name: 'small_talk',
  path: '/assets/icons/small_talk.svg',
  format: 'svg',
  metadata: {
    size: '24x24',
    source: 'robots.management'
  }
}
```

---

### 2. GameStage

Represents a distinct phase in the game setup/execution flow.

**Attributes**:
- `id`: GameState - Unique identifier from existing GameState enum
- `name`: string - Human-readable stage name
- `description`: string - Instructions for this stage
- `completionStatus`: StageStatus - Current status (pending, in_progress, completed)
- `timerActive`: boolean - Whether countdown timer should be running
- `requiredActions`: string[] - Actions needed to complete this stage
- `allowsManualAdvance`: boolean - Whether stage requires manual progression

**Relationships**:
- Follows previous GameStage (linked list)
- Precedes next GameStage
- May have associated VisualComponents

**Validation Rules**:
- Timer can only be active AFTER PenaltyCalibration and ReadyToStart completion
- Manual advance stages cannot auto-progress
- Completion status must progress sequentially (pending → in_progress → completed)

**State Transitions**:
```
pending → in_progress (when stage becomes active)
in_progress → completed (when all required actions done)
completed → [stays completed] (no rollback)
```

**Example**:
```typescript
{
  id: GameState.PenaltyCalibration,
  name: 'Penalty Calibration',
  description: 'Investigator reads penalty. Suspect practices 3 times.',
  completionStatus: 'in_progress',
  timerActive: false,
  requiredActions: ['practice_penalty_3_times', 'confirm_understanding'],
  allowsManualAdvance: true
}
```

---

### 3. VisualTheme

Represents the bureaucratic design system configuration.

**Attributes**:
- `colors`: ColorPalette - Monochrome color values (#6f6b6b, #646060, etc.)
- `typography`: TypographyConfig - Font families, sizes, weights
- `spacing`: SpacingSystem - Padding, margin, gap values
- `halftone`: HalftoneConfig - Pattern definitions (opacity, spacing, density)
- `icons`: IconMapping - Map of module names to icon asset paths
- `animations`: AnimationPreferences - Transition durations, easing functions

**Relationships**:
- Applied globally via CSS custom properties
- Referenced by all UI components
- Respects user accessibility preferences (prefers-reduced-motion)

**Validation Rules**:
- All colors must maintain WCAG AA contrast ratios (4.5:1 minimum)
- Halftone opacity must be ≤0.3 to preserve contrast
- Font paths must be self-hosted (no CDN links)
- Animation preferences must respect prefers-reduced-motion

**State Transitions**: None (configuration loaded at app start)

**Example**:
```typescript
{
  colors: {
    primary: '#6f6b6b',
    primaryHover: '#646060',
    background: '#ffffff',
    text: '#000000'
  },
  typography: {
    fontFamily: "'InstitutionalFont', 'InstitutionalFont-fallback', Arial, sans-serif",
    baseFontSize: '18px',
    lineHeight: 1.5
  },
  halftone: {
    subtle: 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)',
    spacing: '5px',
    opacity: 0.3
  },
  icons: {
    small_talk: '/assets/icons/small_talk.svg',
    creative: '/assets/icons/creative.svg',
    // ... 11 total
  }
}
```

---

### 4. PenaltyCalibrationState

Represents the state of the penalty calibration stage.

**Attributes**:
- `penaltyText`: string - The selected penalty description
- `practiceAttempts`: number - Current attempt count (0-3)
- `maxAttempts`: number - Maximum attempts required (always 3)
- `isComplete`: boolean - Whether all 3 attempts are done
- `lastAttemptTimestamp`: number | null - Timestamp of last practice

**Relationships**:
- Associated with current GameStage (PenaltyCalibration)
- Uses selected penalty from game seed
- Blocks progression to Interview stage until complete

**Validation Rules**:
- Practice attempts must be between 0 and maxAttempts
- Cannot complete with fewer than maxAttempts
- Timer must NOT start during this stage
- Must be completed before advancing to Interview

**State Transitions**:
```
practiceAttempts: 0 → 1 → 2 → 3
isComplete: false → true (when practiceAttempts reaches 3)
```

**Example**:
```typescript
{
  penaltyText: 'You must apologize at least once per answer',
  practiceAttempts: 2,
  maxAttempts: 3,
  isComplete: false,
  lastAttemptTimestamp: 1708623456789
}
```

---

## Type Definitions

### AssetType
```typescript
type AssetType = 'font' | 'icon' | 'pattern' | 'image' | 'audio';
```

### AssetMetadata
```typescript
interface AssetMetadata {
  size?: string;           // e.g., "24x24", "150KB"
  source?: string;         // Attribution source
  license?: string;        // CC BY-NC-SA 4.0
  color?: string;          // Hex color if applicable
}
```

### StageStatus
```typescript
type StageStatus = 'pending' | 'in_progress' | 'completed';
```

### ColorPalette
```typescript
interface ColorPalette {
  primary: string;         // #6f6b6b
  primaryHover: string;    // #646060
  background: string;      // #ffffff
  backgroundAlt: string;   // #f5f5f5
  text: string;            // #000000
  textMuted: string;       // #666666
}
```

### TypographyConfig
```typescript
interface TypographyConfig {
  fontFamily: string;
  baseFontSize: string;
  lineHeight: number;
  fontWeights: {
    normal: number;
    bold: number;
  };
}
```

### HalftoneConfig
```typescript
interface HalftoneConfig {
  subtle: string;          // CSS radial-gradient value
  medium: string;
  dense: string;
  spacing: string;         // e.g., "5px"
  opacity: number;         // 0.1 - 0.3 range
}
```

### IconMapping
```typescript
interface IconMapping {
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
```

---

## Relationships Diagram

```
VisualTheme
├── ColorPalette
├── TypographyConfig
├── HalftoneConfig
├── IconMapping → DesignAsset[]
└── AnimationPreferences

GameStage
├── PenaltyCalibrationState (if stage is PenaltyCalibration)
├── requiredActions[]
└── [next GameStage]

DesignAsset
└── AssetMetadata
```

---

## Data Storage

**Visual Assets**:
- Stored in `/public/assets/` directory structure
- Referenced via static paths (offline-capable)
- No runtime fetching required

**Theme Configuration**:
- Defined in `/src/styles/tokens.css` as CSS custom properties
- Type definitions in `/src/types/theme.ts`
- No external storage needed

**Game Stage State**:
- Managed by Zustand store (`gameStore`)
- Extends existing game state management
- Persists only during active session (no localStorage)

**Penalty Calibration State**:
- Part of Zustand game store
- Reset on new game initialization
- No persistence required

---

## Migration Notes

**No database migrations required** - This feature uses:
- Static file assets (already supported)
- CSS custom properties (already supported)
- Zustand state management (already implemented)

**Compatibility**:
- All new data structures extend existing game state schema
- No breaking changes to current MVP implementation
- Design tokens augment existing tokens.css

**Performance Considerations**:
- Assets preloaded in HTML (<link rel="preload">)
- SVG icons inlined or cached by browser
- CSS patterns have zero HTTP overhead
- Total asset bundle estimated <2MB

---

## Attribution Requirements

All extracted assets must include attribution per CC BY-NC-SA 4.0:

```typescript
interface Attribution {
  creators: string[];       // ['Tommy Maranges', 'Cory O'Brien']
  illustrator: string;      // 'Mac Schubert'
  license: string;          // 'CC BY-NC-SA 4.0'
  source: string;           // 'https://robots.management/'
  adaptedBy: string;        // 'Inhuman Conditions Web App'
}
```

**Display Location**: Footer of application (per constitution requirements)

---

## Summary

This data model focuses on:
1. **Visual asset management** - Self-hosted fonts, icons, patterns
2. **Game flow enhancement** - Explicit stage progression with manual controls
3. **Design system configuration** - Bureaucratic aesthetic via CSS tokens
4. **Accessibility compliance** - WCAG AA contrast, reduced motion support

**Key Principle**: All data structures support offline-first, deterministic, and accessible gameplay per project constitution.
