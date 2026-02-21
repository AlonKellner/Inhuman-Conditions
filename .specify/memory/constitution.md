# Inhuman Conditions Web App Constitution

## Core Principles

### I. Legal Compliance (NON-NEGOTIABLE)
All code licensed under **CC BY-NC-SA 4.0**. Attribution required to original designers (Tommy Maranges, Cory O'Brien). Art by Mac Schubert. Link to GitHub for issues. **No commercial use**. **No app store submissions without approval**.

### II. Determinism (NON-NEGOTIABLE)
All random behavior MUST be seeded. Same seed MUST produce identical game content. State transitions MUST be reproducible. No network randomness or time-based entropy.

### III. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → Tests fail → Then implement. All game logic MUST have unit tests. Core components MUST have integration tests. Minimum 80% coverage for components, **100% coverage for game logic**. All tests MUST pass before deployment.

### IV. Accessibility (NON-NEGOTIABLE)
WCAG 2.1 Level AA compliance. Keyboard navigation support. Screen reader compatibility. Minimum contrast ratios (4.5:1 for normal text, 3:1 for large). ARIA labels for interactive elements.

### V. No Network Dependencies (NON-NEGOTIABLE)
Zero server communication. Zero analytics tracking. Zero third-party API calls. **Fully offline-capable after initial load**.

### VI. Frequent Commits and Pushes (NON-NEGOTIABLE)
**Commit often** (at least every significant change). **Push to remote regularly** (every 30 minutes or after completing a feature). Commit message format: `<type>: <description>`. Co-authored-by: `Claude Sonnet 4.5 <noreply@anthropic.com>`.

## Architecture & Technology

### TypeScript Strict Mode
- TypeScript strict mode required
- No `any` types except in test mocks
- Explicit return types for public APIs
- Proper type definitions for all data structures

### Component Architecture
- Functional components with hooks (no class components)
- Single responsibility principle
- Props interface for every component
- Controlled components for forms

### Styling
- CSS Modules for styling (no runtime CSS-in-JS)
- Design tokens in `:root` variables
- Mobile-first responsive design
- Match robots.management aesthetic (bureaucratic, monochrome, halftone)

### State Management
- Zustand for global state
- Local state with useState for component-specific state
- Deterministic state updates
- No side effects in reducers/setters

### Testing Philosophy
- Test-Driven Development (TDD)
- Write tests BEFORE implementation
- Test behavior, not implementation details
- Integration tests for critical flows

## Browser Support & Performance

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Android)
- No IE11 support required

### Performance Targets
- Initial load < 3s on 3G
- Time to Interactive < 5s
- Lighthouse score > 90
- Bundle size < 500KB (gzipped)

## Prohibited Practices

❌ **Never:**
- Use `any` type in production code
- Skip writing tests
- Commit broken code
- Use inline styles
- Create network requests
- Add analytics or tracking
- Submit to app stores
- Monetize the application
- Use non-deterministic randomness
- Ignore accessibility
- Skip commit messages

## Quality Gates

### Before Commit
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code follows style guide

### Before Push
- [ ] All tests pass
- [ ] Coverage meets minimums
- [ ] Build succeeds
- [ ] No regressions

### Before Deployment
- [ ] All tests pass
- [ ] Lighthouse score > 90
- [ ] WCAG AA compliance
- [ ] Works on all supported browsers
- [ ] License and attribution present

## Attribution Template

Every HTML page must include in the footer:

```html
<footer>
  <p>
    <strong>Inhuman Conditions</strong> designed by Tommy Maranges and Cory O'Brien.
    Illustrated by Mac Schubert.
  </p>
  <p>
    Licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
      CC BY-NC-SA 4.0
    </a>
  </p>
  <p>
    This is a fan-made web implementation - not affiliated with the original creators.
  </p>
  <p>
    <a href="https://github.com/AlonKellner/Inhuman-Conditions/issues">
      Report issues on GitHub
    </a>
  </p>
</footer>
```

## Governance

This constitution supersedes all other practices. All PRs/reviews must verify compliance. Amendments require documentation and approval. Complexity must be justified.

**Version**: 1.0.0 | **Ratified**: 2026-02-21 | **Last Amended**: 2026-02-21
