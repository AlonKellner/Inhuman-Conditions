# Component Contract: Icon

**Component**: Icon
**Type**: UI Component
**File**: `src/components/ui/Icon.tsx`
**Status**: New Component

## Purpose

Provides a consistent way to render module icons (geometric symbols) extracted from official Inhuman Conditions materials. Supports all 11 question packet icons with proper sizing, accessibility, and fallback behavior.

## Props Interface

```typescript
interface IconProps {
  /**
   * Icon name corresponding to module
   * Maps to SVG file in /public/assets/icons/
   */
  name: ModuleIconName;

  /**
   * Icon size variant
   * Maps to CSS custom properties (--icon-sm, --icon-md, etc.)
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Optional alt text for screen readers
   * If omitted, icon is treated as decorative (aria-hidden="true")
   * @default undefined (decorative)
   */
  alt?: string;

  /**
   * Optional CSS class for additional styling
   */
  className?: string;

  /**
   * Optional ARIA label (alternative to alt text)
   * Use when icon has semantic meaning without adjacent text
   */
  ariaLabel?: string;
}

type ModuleIconName =
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
```

## Behavior Requirements

### Rendering
- Render `<img>` element with `src="/assets/icons/{name}.svg"`
- Apply size from CSS custom property: `--icon-{size}`
- Include `loading="lazy"` for performance optimization
- Set `decoding="async"` for non-blocking rendering

### Accessibility
- **Decorative icons** (no alt/ariaLabel): Set `aria-hidden="true"`, empty `alt=""`
- **Semantic icons** (with alt or ariaLabel): Include descriptive text for screen readers
- **Adjacent text**: If icon appears next to text label, treat as decorative

### Fallback Behavior
- If SVG fails to load: Show text fallback (icon name in parentheses)
- Example: `(Small Talk)` instead of telephone icon
- Maintain layout integrity (reserve icon space)

### Error Handling
- Invalid `name` prop: Log warning, render fallback text
- Missing SVG file: Browser handles gracefully (broken image), component shows fallback

## Visual Design

### Sizing
```css
:root {
  --icon-sm: 16px;  /* Inline with text */
  --icon-md: 24px;  /* Default, card headers */
  --icon-lg: 32px;  /* Prominent display */
  --icon-xl: 48px;  /* Hero sections */
}
```

### Styling Requirements
- SVG files rendered at intrinsic size (scaled by width/height props)
- Maintain aspect ratio (1:1 square for all icons)
- No background color (transparent)
- Icons use monochrome color scheme from official materials

### Layout
- Display as inline-block by default
- Vertical alignment: middle (aligns with adjacent text)
- Optional className for custom positioning

## Accessibility

### WCAG AA Compliance
- **Decorative icons**: Properly hidden from screen readers
- **Semantic icons**: Clear, concise alt text
- **Color independence**: Icons recognizable in high-contrast mode

### ARIA Attributes
```tsx
// Decorative (default)
<img
  src="/assets/icons/small_talk.svg"
  alt=""
  aria-hidden="true"
  width="24"
  height="24"
/>

// Semantic
<img
  src="/assets/icons/small_talk.svg"
  alt="Small Talk module icon"
  width="24"
  height="24"
  role="img"
/>

// With ARIA label
<img
  src="/assets/icons/creative.svg"
  aria-label="Creative Problem Solving"
  width="24"
  height="24"
  role="img"
/>
```

## State Management

**No local state required** - Pure presentational component

## Testing Requirements

### Unit Tests
1. **Rendering**:
   - Renders `<img>` with correct src path
   - Applies correct size from CSS custom property
   - Shows all 11 module icons correctly

2. **Accessibility**:
   - Decorative icons have `aria-hidden="true"` and empty `alt`
   - Semantic icons have proper alt text or aria-label
   - Role="img" present when alt/ariaLabel provided

3. **Props**:
   - Default size is 'md'
   - Custom className applied correctly
   - Invalid name logs warning

4. **Edge Cases**:
   - Missing SVG file shows fallback text
   - Invalid size defaults to 'md'
   - Handles undefined props gracefully

## Example Usage

```tsx
import { Icon } from '@/components/ui/Icon';

// Decorative (next to text label)
<div>
  <Icon name="small_talk" size="md" />
  <span>Small Talk</span>
</div>

// Semantic (standalone)
<Icon
  name="creative"
  size="lg"
  alt="Creative Problem Solving module"
/>

// With ARIA label
<Icon
  name="grief"
  size="xl"
  ariaLabel="Grief packet selected"
/>

// Custom styling
<Icon
  name="threat_assessment"
  size="sm"
  className="module-icon--highlight"
/>
```

## Implementation Details

```tsx
import React from 'react';
import styles from './Icon.module.css';

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  alt,
  ariaLabel,
  className,
}) => {
  const sizeClass = styles[`icon--${size}`];
  const isDecorative = !alt && !ariaLabel;

  return (
    <img
      src={`/assets/icons/${name}.svg`}
      alt={isDecorative ? '' : alt}
      aria-label={ariaLabel}
      aria-hidden={isDecorative ? 'true' : undefined}
      role={isDecorative ? undefined : 'img'}
      className={`${styles.icon} ${sizeClass} ${className || ''}`}
      loading="lazy"
      decoding="async"
    />
  );
};
```

## CSS Module (Icon.module.css)

```css
.icon {
  display: inline-block;
  vertical-align: middle;
  object-fit: contain;
}

.icon--sm {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.icon--md {
  width: var(--icon-md);
  height: var(--icon-md);
}

.icon--lg {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.icon--xl {
  width: var(--icon-xl);
  height: var(--icon-xl);
}

/* Fallback for missing images */
.icon[alt]:after {
  content: "(" attr(alt) ")";
  font-size: 12px;
  color: var(--color-text-muted);
}
```

## Dependencies

- **Assets**: 11 SVG files in `/public/assets/icons/`
- **Styles**: tokens.css (icon size variables), Icon.module.css
- **Types**: ModuleIconName type definition

## Asset Acquisition

**SVG icons downloaded from robots.management**:
```bash
# Download all 11 module icons
curl https://robots.management/images/icons/small_talk.svg -o public/assets/icons/small_talk.svg
curl https://robots.management/images/icons/creative.svg -o public/assets/icons/creative.svg
curl https://robots.management/images/icons/imagination.svg -o public/assets/icons/imagination.svg
curl https://robots.management/images/icons/cooperation.svg -o public/assets/icons/cooperation.svg
curl https://robots.management/images/icons/hopes_dreams.svg -o public/assets/icons/hopes_dreams.svg
curl https://robots.management/images/icons/body_integration.svg -o public/assets/icons/body_integration.svg
curl https://robots.management/images/icons/grief.svg -o public/assets/icons/grief.svg
curl https://robots.management/images/icons/threat_assessment.svg -o public/assets/icons/threat_assessment.svg
curl https://robots.management/images/icons/moral_failings.svg -o public/assets/icons/moral_failings.svg
curl https://robots.management/images/icons/self_image.svg -o public/assets/icons/self_image.svg
curl https://robots.management/images/icons/recognizing_intentions.svg -o public/assets/icons/recognizing_intentions.svg
```

**License Compliance**:
- Icons extracted from CC BY-NC-SA 4.0 licensed materials
- Attribution included in footer (per constitution requirements)
- No modifications to icon designs (preserve authenticity)

## Related Components

- **PacketDisplay**: Shows icon next to selected packet name
- **QuestionCard**: May display icon in header
- **PacketSelector**: Lists all packets with their icons

## Success Criteria

- ✅ All 11 module icons render correctly
- ✅ Sizing variants (sm, md, lg, xl) work as expected
- ✅ Decorative icons properly hidden from screen readers
- ✅ Semantic icons have descriptive alt text
- ✅ Fallback behavior works if SVG fails to load
- ✅ Lazy loading improves performance
- ✅ Icons maintain aspect ratio at all sizes
- ✅ High-contrast mode displays icons clearly
