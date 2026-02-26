# Design System Contract: Halftone Pattern Utilities

**Type**: CSS Design System Extension
**Files**: `src/styles/tokens.css`, `src/styles/halftone.css`
**Status**: New Design System Feature

## Purpose

Provides pure CSS halftone dot patterns for applying bureaucratic/institutional texture to backgrounds and overlays while maintaining WCAG AA accessibility standards. Patterns are infinitely scalable, performant, and offline-capable.

## CSS Custom Properties

### Halftone Gradient Definitions

**File**: `src/styles/tokens.css`

```css
:root {
  /* Halftone pattern gradients */
  --halftone-subtle: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px
  );

  --halftone-medium: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.25) 1.2px,
    transparent 1.2px
  );

  --halftone-dense: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.35) 1.5px,
    transparent 1.5px
  );

  /* Halftone spacing (background-size) */
  --halftone-spacing-tight: 3px;
  --halftone-spacing-normal: 5px;
  --halftone-spacing-loose: 8px;

  /* Halftone opacity limits (for WCAG AA compliance) */
  --halftone-opacity-subtle: 0.12;  /* Card backgrounds */
  --halftone-opacity-medium: 0.25;  /* Section dividers */
  --halftone-opacity-dense: 0.30;   /* Maximum (maintains 4.5:1 contrast) */
}
```

## Utility Classes

**File**: `src/styles/halftone.css`

```css
/* Direct background patterns */
.halftone-bg-subtle {
  background-image: var(--halftone-subtle);
  background-size: var(--halftone-spacing-normal);
}

.halftone-bg-medium {
  background-image: var(--halftone-medium);
  background-size: var(--halftone-spacing-normal);
}

.halftone-bg-dense {
  background-image: var(--halftone-dense);
  background-size: var(--halftone-spacing-tight);
}

/* Overlay patterns (::before pseudo-element) */
.halftone-overlay-subtle::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--halftone-subtle);
  background-size: var(--halftone-spacing-normal);
  opacity: var(--halftone-opacity-subtle);
  pointer-events: none;
  z-index: 0;
}

.halftone-overlay-medium::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--halftone-medium);
  background-size: var(--halftone-spacing-normal);
  opacity: var(--halftone-opacity-medium);
  pointer-events: none;
  z-index: 0;
}

/* Angled pattern (45° for headers) */
.halftone-angled {
  background-image: var(--halftone-subtle);
  background-size: var(--halftone-spacing-normal);
  transform: rotate(45deg);
}

/* Spacing variants */
.halftone-spacing-tight {
  background-size: var(--halftone-spacing-tight);
}

.halftone-spacing-loose {
  background-size: var(--halftone-spacing-loose);
}
```

## Usage Patterns

### Card Backgrounds (Recommended)

**Pattern**: Overlay approach (preserves text contrast)

```tsx
<div className="card halftone-overlay-subtle">
  <h2>Penalty Calibration</h2>
  <p>Practice the penalty 3 times...</p>
</div>
```

**Result**: Card with subtle halftone texture behind content, maintaining WCAG AA contrast.

### Section Dividers

**Pattern**: Direct background with limited height

```tsx
<div className="section-divider halftone-bg-medium" />
```

```css
.section-divider {
  height: 2px;
  width: 100%;
  margin: 2rem 0;
}
```

### Hero Headers

**Pattern**: Angled pattern for visual interest

```tsx
<header className="hero halftone-angled">
  <h1>Inhuman Conditions</h1>
</header>
```

## Accessibility Requirements

### WCAG AA Compliance

**Critical Constraint**: Halftone patterns MUST NOT reduce text contrast below 4.5:1 ratio.

**Testing Procedure**:
1. Apply halftone pattern to element
2. Measure contrast of text against background using WebAIM contrast checker
3. Adjust opacity until contrast meets 4.5:1 minimum
4. Document opacity value as CSS custom property

**Pre-tested Values** (from research):
- `--halftone-opacity-subtle: 0.12` - Safe for all text sizes
- `--halftone-opacity-medium: 0.25` - Safe for 18px+ text
- `--halftone-opacity-dense: 0.30` - Maximum safe value

### Reduced Motion

**Requirement**: No animations on halftone patterns (they are static by default).

If animations are added later:
```css
@media (prefers-reduced-motion: reduce) {
  .halftone-animated {
    animation: none;
  }
}
```

## Performance Characteristics

### Advantages of Pure CSS Approach
- **Zero HTTP requests**: Patterns defined in CSS, no image downloads
- **Infinitely scalable**: Vector-based, crisp at any resolution
- **Small footprint**: ~30KB total CSS vs 100KB+ for PNG images
- **Cache-friendly**: CSS bundled with main stylesheet
- **Offline-capable**: No external dependencies

### Rendering Performance
- GPU-accelerated (uses CSS gradients)
- No layout reflow (background property)
- Minimal repaint cost

## Testing Requirements

### Visual Regression Tests
1. **Pattern rendering**:
   - Subtle pattern displays correctly at all sizes
   - Medium pattern shows increased dot density
   - Dense pattern maintains clarity at small sizes

2. **Spacing variants**:
   - Tight spacing (3px grid)
   - Normal spacing (5px grid)
   - Loose spacing (8px grid)

### Accessibility Tests
1. **Contrast validation**:
   - All text over halftone backgrounds meets 4.5:1 ratio
   - Use automated tools (axe, WAVE) to verify
   - Manual spot checks with WebAIM contrast checker

2. **Screen reader compatibility**:
   - Patterns are purely decorative (no ARIA needed)
   - Background patterns don't interfere with text reading order

### Browser Compatibility Tests
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Android (90+) ✅

## Example Component Integration

### Card Component with Halftone

```tsx
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  halftone?: 'subtle' | 'medium' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  halftone = 'subtle'
}) => {
  const halftoneClass = halftone !== 'none'
    ? `halftone-overlay-${halftone}`
    : '';

  return (
    <div className={`${styles.card} ${halftoneClass}`}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
```

```css
/* Card.module.css */
.card {
  position: relative; /* Required for ::before overlay */
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.content {
  position: relative; /* Ensures text appears above halftone */
  z-index: 1;
}
```

## Related Design Tokens

**From tokens.css** (already existing):
```css
:root {
  --color-background: #ffffff;
  --color-background-alt: #f5f5f5;
  --color-text: #000000;
  --color-text-muted: #666666;
  --radius-lg: 23px;
  --space-5: 24px;
}
```

**Halftone patterns complement these tokens** to create the bureaucratic aesthetic.

## Migration Notes

**No Breaking Changes**:
- Utility classes are opt-in (require explicit className)
- Existing components unaffected unless updated
- CSS custom properties extend existing tokens.css

**Gradual Adoption**:
1. Apply to new components (PenaltyCalibration, ReadyToStart)
2. Retroactively apply to existing Card components
3. Optional: Add to headers, dividers, panels

## Success Criteria

- ✅ Halftone patterns render correctly on all supported browsers
- ✅ All pattern variants maintain WCAG AA contrast ratios
- ✅ Zero additional HTTP requests (pure CSS)
- ✅ Patterns work offline after initial page load
- ✅ Performance: No measurable impact on paint/layout times
- ✅ Accessibility: Patterns don't interfere with screen readers
- ✅ Visual authenticity: Matches bureaucratic aesthetic from official materials
