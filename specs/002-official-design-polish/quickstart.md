# Quick Start: Visual Design Integration

## Scenario 1: Apply Halftone Pattern to Card

```tsx
import { Card } from '@/components/ui/Card';

// Add subtle halftone background texture
<Card title="Penalty" halftone="subtle">
  {penaltyText}
</Card>
```

**Expected**: Card displays with dot pattern background matching official PDF aesthetic

## Scenario 2: Use Design Tokens in Custom Component

```css
/* MyComponent.module.css */
.container {
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
```

**Expected**: Component uses official design system values for consistent visual style

## Scenario 3: Display Module Icon

```tsx
import { ModuleIcon } from '@/components/ui/ModuleIcon';

<ModuleIcon packet={selectedPacket} size={32} />
```

**Expected**: Geometric icon matching official PDF displays next to packet name

## Scenario 4: Respect Reduced Motion

```css
.transition {
  transition: opacity 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .transition {
    transition: none;
  }
}
```

**Expected**: Animations disabled when user prefers reduced motion
