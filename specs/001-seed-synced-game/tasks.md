# Tasks: Seed-Synced Inhuman Conditions Web Game

**Input**: Design documents from `/specs/001-seed-synced-game/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: This project follows TDD methodology - tests are REQUIRED and must be written FIRST (Red → Green → Refactor).

**Coverage Targets**:
- Game logic (src/lib/): 100% required
- Components (src/components/): 80%+ required

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project structure (from plan.md):
- `src/` - Source code at repository root
- `tests/` - Test files
- Single-page application (SPA) with Vite + React + TypeScript

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create directory structure: src/{components,data,hooks,lib,store,styles,types}, tests/{unit,integration}
- [X] T002 Configure TypeScript with strict mode in tsconfig.json
- [X] T003 [P] Configure Vitest in vitest.config.ts with React plugin and jsdom environment
- [X] T004 [P] Create test setup file in src/test/setup.ts with @testing-library/react
- [X] T005 [P] Create design tokens in src/styles/tokens.css (colors, typography, spacing from robots.management)
- [X] T006 [P] Create global styles in src/styles/global.css (CSS reset, bureaucratic aesthetic)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### TypeScript Type Definitions

- [X] T007 [P] Create Seed types in src/types/seed.ts (Seed, SeedValidation)
- [X] T008 [P] Create GameMode and PlayerRole enums in src/types/game-mode.ts
- [X] T009 [P] Create GameState enum in src/types/game-state.ts (10 states)
- [X] T010 [P] Create Packet types in src/types/packet.ts (Packet, Question, PacketRole)
- [X] T011 [P] Create Role types in src/types/role.ts (RoleType, RoleAssignment, RobotFault)
- [X] T012 [P] Create Penalty type in src/types/penalty.ts
- [X] T013 [P] Create Background type in src/types/background.ts
- [X] T014 [P] Create InducerPattern types in src/types/inducer.ts (Direction, Cell, InducerPattern)
- [X] T015 [P] Create Determination types in src/types/outcome.ts (Determination, GameOutcome)
- [X] T016 Create index barrel export in src/types/index.ts

### Core Game Logic (100% Coverage Required)

> **TDD CRITICAL**: Write tests FIRST for each module, ensure they FAIL, then implement

- [X] T017 [P] Write GameRNG tests in src/lib/GameRNG.test.ts (determinism, range, shuffle, choice, edge cases)
- [X] T018 Implement GameRNG class in src/lib/GameRNG.ts using seedrandom (verify tests pass)
- [X] T019 [P] Write seed generation tests in src/lib/seedGeneration.test.ts (UTC rounding, validation, random generation)
- [X] T020 Implement seed generation utilities in src/lib/seedGeneration.ts (verify tests pass)
- [X] T021 [P] Write inducer pattern tests in src/lib/inducerPattern.test.ts (5x5 grid generation, connections, determinism)
- [X] T022 Implement inducer pattern generation in src/lib/inducerPattern.ts (verify tests pass)

### Zustand Store Foundation

- [ ] T023 [P] Write game store tests in src/store/gameStore.test.ts (seed initialization, state transitions, deterministic content selection)
- [ ] T024 Create Zustand game store in src/store/gameStore.ts with complete API from contracts/game-state-api.md (verify tests pass)

### Base UI Components

- [ ] T025 [P] Write Button component tests in src/components/ui/Button.test.tsx
- [ ] T026 [P] Implement Button component in src/components/ui/Button.tsx with CSS Module src/components/ui/Button.module.css
- [ ] T027 [P] Write Card component tests in src/components/ui/Card.test.tsx
- [ ] T028 [P] Implement Card component in src/components/ui/Card.tsx with CSS Module src/components/ui/Card.module.css
- [ ] T029 [P] Write ProgressIndicator component tests in src/components/ui/ProgressIndicator.test.tsx
- [ ] T030 [P] Implement ProgressIndicator component in src/components/ui/ProgressIndicator.tsx with CSS Module

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Single Device Gameplay (Priority: P1) 🎯 MVP

**Goal**: Two players sitting together use one device to play a complete 5-minute interrogation game from seed entry to conclusion

**Independent Test**: Two people can complete one game session from seed entry to conclusion, demonstrating all game states work and role information is properly managed

### Game Data Files

- [ ] T031 [P] [US1] Create packets data file in src/data/packets.ts (11 themed question sets with roles)
- [ ] T032 [P] [US1] Create penalties data file in src/data/penalties.ts (18 penalties)
- [ ] T033 [P] [US1] Create backgrounds data file in src/data/backgrounds.ts (30 suspect backgrounds)
- [ ] T034 [P] [US1] Create roles data file in src/data/roles.ts (Human, PatientRobot, ViolentRobot with faults)

### Game State Components - Tests First

> **TDD**: Write ALL component tests FIRST, see them FAIL

- [ ] T035 [P] [US1] Write SeedEntry component tests in src/components/game/SeedEntry.test.tsx (validation, generate seed, start game)
- [ ] T036 [P] [US1] Write PenaltyCalibration component tests in src/components/game/PenaltyCalibration.test.tsx (3 attempts, continue)
- [ ] T037 [P] [US1] Write PacketDisplay component tests in src/components/game/PacketDisplay.test.tsx (show packet, questions, continue)
- [ ] T038 [P] [US1] Write InducerPuzzle component tests in src/components/game/InducerPuzzle.test.tsx (5x5 grid, connections, solution)
- [ ] T039 [P] [US1] Write BackgroundDisplay component tests in src/components/game/BackgroundDisplay.test.tsx (show background, continue)
- [ ] T040 [P] [US1] Write ReadyToStart component tests in src/components/game/ReadyToStart.test.tsx (ready button, start timer)
- [ ] T041 [P] [US1] Write CountdownTimer component tests in src/components/ui/CountdownTimer.test.tsx (300s countdown, MM:SS format, onElapsed)
- [ ] T042 [P] [US1] Write InvestigatorView component tests in src/components/game/Interview/InvestigatorView.test.tsx (questions, timer, determination)
- [ ] T043 [P] [US1] Write SuspectView component tests in src/components/game/Interview/SuspectView.test.tsx (role, traits, background, timer, hide/show)
- [ ] T044 [P] [US1] Write Conclusion component tests in src/components/game/Conclusion.test.tsx (determination, actual role, outcome, play again)

### Game State Components - Implementation

> **TDD**: Implement to make tests pass

- [ ] T045 [P] [US1] Implement SeedEntry component in src/components/game/SeedEntry.tsx with CSS Module (verify tests pass)
- [ ] T046 [P] [US1] Implement PenaltyCalibration component in src/components/game/PenaltyCalibration.tsx with CSS Module (verify tests pass)
- [ ] T047 [P] [US1] Implement PacketDisplay component in src/components/game/PacketDisplay.tsx with CSS Module (verify tests pass)
- [ ] T048 [US1] Implement InducerPuzzle component in src/components/game/InducerPuzzle.tsx with CSS Module (depends on T022, verify tests pass)
- [ ] T049 [P] [US1] Implement BackgroundDisplay component in src/components/game/BackgroundDisplay.tsx with CSS Module (verify tests pass)
- [ ] T050 [P] [US1] Implement ReadyToStart component in src/components/game/ReadyToStart.tsx with CSS Module (verify tests pass)
- [ ] T051 [P] [US1] Implement CountdownTimer component in src/components/ui/CountdownTimer.tsx with CSS Module (verify tests pass)
- [ ] T052 [US1] Implement InvestigatorView component in src/components/game/Interview/InvestigatorView.tsx with CSS Module (depends on T051, verify tests pass)
- [ ] T053 [US1] Implement SuspectView component in src/components/game/Interview/SuspectView.tsx with CSS Module (depends on T051, verify tests pass)
- [ ] T054 [P] [US1] Implement Conclusion component in src/components/game/Conclusion.tsx with CSS Module (verify tests pass)

### Game State Machine

- [ ] T055 [US1] Write GameStateMachine component tests in src/components/GameStateMachine.test.tsx (state rendering, transitions, role-based views)
- [ ] T056 [US1] Implement GameStateMachine component in src/components/GameStateMachine.tsx (verify tests pass)

### App Integration

- [ ] T057 [US1] Update App.tsx to render GameStateMachine component
- [ ] T058 [US1] Write integration test for complete game flow in tests/integration/test_complete_game_flow.test.tsx (seed → conclusion)
- [ ] T059 [US1] Run integration test and verify User Story 1 is fully functional

**Checkpoint**: At this point, User Story 1 (single-device gameplay) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Multi-Device Synchronized Gameplay (Priority: P2)

**Goal**: Two players on separate devices play simultaneously by entering the same seed, manually coordinating state transitions

**Independent Test**: Two devices entering same seed, advancing through all states together, verifying identical game content appears on both devices

### Tests First

- [ ] T060 [P] [US2] Write ModeSelector component tests in src/components/game/ModeSelector.test.tsx (single/multi/timer modes)
- [ ] T061 [P] [US2] Write RoleSelection component tests in src/components/game/RoleSelection.test.tsx (investigator/suspect/spectator)
- [ ] T062 [P] [US2] Write SyncCheck component tests in src/components/ui/SyncCheck.test.tsx (state hash display)

### Implementation

- [ ] T063 [P] [US2] Implement ModeSelector component in src/components/game/ModeSelector.tsx with CSS Module (verify tests pass)
- [ ] T064 [P] [US2] Implement RoleSelection component in src/components/game/RoleSelection.tsx with CSS Module (verify tests pass)
- [ ] T065 [P] [US2] Implement SyncCheck component in src/components/ui/SyncCheck.tsx with CSS Module (verify tests pass)

### GameStateMachine Updates

- [ ] T066 [US2] Update GameStateMachine component to include ModeSelection and RoleSelection states
- [ ] T067 [US2] Add role-based view rendering logic (Investigator/Suspect views in multi-device mode)

### Integration Testing

- [ ] T068 [US2] Write multi-device sync test in tests/integration/test_multi_device_sync.test.tsx (two stores, same seed, identical content)
- [ ] T069 [US2] Run integration test and verify User Story 2 works independently

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - First-Time Player Tutorial (Priority: P2)

**Goal**: New visitor is automatically guided through interactive tutorial explaining seed synchronization, role selection, and game flow

**Independent Test**: Opening game in fresh browser session (no cookies) and completing tutorial walkthrough

### Cookie Persistence

- [ ] T070 [P] [US3] Write tutorial cookie tests in src/lib/tutorialCookie.test.ts (has completed, mark complete, persistence)
- [ ] T071 [P] [US3] Implement tutorial cookie utilities in src/lib/tutorialCookie.ts using js-cookie (verify tests pass)

### Tutorial Components - Tests First

- [ ] T072 [P] [US3] Write TutorialFlow component tests in src/components/tutorial/TutorialFlow.test.tsx (step progression, completion, cookie)
- [ ] T073 [P] [US3] Write TutorialStep component tests in src/components/tutorial/TutorialStep.test.tsx (content display, navigation)
- [ ] T074 [P] [US3] Write TutorialProgress component tests in src/components/tutorial/TutorialProgress.test.tsx (dot indicators)

### Tutorial Components - Implementation

- [ ] T075 [P] [US3] Implement TutorialFlow component in src/components/tutorial/TutorialFlow.tsx with CSS Module (verify tests pass)
- [ ] T076 [P] [US3] Implement TutorialStep component in src/components/tutorial/TutorialStep.tsx with CSS Module (verify tests pass)
- [ ] T077 [P] [US3] Implement TutorialProgress component in src/components/tutorial/TutorialProgress.tsx with CSS Module (verify tests pass)

### Tutorial Content

- [ ] T078 [US3] Create tutorial content data in src/data/tutorialSteps.ts (9 steps: welcome, seed explanation, mode, role, penalty, packet, inducer, interview, conclusion)

### App Integration

- [ ] T079 [US3] Update App.tsx to auto-display tutorial on first visit (check cookie)
- [ ] T080 [US3] Add "Replay Tutorial" option to settings/menu
- [ ] T081 [US3] Write tutorial integration test in tests/integration/test_tutorial_flow.test.tsx
- [ ] T082 [US3] Run integration test and verify User Story 3 works independently

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Automatic Seed Generation (Priority: P3)

**Goal**: Players can use auto-generated seeds based on UTC time or cryptographically random seeds

**Independent Test**: Loading game at different times within same 5-minute window and verifying identical default seeds

**Note**: Core functionality implemented in Phase 2 (T020). This phase adds UI integration and testing.

### UI Integration

- [ ] T083 [US4] Update SeedEntry component to display default seed suggestion on load
- [ ] T084 [US4] Add "Randomize Seed" button to SeedEntry component
- [ ] T085 [US4] Write seed generation integration test in tests/integration/test_seed_generation.test.tsx (UTC rounding, random generation)
- [ ] T086 [US4] Run integration test and verify User Story 4 works independently

**Checkpoint**: Automatic seed generation fully integrated

---

## Phase 7: User Story 5 - Timer-Only Mode (Priority: P3)

**Goal**: Players using physical cards can use simple 5-minute countdown timer without game content

**Independent Test**: Accessing timer-only URL and verifying countdown works independently of game logic

### Tests First

- [ ] T087 [P] [US5] Write TimerOnlyPage component tests in src/components/TimerOnlyPage.test.tsx (timer display, no game content)

### Implementation

- [ ] T088 [P] [US5] Implement TimerOnlyPage component in src/components/TimerOnlyPage.tsx with CSS Module (verify tests pass)

### Router Setup

- [ ] T089 [US5] Install react-router-dom dependency
- [ ] T090 [US5] Configure HashRouter in src/main.tsx (for GitHub Pages compatibility)
- [ ] T091 [US5] Add route for /timer-only to TimerOnlyPage
- [ ] T092 [US5] Add navigation between timer-only and full game modes
- [ ] T093 [US5] Write timer-only integration test in tests/integration/test_timer_only.test.tsx
- [ ] T094 [US5] Run integration test and verify User Story 5 works independently

**Checkpoint**: Timer-only mode accessible and functional

---

## Phase 8: User Story 6 - Spectator Observation (Priority: P3)

**Goal**: Additional players can follow along with ongoing game without seeing secret information

**Independent Test**: Third device entering same seed, selecting spectator role, verifying read-only view

### Tests First

- [ ] T095 [P] [US6] Write SpectatorView component tests in src/components/game/Interview/SpectatorView.test.tsx (questions visible, no role info, read-only)

### Implementation

- [ ] T096 [P] [US6] Implement SpectatorView component in src/components/game/Interview/SpectatorView.tsx with CSS Module (verify tests pass)

### GameStateMachine Updates

- [ ] T097 [US6] Update GameStateMachine to render SpectatorView when playerRole is Spectator
- [ ] T098 [US6] Write spectator integration test in tests/integration/test_spectator_mode.test.tsx
- [ ] T099 [US6] Run integration test and verify User Story 6 works independently

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation & Attribution

- [ ] T100 [P] Create AboutPage component in src/components/AboutPage.tsx with credits and CC BY-NC-SA 4.0 license
- [ ] T101 [P] Add footer to App.tsx with attribution (Tommy Maranges, Cory O'Brien, Mac Schubert) and license link
- [ ] T102 [P] Add GitHub repository link in footer for issue reporting
- [ ] T103 [P] Update README.md with setup instructions, gameplay guide, and legal notices

### Accessibility Audit

- [ ] T104 [P] Run axe-core accessibility tests on all components in tests/accessibility/
- [ ] T105 Ensure all interactive elements have keyboard navigation (tab, enter, space)
- [ ] T106 Add ARIA labels to complex components (timer, inducer puzzle, role toggle)
- [ ] T107 Verify color contrast meets WCAG 2.1 Level AA (4.5:1 for normal text)
- [ ] T108 Test with screen reader (NVDA or VoiceOver) and fix issues

### Performance Optimization

- [ ] T109 [P] Run bundle size analysis with rollup-plugin-visualizer
- [ ] T110 Verify bundle size < 500KB gzipped (per constitution)
- [ ] T111 Add code splitting for tutorial components (lazy load with React.lazy)
- [ ] T112 Optimize CSS (remove unused styles, combine duplicates)
- [ ] T113 Run Lighthouse audit and achieve score > 90 for performance, accessibility, best practices

### Cross-Browser Testing

- [ ] T114 Test in Chrome 90+ (desktop and mobile)
- [ ] T115 Test in Firefox 88+
- [ ] T116 Test in Safari 14+ (desktop and iOS)
- [ ] T117 Test in Edge 90+
- [ ] T118 Fix any browser-specific issues

### Additional Testing

- [ ] T119 [P] Add unit tests for any uncovered edge cases to reach coverage targets
- [ ] T120 Run full test suite with coverage report (npm run test:coverage)
- [ ] T121 Verify game logic has 100% coverage (src/lib/)
- [ ] T122 Verify components have 80%+ coverage (src/components/)

### Deployment Preparation

- [ ] T123 Configure Vite build for GitHub Pages (base: '/inhuman-conditions/')
- [ ] T124 Create GitHub Actions workflow in .github/workflows/ci.yml (test, build on PR)
- [ ] T125 Create GitHub Actions workflow in .github/workflows/deploy.yml (deploy to gh-pages on main push)
- [ ] T126 Test production build locally (npm run build && npm run preview)
- [ ] T127 Deploy to GitHub Pages and verify live site works

### Final Validation

- [ ] T128 Complete manual playthrough following quickstart.md validation section
- [ ] T129 Verify all functional requirements from spec.md are met
- [ ] T130 Verify all success criteria from spec.md are achieved

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3 → P3 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Phase 3**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2) - Phase 4**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 3 (P2) - Phase 5**: Can start after Foundational (Phase 2) - Independent from US1/US2
- **User Story 4 (P3) - Phase 6**: Can start after Foundational (Phase 2) - Minor addition to US1
- **User Story 5 (P3) - Phase 7**: Can start after Foundational (Phase 2) - Independent feature
- **User Story 6 (P3) - Phase 8**: Can start after Foundational (Phase 2) - Builds on US2 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD Red phase)
- Implementation makes tests pass (TDD Green phase)
- Refactor while keeping tests green
- Models/data before components
- Components before integration
- Integration tests verify story completeness
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 - Setup:**
- T003, T004, T005, T006 can all run in parallel

**Phase 2 - Foundational:**
- All type definition tasks (T007-T016) can run in parallel
- Test writing (T017, T019, T021, T023) can run in parallel
- Base UI component tests (T025, T027, T029) can run in parallel
- Base UI component implementations (T026, T028, T030) can run in parallel after their tests

**Phase 3 - User Story 1:**
- Game data files (T031-T034) can all run in parallel
- All component tests (T035-T044) can all run in parallel (write tests together)
- Component implementations can run in parallel after tests: T045, T046, T047, T049, T050, T051, T054

**Phase 4 - User Story 2:**
- Tests (T060-T062) can run in parallel
- Implementations (T063-T065) can run in parallel after tests

**Phase 5 - User Story 3:**
- Tests (T072-T074) can run in parallel
- Implementations (T075-T077) can run in parallel after tests

**Phase 9 - Polish:**
- Documentation tasks (T100-T103) can run in parallel
- Accessibility audit tasks (T104-T108) can run in parallel
- Performance tasks (T109-T113) can run in parallel
- Browser testing (T114-T118) can run in parallel

**User Story Parallelization:**
- Once Foundational (Phase 2) completes, multiple developers can work on different user stories:
  - Developer A: User Story 1 (Phase 3)
  - Developer B: User Story 3 (Phase 5) - independent
  - Developer C: User Story 5 (Phase 7) - independent after US1 timer component

---

## Parallel Example: User Story 1 - Single Device Gameplay

```bash
# Launch all component tests for User Story 1 together (TDD Red phase):
Task T035: "Write SeedEntry component tests"
Task T036: "Write PenaltyCalibration component tests"
Task T037: "Write PacketDisplay component tests"
Task T038: "Write InducerPuzzle component tests"
Task T039: "Write BackgroundDisplay component tests"
Task T040: "Write ReadyToStart component tests"
Task T041: "Write CountdownTimer component tests"
Task T042: "Write InvestigatorView component tests"
Task T043: "Write SuspectView component tests"
Task T044: "Write Conclusion component tests"

# Then launch parallelizable implementations together (TDD Green phase):
Task T045: "Implement SeedEntry component"
Task T046: "Implement PenaltyCalibration component"
Task T047: "Implement PacketDisplay component"
Task T049: "Implement BackgroundDisplay component"
Task T050: "Implement ReadyToStart component"
Task T051: "Implement CountdownTimer component"
Task T054: "Implement Conclusion component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T030) - CRITICAL
3. Complete Phase 3: User Story 1 (T031-T059)
4. **STOP and VALIDATE**: Play through complete game session
5. Fix any issues found
6. Deploy/demo if ready

**Time Estimate**: 2-3 weeks for MVP (based on plan.md)

### Incremental Delivery

1. MVP (Phase 1+2+3) → Test independently → Deploy (Single-device game works!)
2. Add User Story 2 (Phase 4) → Test independently → Deploy (Multi-device sync works!)
3. Add User Story 3 (Phase 5) → Test independently → Deploy (Tutorial onboarding works!)
4. Add User Story 4 (Phase 6) → Test independently → Deploy (Auto-seed generation works!)
5. Add User Story 5 (Phase 7) → Test independently → Deploy (Timer-only mode works!)
6. Add User Story 6 (Phase 8) → Test independently → Deploy (Spectator mode works!)
7. Polish (Phase 9) → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

**Week 1-2**: Everyone on Foundational (Phase 2) together
**Week 3-4**:
- Developer A: User Story 1 (Phase 3) - Core game
- Developer B: User Story 3 (Phase 5) - Tutorial (independent)
- Developer C: User Story 5 (Phase 7) - Timer-only (independent)

**Week 5**:
- Developer A: User Story 2 (Phase 4) - Multi-device (builds on US1)
- Developer B: User Story 4 (Phase 6) - Seed generation (minor addition)
- Developer C: User Story 6 (Phase 8) - Spectator (builds on US2)

**Week 6**: Everyone on Polish (Phase 9) together

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability
- **TDD is mandatory** - write tests FIRST, see them FAIL, then implement
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red phase)
- Implement minimal code to pass tests (Green phase)
- Refactor while keeping tests green
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Coverage targets: 100% for game logic, 80%+ for components
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

- **Total Tasks**: 130
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 24 tasks
- **Phase 3 (US1 - Single Device)**: 29 tasks ⭐ MVP
- **Phase 4 (US2 - Multi-Device)**: 10 tasks
- **Phase 5 (US3 - Tutorial)**: 13 tasks
- **Phase 6 (US4 - Auto Seed)**: 4 tasks
- **Phase 7 (US5 - Timer-Only)**: 8 tasks
- **Phase 8 (US6 - Spectator)**: 5 tasks
- **Phase 9 (Polish)**: 31 tasks

**Parallel Opportunities**: 67 tasks marked [P] can run in parallel within their phase

**MVP Scope** (Phases 1+2+3): 59 tasks
**Full Feature Set**: All 130 tasks

**Estimated Timeline** (from plan.md):
- MVP: 2-3 weeks (single developer)
- Full feature set: 5-6 weeks (single developer)
- With 3 developers: 3-4 weeks (full feature set)
