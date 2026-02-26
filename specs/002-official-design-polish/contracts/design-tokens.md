# Design Tokens Contract

**Version**: 1.0.0
**Location**: `src/styles/tokens.css`
**Type**: CSS Custom Properties (CSS Variables)

## Overview

This contract defines the design token API for the Inhuman Conditions visual design system. All components MUST use these tokens for styling to maintain visual consistency with official game materials.

## Token Categories

### Colors

```css
--color-primary: #6f6b6b;      /* Primary gray for buttons/borders */
--color-primary-hover: #646060; /* Hover state */
--color-background: #ffffff;    /* White backgrounds */
--color-text: #000000;          /* Black text */
--color-border: #6f6b6b;        /* Border color */
```

**Contract Guarantees**:
- All color combinations maintain WCAG AA contrast ratios
- Text colors provide 21:1 contrast against backgrounds (WCAG AAA)
- Border colors provide 3:1 contrast (minimum for non-text)

### Spacing

```css
--space-1: 4px;   /* Tiny gaps */
--space-2: 8px;   /* Small gaps */
--space-3: 12px;  /* Medium gaps */
--space-4: 16px;  /* Standard padding */
--space-5: 24px;  /* Large padding */
--space-6: 32px;  /* Extra large */
```

**Contract Guarantees**:
- Follows 4px base unit scale
- Values increase linearly for predictability

### Typography

```css
--font-family: Arial, sans-serif;
--font-size-base: 18px;
--font-size-large: 24px;
--font-size-small: 14px;
--font-weight-normal: 400;
--font-weight-bold: 700;
--line-height-base: 1.5;
```

**Contract Guarantees**:
- Font family fallback chain always includes `sans-serif`
- Font sizes meet WCAG readable text minimums
- Line height maintains readability (1.4-1.6 range)

### Border Radius

```css
--radius-sm: 4px;   /* Small corners */
--radius-md: 8px;   /* Medium corners */
--radius-lg: 23px;  /* Large corners (buttons) */
```

**Contract Guarantees**:
- Values match official robots.management design (23px for buttons)

### Component-Specific

```css
--button-padding-y: 17px;
--button-padding-x: 77px;
```

**Contract Guarantees**:
- Values extracted from official robots.management button styling

## Usage Examples

### In CSS Modules

```css
/* MyComponent.module.css */
.container {
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.title {
  font-family: var(--font-family);
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}
```

### In Component Styles

```tsx
// Dynamic styling (avoid when possible, prefer CSS Modules)
<div style={{ 
  padding: 'var(--space-4)',
  color: 'var(--color-text)' 
}}>
  Content
</div>
```

## Breaking Changes

Any changes to token names or removal of tokens is a BREAKING CHANGE and requires:
1. Update all components using the token
2. Update this contract documentation
3. Version bump (major version change)

## Accessibility Compliance

All token combinations MUST maintain WCAG 2.1 Level AA compliance:
- Normal text: 4.5:1 minimum contrast
- Large text (18pt+): 3:1 minimum contrast
- Non-text elements: 3:1 minimum contrast

## Testing

Automated tests verify:
- All tokens are defined in `src/styles/tokens.css`
- Contrast ratios meet WCAG AA minimums
- No hardcoded colors exist in components (all use tokens)
