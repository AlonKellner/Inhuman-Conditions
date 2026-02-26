# Implementation Plan: Official Design Polish and Authentic Game Flow

**Branch**: `002-official-design-polish` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-official-design-polish/spec.md`

**Note**: This plan covers User Stories 1-5 from the spec. User Story 1 (authentic game flow) was completed in Phase 3 + Phase 3B. Currently implementing User Story 2 (visual design system) in Phase 4.

## Summary

Transform the Inhuman Conditions MVP into an authentic experience by implementing the official visual design system and proper game flow. This involves extracting design assets from official PDFs, applying the bureaucratic/institutional aesthetic with halftone patterns and monochrome colors, integrating official typography, implementing module icons, and adding polished micro-interactions. The game flow has been fixed to match official rules where penalty calibration, role assignment, and ready confirmation all happen BEFORE the interview timer starts.

**Technical Approach**: Extract color palette, typography, and patterns from official PDFs using analysis tools. Implement halftone patterns via CSS pseudo-elements and background images. Create modular design system with CSS custom properties for colors, spacing, and typography. Integrate web fonts from robots.management. Extract module icons as SVG for crisp rendering. Apply bureaucratic aesthetic through careful use of borders, spacing, and monochrome palette while maintaining WCAG AA accessibility.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18.3+
**Primary Dependencies**: Vite 5.x (build tool), Zustand (state), React Router v6 (HashRouter), Vitest (testing), date-fns, seedrandom
**Storage**: localStorage (tutorial state, notes), No backend database
**Testing**: Vitest + React Testing Library, @vitest/coverage-v8
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), iOS Safari 14+, Chrome Android 90+
**Project Type**: Static web application (single-page app for GitHub Pages)
**Performance Goals**: Initial load < 3s on 3G, Time to Interactive < 5s, Lighthouse > 90
**Constraints**: Fully offline-capable, no server/network dependencies, CC BY-NC-SA 4.0 licensed, WCAG 2.1 Level AA compliant
**Scale/Scope**: Single-device and multi-device play modes, 11 question packets, 18 penalties, 30 backgrounds, ~15-20 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Legal Compliance (Principle I)
- All code will remain CC BY-NC-SA 4.0 licensed
- Attribution to Tommy Maranges, Cory O'Brien, Mac Schubert maintained
- Visual assets extracted from official PDFs fall under fair use for non-commercial derivative works
- No app store submission planned
- **Status**: PASS

### ✅ Determinism (Principle II)
- Visual design changes do not affect game logic determinism
- All seeded RNG behavior remains intact in GameEngine
- No network-based randomness introduced
- **Status**: PASS

### ✅ Test-First Development (Principle III)
- Visual regression tests will be written before implementing design changes
- Component tests updated for new props and styling
- Engine tests already at 100% coverage (56/56 passing)
- **Status**: PASS (TDD approach documented in tasks)

### ✅ Accessibility (Principle IV)
- WCAG 2.1 Level AA compliance maintained
- High contrast ratios verified for monochrome palette
- Keyboard navigation preserved
- Screen reader compatibility maintained
- Reduced motion preferences respected in animations
- **Status**: PASS (accessibility requirements in spec)

### ✅ No Network Dependencies (Principle V)
- All assets bundled in static build
- Fonts loaded from local files (no CDN dependencies)
- Halftone patterns generated via CSS or bundled images
- Icons bundled as SVG
- **Status**: PASS

### ✅ Frequent Commits (Principle VI)
- Commit after each completed task
- Push every 30 minutes or after feature completion
- Co-authored-by attribution included
- **Status**: PASS (enforced in workflow)

### ✅ Separation of Game Logic from UI (Principle VII)
- GameEngine refactor completed (Phase 3B)
- All game logic in `src/engine/` as pure TypeScript
- React components are pure views
- Visual changes only affect presentation layer
- **Status**: PASS (already enforced)

**Overall Gate Status**: ✅ PASS - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/002-official-design-polish/
├── spec.md              # Feature specification (user stories)
├── plan.md              # This file (implementation plan)
├── research.md          # Research findings (fonts, assets, patterns)
├── data-model.md        # Visual design system entities
├── quickstart.md        # Visual design integration scenarios
├── contracts/           # Design system API contracts
│   ├── design-tokens.md # CSS custom properties contract
│   └── visual-system.md # Component styling contract
└── tasks.md             # Task breakdown (8 phases, ~100 tasks)
```

### Source Code (repository root)

```text
src/
├── components/          # React components
│   ├── game/           # Game state components
│   │   ├── SeedEntry.tsx
│   │   ├── PenaltyCalibration.tsx
│   │   ├── ReadyToStart.tsx
│   │   ├── Interview/
│   │   └── ...
│   ├── ui/             # Reusable UI components
│   │   ├── Card.tsx    # Updated with halftone prop
│   │   ├── Button.tsx
│   │   └── ...
│   └── tutorial/       # Tutorial flow
│
├── engine/             # Pure game logic (Constitution VII)
│   ├── GameEngine.ts   # Core orchestration (COMPLETE)
│   ├── ContentSelector.ts (COMPLETE)
│   ├── StateValidator.ts (COMPLETE)
│   └── types.ts        (COMPLETE)
│
├── data/               # Game data
│   ├── packets.ts      # 11 question packets
│   ├── penalties.ts    # 18 penalties
│   ├── backgrounds.ts  # 30 backgrounds
│   └── roles.ts        # Role definitions
│
├── lib/                # Utilities
│   ├── GameRNG.ts      # Seeded randomness
│   ├── seedGeneration.ts
│   └── inducerPattern.ts
│
├── store/              # Zustand state
│   └── gameStore.ts    # Delegates to GameEngine (COMPLETE)
│
├── styles/             # Design system
│   ├── tokens.css      # Design tokens (colors, spacing, typography)
│   ├── global.css      # Global styles
│   ├── halftone.css    # Halftone pattern utilities
│   ├── typography.css  # Font loading and hierarchy
│   └── animations.css  # Transitions and micro-interactions
│
├── assets/             # Static assets
│   ├── fonts/          # Web fonts from robots.management
│   ├── icons/          # Module icons (SVG)
│   └── patterns/       # Halftone textures (if needed as images)
│
└── hooks/              # Custom React hooks
    └── useGameEngine.ts # Engine-to-React bridge

tests/
├── engine/             # Pure engine tests (56/56 PASSING - 100% coverage)
│   ├── GameEngine.test.ts
│   ├── ContentSelector.test.ts
│   ├── StateValidator.test.ts
│   └── E2E.game-flow.test.ts
│
├── components/         # Component tests (34/34 PASSING)
│   ├── game/
│   │   ├── PenaltyCalibration.test.tsx
│   │   └── ReadyToStart.test.tsx
│   └── ui/
│
├── bugs/               # Bug regression tests (4/4 PASSING)
│   ├── penalty-calibration-stuck.test.tsx
│   └── penalty-text-missing.test.tsx
│
└── visual/             # Visual regression tests (TO BE ADDED)
    ├── halftone-patterns.test.tsx
    ├── typography-hierarchy.test.tsx
    └── contrast-ratios.test.tsx
```

**Structure Decision**: Single-project web application structure with clear separation between pure game logic (`src/engine/`) and React UI (`src/components/`). GameEngine refactor (Phase 3B) successfully isolated all game rules into testable TypeScript classes. Visual design work (Phase 4+) only touches the presentation layer (`src/styles/`, `src/components/`, `src/assets/`).

## Complexity Tracking

> **No constitution violations requiring justification**

This feature introduces no architectural complexity beyond what's already established in the project. All changes respect the existing separation of concerns (Constitution Principle VII).

## Phase 0: Research (COMPLETED)

Research was completed during earlier implementation phases:

### Research Findings

**Asset Extraction** (completed):
- All 26 official PDFs downloaded and analyzed
- Print & Play PDF (27.4 MB) - Complete game content
- Module PDFs - 11 pairs of Investigator prompts + Suspect catalyzers
- 270+ images extracted from PDFs to `/tmp/ic-pdfs/images/`

**Web Analysis** (completed):
- robots.management website analyzed for design patterns
- Timer app analyzed for typography (Arial font family)
- Color palette extracted: `#6f6b6b` (primary), `#646060` (hover), monochrome scheme
- Button padding: 17px vertical, 77px horizontal
- Border radius: 23px

**Typography** (completed):
- robots.management uses Arial (system font)
- No custom web fonts needed
- Fallback chain: `Arial, sans-serif`

**Halftone Patterns** (documented in `src/styles/halftone.css`):
- Implemented via CSS background-image with radial-gradient
- Three opacity levels: subtle (0.03), medium (0.06), strong (0.1)
- Three spacing levels: tight (3px), normal (4px), loose (6px)
- Applied via utility classes: `.halftone-overlay-subtle`, etc.

**Module Icons** (extracted):
- 11 geometric icons from PDFs
- Telephone (Small Talk), Scissors (Problem Solving), Unicorn (Imagination), etc.
- Need to be converted to SVG for web use

### Research Decisions

No additional research needed - proceeding with implementation based on existing findings.

## Phase 1: Design & Contracts

### Data Model: Visual Design System

#### Entity: DesignToken

Represents a single design variable (color, spacing, typography).

**Fields**:
- `name`: string - Token name (e.g., "color-primary", "space-4")
- `value`: string - CSS value (e.g., "#6f6b6b", "16px")
- `category`: "color" | "spacing" | "typography" | "border-radius"
- `description`: string - Usage guidance

**Validation**:
- CSS value must be valid for category type
- Color values must meet WCAG AA contrast ratios
- Spacing values must use consistent scale

#### Entity: HalftonePattern

Represents a halftone texture configuration.

**Fields**:
- `intensity`: "subtle" | "medium" | "strong"
- `spacing`: "tight" | "normal" | "loose"
- `cssClass`: string - Generated class name (e.g., "halftone-overlay-subtle")

**Validation**:
- Opacity values: subtle <= 0.05, medium <= 0.1, strong <= 0.15
- Spacing values: tight >= 2px, normal >= 3px, loose >= 5px
- Must not reduce contrast below WCAG AA threshold

#### Entity: ModuleIcon

Represents a question packet icon.

**Fields**:
- `packetId`: string - Matches packet ID (e.g., "small-talk")
- `name`: string - Display name (e.g., "Telephone")
- `svgPath`: string - SVG path data
- `viewBox`: string - SVG viewBox attribute
- `fallbackText`: string - Accessibility label

**Validation**:
- SVG must be valid XML
- viewBox must define proper coordinate space
- Path must render recognizable shape

### Contracts: Design System API

#### Contract: CSS Design Tokens

**Location**: `src/styles/tokens.css`

**Exported Tokens**:
```css
:root {
  /* Colors */
  --color-primary: #6f6b6b;
  --color-primary-hover: #646060;
  --color-background: #ffffff;
  --color-text: #000000;
  --color-border: #6f6b6b;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  /* Typography */
  --font-family: Arial, sans-serif;
  --font-size-base: 18px;
  --font-size-large: 24px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 23px;

  /* Button */
  --button-padding-y: 17px;
  --button-padding-x: 77px;
}
```

**Contract Guarantees**:
- All tokens maintain WCAG AA contrast ratios
- Spacing scale follows 4px base unit
- Typography scale is consistent across components

#### Contract: Halftone Utility Classes

**Location**: `src/styles/halftone.css`

**Exported Classes**:
- `.halftone-overlay-subtle` - 3% opacity, normal spacing
- `.halftone-overlay-medium` - 6% opacity, normal spacing
- `.halftone-overlay-strong` - 10% opacity, loose spacing

**Usage**:
```tsx
<Card className="halftone-overlay-subtle">
  Content with subtle halftone background
</Card>
```

**Contract Guarantees**:
- Halftone overlays don't reduce text contrast below 4.5:1
- Patterns are generated via CSS (no image dependencies)
- Overlays use `pointer-events: none` to not interfere with interaction

#### Contract: Component Styling Props

**Card Component**:
```typescript
interface CardProps {
  halftone?: 'subtle' | 'medium' | 'none';
  // ... other props
}
```

**Button Component**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  // ... other props
}
```

### Quickstart: Visual Design Integration

#### Scenario 1: Apply Halftone to Existing Component

```tsx
import { Card } from '@/components/ui/Card';

// Before (no halftone)
<Card title="Penalty">
  {penaltyText}
</Card>

// After (subtle halftone)
<Card title="Penalty" halftone="subtle">
  {penaltyText}
</Card>
```

**Expected Result**: Card displays with subtle dot pattern background texture matching official PDF aesthetic.

#### Scenario 2: Use Design Tokens for Custom Styling

```css
/* MyComponent.module.css */
.container {
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.text {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-text);
}
```

**Expected Result**: Component uses official design system values, maintaining visual consistency.

#### Scenario 3: Display Module Icon

```tsx
import { ModuleIcon } from '@/components/ui/ModuleIcon';

<ModuleIcon
  packet={selectedPacket}
  size={32}
  aria-label={`${selectedPacket.name} module icon`}
/>
```

**Expected Result**: Geometric icon matching official PDF displays next to packet name.

## Implementation Notes

### Current Status (as of 2026-02-22)

**Completed**:
- ✅ Phase 1: Setup (13 tasks) - Asset acquisition
- ✅ Phase 2: Foundational (8 tasks) - Design system extensions
- ✅ Phase 3: User Story 1 - Game Flow Fix (15 tasks)
- ✅ Phase 3B: Game Logic Refactor (13 tasks) - GameEngine architecture
- 🔄 Phase 4: User Story 2 - Visual Design (IN PROGRESS)

**Remaining**:
- Phase 4: User Story 2 - Official Visual Design System (12 tasks)
- Phase 5: User Story 3 - Typography (14 tasks) [OPTIONAL]
- Phase 6: User Story 4 - Icons (11 tasks)
- Phase 7: User Story 5 - Polish (12 tasks)
- Phase 8: Final Polish (17 tasks)

### Critical Path

1. Complete Phase 4 (Visual Design) - foundation for all visual work
2. Phases 5-7 can be done in parallel (independent features)
3. Phase 8 (Final Polish) requires all previous phases complete

### Risk Mitigation

**Risk**: Halftone patterns reduce contrast below accessibility thresholds
**Mitigation**: Test all combinations with contrast checkers, provide `halftone="none"` fallback

**Risk**: Web fonts fail to load or cause layout shifts
**Mitigation**: Use system fonts (Arial) which are universally available, font-display: swap

**Risk**: Module icons not rendering correctly as SVG
**Mitigation**: Provide text fallbacks, test across browsers

## Next Steps

1. Continue Phase 4 implementation (visual design system)
2. Run `/speckit.tasks` to see detailed task breakdown
3. Execute tasks sequentially, committing after each completion
4. Run tests after each phase to verify no regressions
5. Update tasks.md to mark completed work

---

**Plan Version**: 1.0.0
**Generated**: 2026-02-22
**Tool**: `/speckit.plan`
