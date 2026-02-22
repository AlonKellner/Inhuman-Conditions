# Implementation Plan: Game Logic Refactor - Decouple from UI

**Branch**: `002-official-design-polish` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Refactor to decouple game process logic from visual representation

## Summary

Extract game process logic from React components and Zustand store into pure, testable TypeScript modules. Create a standalone `GameEngine` class that manages all game rules, state transitions, and validations independently of the UI layer. Components become pure views that render game state without containing business logic.

**Why**: Currently game logic is intertwined with React components and state management, making it difficult to test game rules in isolation. This refactor enables 100% test coverage of game logic per constitution requirements, improves maintainability, and makes the codebase more robust.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode)
**Primary Dependencies**: React 18.3, Zustand (for view state only), Vite 5.x, Vitest
**Storage**: LocalStorage (for tutorial state), in-memory (game state)
**Testing**: Vitest + React Testing Library
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application (React SPA)
**Performance Goals**: Initial load < 3s on 3G, Time to Interactive < 5s, Lighthouse > 90
**Constraints**: No network dependencies, fully offline-capable, deterministic game logic
**Scale/Scope**: Single React app, ~50 components, 11 question packets, 18 penalties, 30 backgrounds

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ NON-NEGOTIABLE Requirements Compliance

**I. Legal Compliance** ✅
- Code remains CC BY-NC-SA 4.0 licensed
- Attribution preserved in footer
- No commercial use
- Refactor does not change licensing

**II. Determinism** ✅
- All random behavior remains seeded via `GameRNG`
- Same seed produces identical game content
- State transitions remain reproducible
- Refactor IMPROVES determinism by centralizing game logic

**III. Test-First Development** ✅
- **CRITICAL**: This refactor ENABLES 100% test coverage for game logic
- Pure game engine classes are fully unit-testable without React
- TDD workflow: Write tests for `GameEngine` → Tests fail → Implement logic
- Current: ~34 component tests, minimal game logic coverage
- Target: 100% coverage for all game rules and state transitions

**IV. Accessibility** ✅
- No impact on accessibility (UI layer unchanged)
- WCAG 2.1 Level AA compliance maintained
- Keyboard navigation, screen readers, contrast ratios unaffected

**V. No Network Dependencies** ✅
- Remains fully offline-capable
- No server communication introduced
- Zero third-party API calls

**VI. Frequent Commits** ✅
- Incremental refactor with frequent commits
- Push every 30 minutes or after feature completion
- Commit message format: `refactor: <description>`

### Architecture Alignment

**TypeScript Strict Mode** ✅ → Refactor will eliminate `any` types in game logic

**Component Architecture** ✅ → Components become simpler (pure views)

**State Management** ✅ → Zustand used ONLY for UI state, game logic extracted

**Testing Philosophy** ✅ → **PRIMARY BENEFIT**: TDD becomes easier with pure game logic

### Quality Gates

All gates remain in effect:
- Tests pass before commit ✅
- 100% coverage for game logic (NEW) ✅
- TypeScript/ESLint errors = 0 ✅
- Build succeeds ✅
- Lighthouse > 90 ✅

## Project Structure

### Documentation (this feature)

```text
specs/002-official-design-polish/
├── spec.md              # Original feature spec (visual polish + game flow)
├── plan.md              # This file (refactor implementation plan)
├── research.md          # Phase 0 output (architecture patterns research)
├── data-model.md        # Phase 1 output (game engine entities)
├── contracts/           # Phase 1 output (GameEngine API contracts)
│   ├── game-engine.md   # Core game engine interface
│   └── state-machine.md # State transition rules
├── quickstart.md        # Phase 1 output (testing examples)
└── tasks.md             # Existing tasks (will be updated with refactor tasks)
```

### Source Code (repository root)

**Current Structure** (coupled):
```text
src/
├── components/
│   ├── GameStateMachine.tsx    # ❌ Contains game logic + rendering
│   └── game/
│       ├── PenaltyCalibration.tsx  # ❌ Game rules mixed with UI
│       └── ReadyToStart.tsx
├── store/
│   └── gameStore.ts             # ❌ Business logic in Zustand store
├── data/
│   ├── packets.ts
│   ├── penalties.ts
│   └── backgrounds.ts
└── lib/
    ├── GameRNG.ts               # ✅ Already pure
    └── seedGeneration.ts        # ✅ Already pure

tests/
├── components/                  # ✅ Component tests (34 passing)
├── integration/                 # ⚠️  Integration tests (needs improvement)
└── unit/                        # ⚠️  Limited game logic coverage
```

**Target Structure** (decoupled):
```text
src/
├── engine/                      # 🆕 Pure game logic (no React)
│   ├── GameEngine.ts            # Core game orchestration
│   ├── StateM.ts          # State transition rules
│   ├── RuleValidator.ts         # Game rule enforcement
│   ├── ContentSelector.ts       # Deterministic content selection
│   └── types.ts                 # Engine-specific types
├── components/                  # ✅ Pure views (no business logic)
│   ├── GameStateMachine.tsx     # ✅ Renders engine state
│   └── game/                    # ✅ Presentational components
├── hooks/                       # 🆕 React hooks for engine integration
│   ├── useGameEngine.ts         # Hook to subscribe to engine
│   └── useGameState.ts          # Hook for reactive state
├── store/                       # ✅ UI state only (no game logic)
│   └── uiStore.ts               # Modal visibility, animations, etc.
├── data/                        # ✅ Static game content (unchanged)
│   ├── packets.ts
│   ├── penalties.ts
│   └── backgrounds.ts
└── lib/                         # ✅ Pure utilities (unchanged)
    ├── GameRNG.ts
    └── seedGeneration.ts

tests/
├── engine/                      # 🆕 100% game logic coverage
│   ├── GameEngine.test.ts       # State management tests
│   ├── StateMachine.test.ts     # Transition rules tests
│   ├── RuleValidator.test.ts    # Game rule tests
│   └── ContentSelector.test.ts  # Determinism tests
├── components/                  # ✅ View rendering tests
├── integration/                 # ✅ End-to-end flow tests
└── unit/                        # ✅ Utility function tests
```

**Structure Decision**: **Single project with engine/ directory**

Rationale:
- Game engine logic extracted to `src/engine/` (pure TypeScript, zero React dependencies)
- Components in `src/components/` become pure views (render props from engine)
- `src/hooks/` provides React integration layer (useGameEngine, useGameState)
- `src/store/` reduced to UI-only state (modals, animations, not game logic)
- Tests organized by concern: `tests/engine/` for game logic (100% coverage), `tests/components/` for UI

This structure enables:
1. **Testability**: Game engine testable without mounting React components
2. **Reusability**: Engine could power different UIs (CLI, mobile, etc.)
3. **Maintainability**: Clear separation of concerns
4. **Constitution Compliance**: Achieves 100% game logic coverage requirement

## Complexity Tracking

> **No violations** - This refactor IMPROVES compliance with constitution principles by enabling better test coverage and deterministic behavior verification.

| Enhancement | Benefit | Aligns With |
|-------------|---------|-------------|
| GameEngine class | Centralizes game logic, easier to test | Principle III (TDD), 100% logic coverage |
| StateMachine module | Makes state transitions explicit and testable | Principle II (Determinism) |
| React hooks layer | Clean separation without new dependencies | Principle V (No network deps) |

---

## Phase 0: Research (Next Steps)

**Objective**: Research architecture patterns for decoupling game logic from UI in React applications.

**Research Topics**:
1. **Model-View-Presenter (MVP) pattern** in React applications
2. **State machine libraries** vs custom implementation (XState vs custom StateMachine)
3. **Observable pattern** for game state subscriptions (RxJS vs simple event emitters vs Zustand selectors)
4. **Deterministic testing** strategies for game engines
5. **Migration strategy** for refactoring existing coupled code incrementally

**Output**: `research.md` documenting decisions for:
- GameEngine class API design
- State machine implementation approach
- React integration pattern (hooks vs HOC vs render props)
- Migration strategy (big bang vs incremental)

## Phase 1: Design & Contracts (After Research)

**Objective**: Define GameEngine API contracts and data models.

**Deliverables**:
1. **data-model.md**: Entities (GameEngine, StateMachine, GameState, etc.)
2. **contracts/game-engine.md**: GameEngine class interface contract
3. **contracts/state-machine.md**: State transition rules and validation
4. **quickstart.md**: Example test scenarios for game engine

**Key Questions to Answer**:
- What methods does GameEngine expose? (initialize, advance, reset, getState, etc.)
- How do components subscribe to state changes?
- What are the state transition rules?
- How is determinism enforced and tested?

---

**Next Command**: This plan stops here. Run `/speckit.plan` workflow Phase 0 (research) and Phase 1 (design) to continue.
