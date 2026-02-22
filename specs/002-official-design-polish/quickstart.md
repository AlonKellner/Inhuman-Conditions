# Quickstart Guide: Official Design Polish Implementation

**Feature**: 002-official-design-polish
**Created**: 2026-02-22
**For**: Developers implementing visual assets and game flow fixes

## Overview

This guide helps you set up the visual assets (fonts, icons, patterns) and implement the corrected game flow for the Official Design Polish feature. Follow these steps to ensure your development environment has all necessary resources.

## Prerequisites

- Node.js 18+ and npm installed
- Git repository cloned: `Inhuman-Conditions`
- MVP implementation complete (Phase 1-3 from main branch)
- Read access to [research.md](./research.md) for design decisions
- Familiarity with React, TypeScript, CSS Modules

## Quick Setup (5 minutes)

### 1. Download Visual Assets

**Create asset directories**:
```bash
cd /path/to/Inhuman-Conditions
mkdir -p public/assets/icons
mkdir -p public/fonts
```

**Download 11 module icons from robots.management**:
```bash
# Small Talk (Telephone) - Intro
curl -o public/assets/icons/small_talk.svg \
  https://robots.management/images/icons/small_talk.svg

# Creative Problem Solving (Scissors) - Easy
curl -o public/assets/icons/creative.svg \
  https://robots.management/images/icons/creative.svg

# Imagination (Unicorn) - Easy
curl -o public/assets/icons/imagination.svg \
  https://robots.management/images/icons/imagination.svg

# Cooperation & Collaboration (Tandem Bicycle) - Easy
curl -o public/assets/icons/cooperation.svg \
  https://robots.management/images/icons/cooperation.svg

# Hopes and Dreams (Sprout) - Intermediate
curl -o public/assets/icons/hopes_dreams.svg \
  https://robots.management/images/icons/hopes_dreams.svg

# Body Integration (Heart) - Intermediate
curl -o public/assets/icons/body_integration.svg \
  https://robots.management/images/icons/body_integration.svg

# Grief (Rose) - Intermediate
curl -o public/assets/icons/grief.svg \
  https://robots.management/images/icons/grief.svg

# Threat Assessment (Snake) - Intermediate
curl -o public/assets/icons/threat_assessment.svg \
  https://robots.management/images/icons/threat_assessment.svg

# Moral Failings (Devil) - Intermediate
curl -o public/assets/icons/moral_failings.svg \
  https://robots.management/images/icons/moral_failings.svg

# Self Image (Mirror) - Intermediate
curl -o public/assets/icons/self_image.svg \
  https://robots.management/images/icons/self_image.svg

# Recognizing Intentions (Water Spout) - Hard
curl -o public/assets/icons/recognizing_intentions.svg \
  https://robots.management/images/icons/recognizing_intentions.svg
```

**Verify downloads**:
```bash
ls -lh public/assets/icons/
# Should show 11 .svg files
```

### 2. Set Up Design Tokens

**Extend existing tokens.css** with halftone patterns:

```bash
# Open src/styles/tokens.css and add these variables
```

```css
/* src/styles/tokens.css */
:root {
  /* Existing tokens (already present) */
  --color-primary: #6f6b6b;
  --color-primary-hover: #646060;
  --font-family: Arial, sans-serif;
  --font-size-base: 18px;
  --button-padding-y: 17px;
  --button-padding-x: 77px;
  --radius-lg: 23px;

  /* NEW: Halftone pattern gradients */
  --halftone-subtle: radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px);
  --halftone-medium: radial-gradient(circle, rgba(0,0,0,0.25) 1.2px, transparent 1.2px);
  --halftone-dense: radial-gradient(circle, rgba(0,0,0,0.35) 1.5px, transparent 1.5px);

  /* NEW: Halftone spacing */
  --halftone-spacing-tight: 3px;
  --halftone-spacing-normal: 5px;
  --halftone-spacing-loose: 8px;

  /* NEW: Halftone opacity (WCAG AA compliant) */
  --halftone-opacity-subtle: 0.12;
  --halftone-opacity-medium: 0.25;
  --halftone-opacity-dense: 0.30;

  /* NEW: Icon sizes */
  --icon-sm: 16px;
  --icon-md: 24px;
  --icon-lg: 32px;
  --icon-xl: 48px;
}
```

**Create halftone utility classes**:

```bash
touch src/styles/halftone.css
```

```css
/* src/styles/halftone.css */

/* Direct background patterns */
.halftone-bg-subtle {
  background-image: var(--halftone-subtle);
  background-size: var(--halftone-spacing-normal);
}

.halftone-bg-medium {
  background-image: var(--halftone-medium);
  background-size: var(--halftone-spacing-normal);
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
```

**Import in main.tsx**:
```tsx
// src/main.tsx
import './styles/tokens.css';
import './styles/global.css';
import './styles/halftone.css'; // Add this line
```

### 3. Verify Existing Design Token Alignment

**Good news**: Your existing `src/styles/tokens.css` already matches robots.management! 🎉

Verify these values are present (they should be from MVP):
```css
--color-primary: #6f6b6b;        ✅ Matches
--color-primary-hover: #646060;  ✅ Matches
--font-family: Arial, sans-serif; ✅ Matches
--font-size-base: 18px;          ✅ Matches
--button-padding-y: 17px;        ✅ Matches
--button-padding-x: 77px;        ✅ Matches
--radius-lg: 23px;               ✅ Matches
```

If any are different, update them to match the official design.

## Development Workflow

### Running the Application

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Testing Halftone Patterns

**Create a test page** to preview patterns:

```tsx
// src/pages/HalftoneTest.tsx (temporary)
export function HalftoneTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Halftone Pattern Test</h1>

      <div className="halftone-overlay-subtle" style={{
        position: 'relative',
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h2>Subtle Overlay (0.12 opacity)</h2>
        <p>This text should maintain WCAG AA contrast (4.5:1 minimum)</p>
      </div>

      <div className="halftone-overlay-medium" style={{
        position: 'relative',
        background: 'white',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h2>Medium Overlay (0.25 opacity)</h2>
        <p>Slightly more visible pattern, still accessible</p>
      </div>
    </div>
  );
}
```

**Verify contrast** using browser DevTools:
1. Inspect text element
2. Open "Accessibility" panel
3. Check contrast ratio (should be ≥4.5:1)

### Testing Icons

**Create icon test page**:

```tsx
// src/pages/IconTest.tsx (temporary)
import { Icon } from '@/components/ui/Icon';

export function IconTest() {
  const icons: ModuleIconName[] = [
    'small_talk', 'creative', 'imagination', 'cooperation',
    'hopes_dreams', 'body_integration', 'grief',
    'threat_assessment', 'moral_failings', 'self_image',
    'recognizing_intentions'
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Module Icon Test</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
        {icons.map(name => (
          <div key={name} style={{ textAlign: 'center' }}>
            <Icon name={name} size="xl" alt={name} />
            <p>{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Component Implementation Order

Follow this sequence to implement the feature (from [tasks.md](./tasks.md)):

### Phase 0: Critical Game Flow Fix (Highest Priority)

1. **Update GameStateMachine.tsx**:
   - Remove `startTimer()` from ReadyToStart auto-advance
   - Add manual button trigger for timer initialization

2. **Create PenaltyCalibration component**:
   - 3-attempt counter
   - Manual "Continue" button
   - No timer during this stage

3. **Create ReadyToStart component**:
   - Manual "Start Interview" button
   - Timer initialized ONLY on button click

### Phase 1: Visual Foundation

1. **Download assets** (done above ✅)
2. **Add halftone CSS** (done above ✅)
3. **Create Icon component**
4. **Apply halftone to Card components**

### Phase 2: Typography (Optional)

1. Source OFL-licensed fonts (if custom fonts needed)
2. Convert to WOFF2 format
3. Add @font-face declarations
4. Preload in index.html

## Testing Your Implementation

### Manual Testing Checklist

**Game Flow Fix**:
- [ ] Timer does NOT start when entering ReadyToStart state
- [ ] Penalty calibration shows 3-attempt counter
- [ ] "Continue" button disabled until 3 attempts complete
- [ ] "Start Interview" button initializes timer
- [ ] Timer starts at 300 seconds (5 minutes)

**Visual Design**:
- [ ] All 11 module icons display correctly
- [ ] Halftone patterns visible on card backgrounds
- [ ] Text contrast meets WCAG AA (4.5:1 ratio)
- [ ] Design matches bureaucratic aesthetic

**Accessibility**:
- [ ] Keyboard navigation works (Tab through buttons)
- [ ] Screen reader announces stage changes
- [ ] Focus indicators visible on all interactive elements
- [ ] Contrast checker passes WCAG AA

### Automated Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Ensure coverage meets constitution requirements:
# - 80%+ for components
# - 100% for game logic
```

### Contrast Verification

**Use WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/

**Test these combinations**:
1. Black text (#000000) on white background (#ffffff) with halftone-overlay-subtle
2. Dark gray text (#333333) on light gray background (#f5f5f5) with halftone-overlay-medium
3. Primary color (#6f6b6b) on white background

**Expected results**: All should meet 4.5:1 minimum ratio.

## Common Issues & Solutions

### Issue: Icons not loading

**Symptoms**: Broken image icons or 404 errors

**Solutions**:
1. Verify files exist in `public/assets/icons/`
2. Check file names match exactly (lowercase, underscores)
3. Ensure Vite dev server is running (`npm run dev`)
4. Check browser console for 404 errors

### Issue: Halftone patterns not visible

**Symptoms**: Plain white backgrounds, no texture

**Solutions**:
1. Verify `halftone.css` imported in `main.tsx`
2. Check that parent element has `position: relative`
3. Ensure content has `position: relative; z-index: 1`
4. Inspect element in DevTools, check for `::before` pseudo-element

### Issue: Timer starts too early

**Symptoms**: Countdown begins before clicking "Start Interview"

**Solution**:
1. Check `GameStateMachine.tsx` - remove `startTimer()` from auto-advance
2. Ensure `ReadyToStart` component has `onStartInterview` callback
3. Verify callback calls `startTimer()` AND `advanceState()`

### Issue: Contrast too low with halftone

**Symptoms**: Text difficult to read, WCAG checker fails

**Solution**:
1. Reduce halftone opacity to 0.12 or lower
2. Use lighter variant (`--halftone-subtle` instead of `--halftone-dense`)
3. Increase text color darkness (#000000 instead of #666666)

## Additional Resources

### Design Decisions
- [research.md](./research.md) - Complete research findings and rationale
- [data-model.md](./data-model.md) - Data structure definitions
- [contracts/](./contracts/) - Component interface specifications

### Official References
- **robots.management**: https://robots.management/ (official game site)
- **Timer app**: https://robots.management/timer/ (reference implementation)
- **CC BY-NC-SA 4.0**: https://creativecommons.org/licenses/by-nc-sa/4.0/ (license)

### Web Standards
- **WCAG 2.1 Level AA**: https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aa
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **MDN CSS Gradients**: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient

## Next Steps

After completing quickstart setup:

1. **Read the contracts**: Review component contracts in `contracts/` directory
2. **Follow TDD approach**: Write tests BEFORE implementing components (per constitution)
3. **Implement in phases**: Follow task order from [tasks.md](./tasks.md)
4. **Commit frequently**: Follow constitution requirement (commit every significant change)
5. **Test accessibility**: Use keyboard navigation and screen readers throughout development

## Getting Help

**Questions about design decisions?**
- Read [research.md](./research.md) for detailed rationale

**Questions about component interfaces?**
- Check [contracts/](./contracts/) for complete specifications

**Questions about game flow?**
- Review official rules: https://robots.management/
- See Decision 3 in [research.md](./research.md#decision-3-game-flow-stages---critical-fix-required)

**Technical issues?**
- Check [Common Issues & Solutions](#common-issues--solutions) above
- Review constitution: `.specify/memory/constitution.md`

---

**Happy coding!** Remember: TDD first, commit often, and maintain WCAG AA compliance. 🎨🤖
