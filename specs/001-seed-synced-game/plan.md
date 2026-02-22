# Implementation Plan: Seed-Synced Inhuman Conditions Web Game

**Branch**: `001-seed-synced-game` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-seed-synced-game/spec.md`

**Note**: This plan translates the WHAT/WHY from the specification into HOW with specific technical decisions, architecture, and component design.

## Summary

Create a fully static React web application for playing Inhuman Conditions, a 5-minute social deduction interrogation game. The application synchronizes game state across multiple devices using a 4-letter seed system that deterministically generates all game content (questions, roles, penalties) without any server communication. Players can use single-device mode (passing one device), multi-device mode (each player has their own device synced by seed), or timer-only mode. First-time users receive an interactive tutorial. The entire application runs offline after initial load and must meet WCAG 2.1 Level AA accessibility standards while maintaining the game's bureaucratic visual aesthetic.

## Technical Context

**Language/Version**: TypeScript 5.3+ with strict mode enabled
**Framework**: React 18.3+ with functional components and hooks
**Build Tool**: Vite 5.x for fast development and optimized production builds
**Primary Dependencies**:
- `react` & `react-dom` 18.3+
- `react-router-dom` 6.x (HashRouter for GitHub Pages compatibility)
- `zustand` 4.x (state management)
- `seedrandom` 3.x (deterministic PRNG)
- `date-fns` 2.x (UTC time manipulation for seed generation)
- `js-cookie` 3.x (tutorial persistence)

**Development Dependencies**:
- `vitest` 1.x (testing framework)
- `@testing-library/react` 14.x (component testing)
- `@testing-library/user-event` 14.x (interaction testing)
- `@vitest/coverage-v8` (code coverage)
- `@types/*` packages for TypeScript definitions

**Storage**: Browser cookies for tutorial state (365-day expiry), no localStorage required for MVP
**Testing**: Vitest with React Testing Library, 100% coverage for game logic, 80%+ for components
**Target Platform**: Static web app deployed to GitHub Pages, works offline after initial load
**Project Type**: Single-page web application (SPA) with client-side routing
**Performance Goals**:
- Initial load < 3 seconds on 3G connection
- Time to Interactive < 5 seconds
- Bundle size < 500KB gzipped
- Lighthouse score > 90

**Constraints**:
- Zero network requests after initial page load (fully offline)
- No server-side code or database
- Must work on modern evergreen browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Must be mobile-responsive (iOS Safari 14+, Chrome Android 90+)
- WCAG 2.1 Level AA accessibility compliance
- CC BY-NC-SA 4.0 license compliance (attribution required, non-commercial, share-alike)

**Scale/Scope**:
- 6 prioritized user stories (P1-P3)
- 44 functional requirements
- 10 game states in state machine
- 11 question packets with ~6 questions each
- 18 penalties, 30 suspect backgrounds
- ~15-20 React components
- Estimated ~3000-4000 lines of TypeScript code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Legal Compliance (NON-NEGOTIABLE)
- [x] CC BY-NC-SA 4.0 license declared in package.json and LICENSE file
- [x] Attribution footer component with required credits to Tommy Maranges, Cory O'Brien, Mac Schubert
- [x] GitHub repository link for issue reporting
- [x] No commercial use (free, open-source, GitHub Pages deployment)
- [x] No app store submission (web-only deployment)

### ✅ Determinism (NON-NEGOTIABLE)
- [x] All random behavior seeded via `seedrandom` library
- [x] Same seed produces identical game content across all devices
- [x] State transitions are manual (button-based), not random
- [x] No time-based randomness for game content (only for default seed suggestion)
- [x] Seed system uses 4-letter uppercase strings (A-Z)

### ✅ Test-First Development (NON-NEGOTIABLE)
- [x] TDD workflow: Write tests → Tests fail → Implement → Tests pass
- [x] Vitest configured for unit and integration testing
- [x] Game logic (RNG, seed generation, inducer patterns) requires 100% test coverage
- [x] Components require 80%+ test coverage
- [x] CI/CD pipeline runs tests before deployment

### ✅ Accessibility (NON-NEGOTIABLE)
- [x] WCAG 2.1 Level AA compliance required
- [x] Keyboard navigation for all interactive elements
- [x] ARIA labels for buttons, links, form controls
- [x] Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text
- [x] Screen reader compatibility (semantic HTML, proper headings)
- [x] Focus indicators visible on all interactive elements

### ✅ No Network Dependencies (NON-NEGOTIABLE)
- [x] Zero API calls after initial page load
- [x] No analytics or tracking scripts
- [x] All game data bundled in JavaScript
- [x] Service worker optional (nice-to-have for offline caching)
- [x] Fully functional without internet connection after load

### ✅ Frequent Commits and Pushes (NON-NEGOTIABLE)
- [x] Commit after each completed feature/test
- [x] Push to remote every 30 minutes or after feature completion
- [x] Commit message format: `<type>: <description>`
- [x] Co-authored-by: Claude Sonnet 4.5 in all commits

### ✅ Architecture & Technology
- [x] TypeScript strict mode enabled
- [x] No `any` types except in test mocks
- [x] Functional components with hooks (no classes)
- [x] CSS Modules for styling (no runtime CSS-in-JS)
- [x] Zustand for global state management
- [x] HashRouter for GitHub Pages compatibility

### ✅ Browser Support & Performance
- [x] Modern evergreen browsers only (no IE11)
- [x] Mobile responsive design
- [x] Initial load < 3s on 3G
- [x] Bundle size < 500KB gzipped
- [x] Lighthouse score > 90

## Project Structure

### Documentation (this feature)

```text
specs/001-seed-synced-game/
├── spec.md              # Feature specification (WHAT/WHY)
├── plan.md              # This file (HOW) - implementation plan
├── research.md          # Phase 0: Technology decisions and rationale
├── data-model.md        # Phase 1: Game entities and state shape
├── quickstart.md        # Phase 1: Developer onboarding guide
├── contracts/           # Phase 1: Public APIs and interfaces
│   └── game-state-api.md  # Zustand store public API
└── checklists/          # Quality validation checklists
    └── requirements.md  # Spec quality checklist (already exists)
```

### Source Code (repository root)

```text
inhuman-conditions/
├── public/
│   ├── index.html              # Entry HTML with attribution footer
│   └── assets/                 # Static assets (if any icons/images needed)
│
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component with HashRouter
│   │
│   ├── components/             # React components
│   │   ├── game/               # Game-specific components
│   │   │   ├── GameStateMachine.tsx         # Main game orchestrator
│   │   │   ├── SeedEntry.tsx                # Seed input with generate/randomize
│   │   │   ├── ModeSelector.tsx             # Single/Multi/Timer mode selection
│   │   │   ├── RoleSelection.tsx            # Investigator/Suspect/Spectator
│   │   │   ├── PenaltyCalibration.tsx       # Practice penalty 3 times
│   │   │   ├── PacketDisplay.tsx            # Show selected packet info
│   │   │   ├── InducerPuzzle.tsx            # Maze puzzle for suspect
│   │   │   ├── BackgroundDisplay.tsx        # Suspect background reveal
│   │   │   ├── ReadyToStart.tsx             # Final ready screen
│   │   │   ├── Interview/
│   │   │   │   ├── InvestigatorView.tsx    # Questions, timer, notes
│   │   │   │   ├── SuspectView.tsx         # Role, traits, background, timer
│   │   │   │   └── SpectatorView.tsx       # Read-only question view
│   │   │   └── Conclusion.tsx               # Outcome reveal
│   │   │
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx                   # Styled button
│   │   │   ├── Card.tsx                     # Content card wrapper
│   │   │   ├── CountdownTimer.tsx           # 5-minute timer with blinking
│   │   │   ├── ProgressIndicator.tsx        # Step X of Y display
│   │   │   ├── SecretReveal.tsx             # Show/hide role toggle
│   │   │   └── SyncCheck.tsx                # State hash for desync debug
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx                   # Logo, seed display, settings
│   │   │   └── Footer.tsx                   # Attribution & license
│   │   │
│   │   └── tutorial/           # Tutorial components
│   │       ├── TutorialFlow.tsx             # Tutorial orchestrator
│   │       ├── TutorialStep.tsx             # Individual tutorial screen
│   │       ├── TutorialProgress.tsx         # Dot indicators
│   │       └── TutorialNavigation.tsx       # Back/Next/Skip buttons
│   │
│   ├── lib/                    # Core utilities (100% test coverage)
│   │   ├── GameRNG.ts                       # Seeded random number generator
│   │   ├── seedGeneration.ts                # UTC-based & random seed generation
│   │   ├── inducerPattern.ts                # Maze puzzle generation
│   │   └── tutorialCookie.ts                # Cookie management
│   │
│   ├── store/                  # Zustand state management
│   │   └── gameStore.ts                     # Global game state
│   │
│   ├── data/                   # Static game data
│   │   ├── packets.ts                       # 11 question packets
│   │   ├── penalties.ts                     # 18 penalty definitions
│   │   ├── backgrounds.ts                   # 30 suspect backgrounds
│   │   └── roles.ts                         # Role type definitions
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── game.ts                          # Game entities and state types
│   │   └── index.ts                         # Barrel export
│   │
│   ├── styles/                 # Global styles and tokens
│   │   ├── tokens.css                       # Design tokens (colors, spacing, etc.)
│   │   └── global.css                       # CSS reset and global styles
│   │
│   └── test/                   # Test utilities
│       └── setup.ts                         # Vitest global setup
│
├── tests/                      # Test files (colocated or here)
│   ├── unit/                   # Unit tests for lib/
│   └── integration/            # Integration tests for game flow
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Run tests on PR and push
│       └── deploy.yml          # Deploy to GitHub Pages on main
│
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration (base path for GitHub Pages)
├── vitest.config.ts            # Vitest configuration
├── tsconfig.json               # TypeScript config (strict mode)
├── tsconfig.app.json           # App-specific TypeScript config
├── tsconfig.node.json          # Node-specific TypeScript config
├── eslint.config.js            # ESLint configuration
├── .gitignore                  # Git ignore patterns
├── LICENSE                     # CC BY-NC-SA 4.0 license text
└── README.md                   # Project documentation

```

**Structure Decision**: Single-page React application with feature-based component organization. Game-specific components in `src/components/game/`, reusable UI components in `src/components/ui/`, core logic in `src/lib/`, and static game data in `src/data/`. Tests colocated with source files (e.g., `GameRNG.test.ts` next to `GameRNG.ts`) or in dedicated `tests/` directory for integration tests.

## Complexity Tracking

> **No violations requiring justification**

All technical decisions align with the constitution. The architecture is intentionally simple:
- Single project (no monorepo needed)
- Client-side only (no backend)
- Static data files (no database)
- Standard React patterns (no complex state machines beyond Zustand)
- CSS Modules (no runtime CSS-in-JS)
- Minimal dependencies (only essential libraries)

The most complex aspect is the deterministic seed-based synchronization, which is a core requirement from the specification and achievable with the `seedrandom` library.

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed research findings, technology evaluation, and architecture decisions.

**Key Decisions**:
1. **Vite over Create React App**: Faster builds, better tree-shaking, native ESM
2. **Zustand over Redux**: Less boilerplate, easier deterministic state, better TypeScript
3. **Vitest over Jest**: Native Vite integration, faster execution, better ESM support
4. **HashRouter over BrowserRouter**: GitHub Pages doesn't support server-side routing
5. **CSS Modules over CSS-in-JS**: Better performance, simpler mental model
6. **seedrandom library**: Industry-standard deterministic PRNG
7. **date-fns**: Lightweight, tree-shakeable UTC time utilities

## Phase 1: Design & Contracts

See design artifacts:
- [data-model.md](./data-model.md) - Game entities and Zustand store shape
- [contracts/game-state-api.md](./contracts/game-state-api.md) - Public Zustand store API
- [quickstart.md](./quickstart.md) - Developer onboarding guide

## Implementation Phases

### Phase 1: Core Game Logic & Data (P1 - MVP Foundation)

**Goal**: Implement seed system, game data, and state management

**Components**:
1. GameRNG class with 100% test coverage
2. Seed generation (UTC-based default + random)
3. Game data files (packets, penalties, backgrounds, roles)
4. Zustand game store with deterministic initialization
5. Inducer pattern generation

**Success Criteria**:
- Same seed produces identical game content on every run
- All tests pass with 100% coverage for game logic
- Store can be initialized and reset

### Phase 2: Game State Machine & UI Foundation (P1 - MVP Core)

**Goal**: Implement all game states and basic UI components

**Components**:
1. GameStateMachine component
2. All state components (SeedEntry through Conclusion)
3. CountdownTimer component
4. Basic styling with design tokens
5. Layout components (Header, Footer with attribution)

**Success Criteria**:
- Can navigate through all game states manually
- Timer counts down correctly
- Attribution footer displays properly
- Single-device mode playable end-to-end

### Phase 3: Multi-Device & Additional Modes (P2)

**Goal**: Enable multi-device synchronization and alternative modes

**Components**:
1. ModeSelector component
2. Role-based view rendering
3. ProgressIndicator and SyncCheck components
4. Timer-only mode page
5. Spectator view

**Success Criteria**:
- Two devices with same seed show identical content
- Timer-only mode works independently
- Spectator view shows appropriate information

### Phase 4: Tutorial System (P2)

**Goal**: Onboard first-time users

**Components**:
1. Tutorial flow components
2. Cookie management for tutorial state
3. Shortened timer for tutorial (30 seconds)
4. Settings option to replay tutorial

**Success Criteria**:
- Tutorial auto-displays on first visit
- Tutorial completion persists via cookie
- Tutorial can be replayed from settings

### Phase 5: Polish & Accessibility (P3)

**Goal**: Production-ready quality

**Components**:
1. Full accessibility audit and fixes
2. Keyboard navigation implementation
3. ARIA labels for all interactive elements
4. Visual style polish (halftone patterns, bureaucratic aesthetic)
5. Mobile responsive improvements
6. Performance optimization

**Success Criteria**:
- WCAG 2.1 Level AA compliance verified
- Lighthouse score > 90
- Works on all supported browsers
- Bundle size < 500KB gzipped

### Phase 6: Deployment & CI/CD (P3)

**Goal**: Automated testing and deployment

**Components**:
1. GitHub Actions CI workflow (run tests on PR)
2. GitHub Actions deploy workflow (deploy to GitHub Pages)
3. Vite build configuration for GitHub Pages
4. README with setup instructions
5. CONTRIBUTING.md

**Success Criteria**:
- CI runs on all PRs and main branch commits
- Deployment happens automatically on main push
- Site accessible at GitHub Pages URL
- All documentation complete

## Development Workflow

1. **Feature Branch**: Work on `001-seed-synced-game` branch
2. **TDD Cycle**: Write test → Test fails (Red) → Implement → Test passes (Green) → Refactor
3. **Frequent Commits**: Commit after each completed test/feature
4. **Regular Push**: Push to remote every 30 minutes or after feature completion
5. **Pull Request**: Create PR when feature complete, all tests pass, Lighthouse score > 90
6. **Merge to Main**: After PR review and approval
7. **Auto-Deploy**: GitHub Actions deploys to GitHub Pages

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Inducer pattern generation too complex | High | Medium | Use simpler grid-based algorithm, reference RobotInterrogation implementation |
| Multi-device desync confusion | Medium | High | Clear UI indicators, sync check feature, prominent step counters |
| Bundle size exceeds 500KB | Medium | Low | Code splitting, tree-shaking, analyze bundle with rollup-plugin-visualizer |
| Accessibility compliance gaps | High | Medium | Use automated tools (axe, Lighthouse), manual keyboard testing |
| Browser compatibility issues | Medium | Low | Use Browserslist config, test on all target browsers |
| Timer drift across devices | Low | Low | Accept manual timer start, rely on device clocks (±1 second acceptable) |

## Success Metrics

- [ ] All 44 functional requirements implemented
- [ ] 100% test coverage for game logic (lib/)
- [ ] 80%+ test coverage for components
- [ ] WCAG 2.1 Level AA compliance (automated + manual testing)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Bundle size < 500KB gzipped
- [ ] Load time < 3 seconds on 3G
- [ ] Zero network requests after initial load
- [ ] Works on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, iOS Safari 14+, Chrome Android 90+
- [ ] Two players can complete full game (seed entry → conclusion) in < 10 minutes
- [ ] Same seed produces identical content on 100% of attempts

## Next Steps

1. ✅ Specification complete (`/speckit.specify`)
2. ✅ Implementation plan complete (`/speckit.plan`)
3. → Create research.md (Phase 0)
4. → Create data-model.md (Phase 1)
5. → Create contracts/ (Phase 1)
6. → Create quickstart.md (Phase 1)
7. → Run `/speckit.tasks` to generate actionable tasks
8. → Run `/speckit.implement` to begin implementation

---

**Plan Status**: ✅ Complete and ready for task generation
**Last Updated**: 2026-02-22
**Version**: 1.0.0
