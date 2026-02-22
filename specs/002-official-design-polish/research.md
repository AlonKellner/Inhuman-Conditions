# Research: Official Design Polish and Authentic Game Flow

**Feature**: 002-official-design-polish
**Date**: 2026-02-22
**Status**: Complete

## Summary

All research for this feature was completed during earlier implementation phases. Design assets have been extracted, color palette documented, typography identified, and game flow verified against official rules.

## Key Research Findings

### 1. Official Assets Extraction (COMPLETED)

**Source**: 26 official PDFs from robots.management
**Location**: `/tmp/ic-pdfs/` (270+ images extracted)

**Assets Acquired**:
- Print & Play PDF (27.4 MB) - Complete card layouts
- Module PDFs (22 files) - 11 pairs of Investigator prompts + Suspect catalyzers  
- Penalties PDF (17.2 MB) - Visual card layouts
- Backgrounds PDF (5.9 MB) - Character card layouts

**Extracted Design Elements**:
- Halftone dot patterns (background textures)
- Module icons (11 geometric symbols)
- Typography hierarchy (headers, body text, card layouts)
- Color palette (monochrome scheme)
- Layout measurements (padding, spacing, borders)

### 2. Color Palette (COMPLETED)

**Source**: robots.management website + PDFs

```css
--color-primary: #6f6b6b;      /* Primary gray */
--color-primary-hover: #646060; /* Hover state */
--color-background: #ffffff;    /* White backgrounds */
--color-text: #000000;          /* Black text */
--color-border: #6f6b6b;        /* Border color */
```

**Contrast Verification**:
- Text (black on white): 21:1 ✅ WCAG AAA
- Borders (gray on white): 3.3:1 ✅ WCAG AA (non-text)

### 3. Typography (COMPLETED)

**Source**: robots.management timer app analysis

```css
--font-family: Arial, sans-serif;
--font-size-base: 18px;
--font-size-large: 24px;
--font-weight-normal: 400;
--font-weight-bold: 700;
```

**Decision**: Use system font (Arial) - no web font loading required
**Rationale**: Universal availability, instant loading, matches official design

### 4. Halftone Patterns (IMPLEMENTED)

**Location**: `src/styles/halftone.css`

**Implementation**: Pure CSS via radial-gradient backgrounds

```css
.halftone-overlay-subtle::before {
  background-image: radial-gradient(circle, rgba(0,0,0,0.8) 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.03;
}
```

**Pattern Levels**:
- Subtle: 3% opacity, 4px spacing
- Medium: 6% opacity, 4px spacing
- Strong: 10% opacity, 6px spacing

### 5. Game Flow (VERIFIED)

**Source**: Official rules from robots.management + Print & Play PDF

**Correct Flow**:
1. Penalty Calibration (untimed) - 3 practice attempts
2. Role Assignment (untimed) - Suspect views role, Investigator waits
3. Ready Confirmation (untimed) - Both players confirm ready
4. **Timer Starts** - Manual button click
5. Interview (5 minutes timed)
6. Determination (untimed)

**Critical Fix**: Timer must NOT start until step 4 (after ready confirmation)

### 6. Module Icons

**Source**: Extracted from PDF module headers

**Icons Identified**:
1. Telephone (Small Talk)
2. Scissors (Creative Problem Solving)
3. Unicorn (Imagination)
4. Tandem Bicycle (Cooperation & Collaboration)
5. Sprout (Hopes and Dreams)
6. Heart (Body Integration)
7. Rose (Grief)
8. Snake (Threat Assessment)
9. Devil (Moral Failings)
10. Mirror (Self Image)
11. Water Spout (Recognizing Intentions)

**Implementation Plan**: Convert to inline SVG components for web use

## Technical Decisions

### Design System Architecture

**Decision**: CSS Custom Properties for design tokens
**Location**: `src/styles/tokens.css`
**Rationale**: Native browser feature, no build overhead, dynamic updates possible

### Component Styling

**Decision**: CSS Modules with token usage
**Rationale**: Scoped styles, no global pollution, TypeScript support, performant

### Asset Strategy

**Decision**: Inline SVG icons + CSS patterns (no external images)
**Rationale**: Offline capability, zero network requests, scalable graphics

## Implementation Status

- ✅ Color palette documented and implemented
- ✅ Halftone patterns implemented (`src/styles/halftone.css`)
- ✅ Game flow fixed (Phase 3 complete)
- ✅ GameEngine refactored (Phase 3B complete)
- 🔄 Visual design integration (Phase 4 in progress)
- ⏳ Module icons (Phase 6 pending)
- ⏳ Typography refinement (Phase 5 pending)
- ⏳ Polish and micro-interactions (Phase 7-8 pending)

## Conclusion

No additional research required. All design specifications are documented and ready for implementation.
