# Research & Technology Decisions

**Feature**: Seed-Synced Inhuman Conditions Web Game
**Date**: 2026-02-22
**Status**: Complete

This document captures all technology decisions, research findings, and architectural rationale for the implementation.

## Technology Stack Decisions

### 1. Build Tool: Vite vs Create React App

**Decision**: Vite 5.x

**Rationale**:
- **Faster Development**: Hot Module Replacement (HMR) is near-instantaneous with Vite's native ESM approach
- **Better Production Builds**: Superior tree-shaking and code splitting compared to CRA's Webpack setup
- **Bundle Size**: Vite produces smaller bundles (critical for our <500KB constraint)
- **Modern Tooling**: Built for ES modules, better TypeScript integration
- **Active Development**: Vite is actively maintained, CRA is essentially deprecated

**Alternatives Considered**:
- Create React App: Rejected due to slower builds, larger bundles, deprecated status
- Parcel: Rejected due to less React-specific optimization
- Next.js: Overkill for static site, adds unnecessary SSR complexity

**References**:
- Vite documentation: https://vitejs.dev/
- Vite vs CRA benchmark: https://github.com/yyx990803/vite-vs-next-turbo-vs-wmr

---

### 2. State Management: Zustand vs Redux vs Context API

**Decision**: Zustand 4.x

**Rationale**:
- **Deterministic Updates**: Simple to make state updates deterministic (critical for seed-based sync)
- **Less Boilerplate**: No actions, reducers, or providers needed
- **Better TypeScript**: Excellent type inference without manual typing
- **Small Bundle**: ~1KB minified+gzipped (vs Redux ~13KB)
- **DevTools Support**: Works with Redux DevTools for debugging
- **Simpler Testing**: Direct store access in tests without complex mocking

**Alternatives Considered**:
- Redux: Rejected due to excessive boilerplate for this use case
- Context API: Rejected due to performance concerns with frequent updates (timer ticks)
- Jotai/Recoil: Rejected due to learning curve and atomic state complexity unnecessary here

**References**:
- Zustand documentation: https://github.com/pmndrs/zustand
- State management comparison: https://leerob.io/blog/react-state-management

---

### 3. Testing Framework: Vitest vs Jest

**Decision**: Vitest 1.x with React Testing Library

**Rationale**:
- **Native Vite Integration**: Zero configuration, uses same config as development
- **Faster Execution**: 2-10x faster than Jest due to native ESM support
- **Better ESM Support**: No need for transformation, handles imports natively
- **Compatible API**: Drop-in replacement for Jest (describe, it, expect)
- **UI Mode**: Built-in UI for test visualization
- **Coverage**: V8 coverage provider built-in

**Alternatives Considered**:
- Jest: Rejected due to slower speed, ESM configuration complexity
- Cypress: Rejected for unit tests (better for E2E, which we don't need for static app)

**References**:
- Vitest documentation: https://vitest.dev/
- Vitest vs Jest comparison: https://vitest.dev/guide/comparisons.html#jest

---

### 4. Routing: HashRouter vs BrowserRouter

**Decision**: HashRouter from react-router-dom 6.x

**Rationale**:
- **GitHub Pages Compatibility**: GitHub Pages serves static files, cannot handle server-side routing
- **No Server Configuration**: Hash-based routing works without .htaccess or server rewrites
- **Client-Side Only**: All routing happens in browser, perfect for offline-first app
- **Simple Deployment**: No special deployment configuration needed

**Alternatives Considered**:
- BrowserRouter: Rejected because GitHub Pages returns 404 for direct URL access
- No Router: Rejected because we want bookmarkable game states and browser back button support

**References**:
- React Router documentation: https://reactrouter.com/
- GitHub Pages SPA deployment: https://github.com/rafgraph/spa-github-pages

---

### 5. Styling: CSS Modules vs Styled Components vs Tailwind

**Decision**: CSS Modules with TypeScript definitions

**Rationale**:
- **Zero Runtime**: No JavaScript overhead for styles (better performance)
- **Scoped Styles**: Automatic class name scoping prevents collisions
- **TypeScript Support**: Can generate .d.ts files for CSS classes
- **Simple Mental Model**: Just CSS with scoping, no new syntax to learn
- **SSR-Free**: No hydration concerns since we're client-side only
- **Design Tokens**: Works perfectly with CSS custom properties in :root

**Alternatives Considered**:
- Styled Components: Rejected due to runtime cost and bundle size increase
- Emotion: Rejected for same reasons as Styled Components
- Tailwind CSS: Rejected because custom bureaucratic aesthetic doesn't map well to utility classes
- Vanilla CSS: Rejected due to global namespace pollution risk

**References**:
- CSS Modules documentation: https://github.com/css-modules/css-modules
- CSS-in-JS performance analysis: https://pustelto.com/blog/css-vs-css-in-js-perf/

---

### 6. Deterministic PRNG: seedrandom vs custom implementation

**Decision**: seedrandom 3.x library

**Rationale**:
- **Industry Standard**: Widely used, well-tested library (2M+ weekly downloads)
- **True Determinism**: Produces identical sequences across all platforms and browsers
- **Quality Randomness**: Passes statistical randomness tests (Diehard, TestU01)
- **Small Size**: ~6KB unminified, ~2KB minified
- **Simple API**: Drop-in replacement for Math.random()
- **TypeScript Types**: Has @types/seedrandom for full type safety

**Alternatives Considered**:
- Custom LCG/Xorshift: Rejected due to risk of subtle bugs, statistical weaknesses
- Math.random(): Rejected because not seedable, produces different results across platforms
- crypto.getRandomValues(): Rejected because not deterministic (for game content generation)

**References**:
- seedrandom GitHub: https://github.com/davidbau/seedrandom
- PRNG comparison: https://en.wikipedia.org/wiki/List_of_random_number_generators

---

### 7. Date/Time Utilities: date-fns vs Moment.js vs Luxon

**Decision**: date-fns 2.x

**Rationale**:
- **Tree-Shakeable**: Import only what you need (vs Moment's monolithic bundle)
- **Immutable**: All functions return new dates, no mutations
- **Small Bundle Impact**: ~2KB for our UTC rounding needs (vs Moment ~70KB)
- **TypeScript Native**: Excellent TypeScript support out of the box
- **Active Maintenance**: Regularly updated, modern codebase

**Alternatives Considered**:
- Moment.js: Rejected due to large bundle size and mutable API
- Luxon: Rejected because more complex than needed for simple UTC rounding
- Native Date API: Rejected because UTC manipulation is error-prone

**References**:
- date-fns documentation: https://date-fns.org/
- Date library comparison: https://github.com/you-dont-need/You-Dont-Need-Momentjs

---

## Architectural Decisions

### 1. Seed Generation Strategy

**Decision**: Three seed sources - UTC-based default, manual entry, cryptographic random

**Rationale**:
- **UTC-based default**: Enables spontaneous synchronized play globally (players starting ~same time get same seed)
- **Manual entry**: Allows pre-coordinated games with specific seeds
- **Cryptographic random**: Uses Web Crypto API (`crypto.getRandomValues()`) for truly unpredictable seeds when desired

**Implementation**:
```typescript
// UTC seed: Round to 5-minute intervals, hash to 4 letters
const utcSeed = generateDefaultSeed(); // "ABCD"

// Random seed: 4 random uppercase letters A-Z
const randomSeed = generateRandomSeed(); // "XJQM"

// Manual seed: User types 4 letters
const manualSeed = validateSeed(userInput); // throws if invalid
```

---

### 2. State Machine Architecture

**Decision**: Single Zustand store with state enum, not React state machine library

**Rationale**:
- **Simplicity**: State transitions are linear and manual (button-click driven)
- **No Complex Logic**: No parallel states, no guards, no complex conditionals
- **Deterministic**: Easy to serialize and hydrate for testing
- **Debuggable**: Redux DevTools shows full state history

**State Flow**:
```
SeedEntry → ModeSelection → RoleSelection → PenaltyCalibration →
PacketDisplay → InducerPuzzle → BackgroundDisplay → ReadyToStart →
Interview → Conclusion
```

**Alternatives Considered**:
- XState: Rejected as overkill for linear state machine with manual transitions
- Separate state per component: Rejected due to sync complexity across devices

---

### 3. Multi-Device Synchronization Strategy

**Decision**: Manual coordination with visual state indicators, no automatic sync

**Rationale**:
- **Zero Network**: Cannot use WebSockets, WebRTC, or any server
- **Simple UX**: Players verbally coordinate "Ready?" then both click button
- **Deterministic Content**: Seed ensures identical content, only state transitions manual
- **Visual Feedback**: Progress indicators ("Step 3 of 10") prevent desyncs
- **Sync Check Tool**: State hash display for debugging if desync occurs

**Not Using**:
- WebRTC peer-to-peer: Requires network, violates offline constraint
- SharedWorker: Not supported in all browsers, complex setup
- Service Worker sync: Requires network, not appropriate for real-time coordination

---

### 4. Tutorial Persistence Strategy

**Decision**: Browser cookies with 365-day expiry, no localStorage

**Rationale**:
- **Simple Needs**: Only need one boolean flag (tutorial completed yes/no)
- **No Sensitive Data**: Tutorial state is not private information
- **Cookie Advantages**: Works in incognito mode better, explicit expiry
- **js-cookie Library**: Tiny (2KB), simple API, handles edge cases

**Implementation**:
```typescript
import Cookies from 'js-cookie';

const TUTORIAL_KEY = 'ic_tutorial_completed';

export const hasCompletedTutorial = () =>
  Cookies.get(TUTORIAL_KEY) === 'true';

export const markTutorialComplete = () =>
  Cookies.set(TUTORIAL_KEY, 'true', { expires: 365 });
```

**Alternatives Considered**:
- localStorage: Rejected because cookies are simpler for this single flag
- sessionStorage: Rejected because tutorial completion should persist across sessions

---

### 5. Inducer Pattern Generation Algorithm

**Decision**: Recursive depth-first maze generation with directional connections

**Rationale**:
- **Reference Implementation**: Based on RobotInterrogation's InterferencePattern.cs
- **Deterministic**: Seeded RNG ensures same maze for same seed
- **Complexity**: 5x5 grid with directional connections (North, East, South, West)
- **Visual Output**: Renders with box-drawing characters (┌, ┐, └, ┘, ─, │)
- **Solution Path**: Subset of cells marked with letters (A, B, C, ...)

**Algorithm**:
1. Create 5x5 grid, all cells initially unconnected
2. Start at random cell (determined by seed)
3. Depth-first search: visit neighbors in random order (seeded)
4. Mark connections between visited cells using bitflags
5. Place letter markers at intervals along generated path
6. Generate question about letter sequence

**Alternatives Considered**:
- Simple random connections: Rejected because produces disconnected graphs
- Prim's algorithm: Rejected because less predictable path structure
- Hand-crafted patterns: Rejected because less variety, predictable

---

### 6. Accessibility Implementation Strategy

**Decision**: Semantic HTML + ARIA labels + keyboard shortcuts, tested with automated tools

**Tools**:
- **axe-core**: Automated accessibility testing in Vitest
- **Lighthouse**: Overall accessibility score (target: 100)
- **NVDA/VoiceOver**: Manual screen reader testing
- **keyboard-only testing**: Manual testing without mouse

**Key Patterns**:
- Use `<button>` not `<div onClick>` for all actions
- Explicit `<label>` for all form inputs
- ARIA live regions for timer countdown
- Focus management for modal-like tutorial
- Skip links for main content
- Color contrast: minimum 4.5:1 for normal text, 3:1 for large
- All interactive elements have visible focus indicators

---

## Performance Optimizations

### Bundle Size Optimization

**Target**: <500KB gzipped

**Strategies**:
1. **Tree-shaking**: Import only used functions (date-fns, etc.)
2. **Code splitting**: Lazy load tutorial components
3. **Minification**: Vite's default Terser/esbuild minification
4. **Compression**: GitHub Pages serves gzip by default
5. **No images**: Use CSS for visual design (halftone patterns via CSS gradients or data URIs)

**Monitoring**:
- `rollup-plugin-visualizer` to analyze bundle composition
- `vite-bundle-analyzer` for chunk size analysis

---

### Runtime Performance

**Target**: 60fps UI, <5ms state updates

**Strategies**:
1. **Memo Selectors**: Use Zustand selectors to prevent unnecessary re-renders
2. **useMemo/useCallback**: For expensive computations and stable callbacks
3. **Virtual Scrolling**: If question list becomes long (unlikely with 6 questions)
4. **CSS Containment**: Use `contain: layout` for independent subtrees
5. **RequestAnimationFrame**: For smooth countdown timer updates

---

### Load Time Optimization

**Target**: <3s on 3G

**Strategies**:
1. **Inline Critical CSS**: Vite automatically inlines critical styles
2. **Preload Fonts**: If using web fonts (prefer system fonts)
3. **Asset Optimization**: Optimize any images/icons (though we aim for none)
4. **Service Worker**: Optional caching for instant repeat loads

---

## Security Considerations

### XSS Prevention

- **React Escaping**: React automatically escapes rendered content
- **No dangerouslySetInnerHTML**: Never render raw HTML
- **Content Security Policy**: Can add CSP header if needed (GitHub Pages limitation)

### No Sensitive Data

- **No Authentication**: No user accounts or passwords
- **No PII**: No collection of personal information
- **No Tracking**: No analytics or cookies beyond tutorial flag

---

## Testing Strategy

### Unit Tests (100% Coverage for Game Logic)

**Files Requiring 100% Coverage**:
- `src/lib/GameRNG.ts`
- `src/lib/seedGeneration.ts`
- `src/lib/inducerPattern.ts`
- `src/lib/tutorialCookie.ts`
- `src/store/gameStore.ts` (logic parts)

**Test Patterns**:
```typescript
describe('GameRNG', () => {
  it('produces identical outputs for same seed', () => {
    const rng1 = new GameRNG('TEST');
    const rng2 = new GameRNG('TEST');

    const values1 = Array(10).fill(0).map(() => rng1.nextInt(0, 100));
    const values2 = Array(10).fill(0).map(() => rng2.nextInt(0, 100));

    expect(values1).toEqual(values2);
  });
});
```

---

### Component Tests (80%+ Coverage)

**Test Priorities**:
1. User interactions (button clicks, form submissions)
2. State transitions (advancing through game states)
3. Role-based rendering (Investigator vs Suspect views)
4. Accessibility (keyboard navigation, ARIA labels)

**Test Pattern**:
```typescript
describe('SeedEntry', () => {
  it('validates seed format', async () => {
    const { getByLabelText, getByText } = render(<SeedEntry />);

    const input = getByLabelText('Enter Seed');
    await userEvent.type(input, 'abc'); // lowercase invalid

    expect(getByText('Seed must be 4 uppercase letters')).toBeInTheDocument();
  });
});
```

---

### Integration Tests

**Critical Flows**:
1. Complete single-device game (seed entry → conclusion)
2. Multi-device sync (two stores with same seed)
3. Tutorial flow (auto-show → completion → cookie persistence)

**Test Pattern**:
```typescript
describe('Complete Game Flow', () => {
  it('allows full game from seed to conclusion', () => {
    // Initialize store with seed
    // Advance through all states
    // Verify outcome reveals correctly
  });
});
```

---

## Research Conclusions

All technical decisions support the constitution requirements:

✅ **Determinism**: seedrandom ensures identical game content
✅ **Offline-First**: Zero network dependencies after load
✅ **Performance**: Vite + tree-shaking + code splitting meets bundle size targets
✅ **Accessibility**: Semantic HTML + ARIA + keyboard navigation
✅ **Testing**: Vitest + RTL provides fast, comprehensive test coverage
✅ **Legal**: Static deployment to GitHub Pages complies with CC BY-NC-SA 4.0

**No unresolved questions or NEEDS CLARIFICATION items remain.**

---

**Research Status**: ✅ Complete
**Phase 0 Complete**: Ready for Phase 1 (Design & Contracts)
