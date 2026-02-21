# Inhuman Conditions Web App Constitution

## Non-Negotiable Principles

### 1. Legal Compliance
- All code licensed under **CC BY-NC-SA 4.0**
- Attribution to original designers (Tommy Maranges, Cory O'Brien)
- Art by Mac Schubert
- Link to GitHub for issues
- **No commercial use**
- **No app store submissions without approval**

### 2. Determinism
- All random behavior MUST be seeded
- Same seed MUST produce identical game content
- State transitions MUST be reproducible
- No network randomness or time-based entropy

### 3. Test Coverage
- All game logic MUST have unit tests
- Core components MUST have integration tests
- Minimum 80% coverage for components
- **100% coverage for game logic**
- All tests MUST pass before deployment

### 4. Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Minimum contrast ratios (4.5:1 for normal text, 3:1 for large)
- ARIA labels for interactive elements

### 5. No Network Dependencies
- Zero server communication
- Zero analytics tracking
- Zero third-party API calls
- **Fully offline-capable after initial load**

### 6. Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Android)
- No IE11 support required

### 7. Performance
- Initial load < 3s on 3G
- Time to Interactive < 5s
- Lighthouse score > 90
- Bundle size < 500KB (gzipped)

### 8. Version Control
- **Commit and push often**
- Descriptive commit messages
- Feature branches for major changes
- Clean commit history
- Co-authored commits with Claude

## Architectural Principles

### 1. Type Safety
- TypeScript strict mode required
- No `any` types except in test mocks
- Explicit return types for public APIs
- Proper type definitions for all data structures

### 2. Component Architecture
- Functional components with hooks (no class components)
- Single responsibility principle
- Props interface for every component
- Controlled components for forms

### 3. Styling
- CSS Modules for styling (no runtime CSS-in-JS)
- Design tokens in `:root` variables
- Mobile-first responsive design
- Match robots.management aesthetic (bureaucratic, monochrome, halftone)

### 4. Directory Structure
- Feature-based directory structure
- Explicit imports (no barrel files)
- Tests colocated with source files
- Clear separation of concerns (lib/ for utilities, components/ for UI)

### 5. State Management
- Zustand for global state
- Local state with useState for component-specific state
- Deterministic state updates
- No side effects in reducers/setters

### 6. Testing Philosophy
- Test-Driven Development (TDD)
- Write tests BEFORE implementation
- Test behavior, not implementation details
- Integration tests for critical flows

### 7. Code Quality
- ESLint rules enforced
- Consistent formatting
- Descriptive variable names
- Comments only for complex logic
- Self-documenting code preferred

### 8. Git Workflow
- **Frequent commits** (at least every significant change)
- **Push to remote regularly** (every 30 minutes or after completing a feature)
- Commit message format: `<type>: <description>`
  - Types: feat, fix, test, refactor, docs, style, chore
- Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

## Development Workflow

### Spec-Kit Phases

1. **Specification** - Define what to build
2. **Planning** - Design how to build it
3. **Tasks** - Break down into actionable items
4. **Implementation** - Build with tests
5. **Verification** - Test and validate

### Implementation Rules

1. Read existing code before modifying
2. Write tests before implementation
3. Run tests after every change
4. Commit after tests pass
5. Push regularly to remote

### Code Review Criteria

1. Does it match the specification?
2. Are there tests?
3. Do all tests pass?
4. Is it accessible?
5. Is it performant?
6. Does it follow the constitution?

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
    <a href="https://github.com/[username]/inhuman-conditions/issues">
      Report issues on GitHub
    </a>
  </p>
</footer>
```

## Success Criteria

A feature is complete when:
1. ✅ Specification is written
2. ✅ Tests are written and passing
3. ✅ Implementation matches specification
4. ✅ Code follows constitution
5. ✅ Committed and pushed
6. ✅ Documentation updated

---

*This constitution is a living document and may be updated as the project evolves.*
