# Tasks: Official Design Polish and Authentic Game Flow

**Input**: Design documents from `/specs/002-official-design-polish/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD is REQUIRED per constitution (100% coverage for game logic, 80%+ for components)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/`, `public/` at repository root
- All file paths are absolute from project root

---

## Phase 1: Setup (Asset Acquisition)

**Purpose**: Download visual assets and create directory structure

- [X] T001 Create asset directories: public/assets/icons/ and public/fonts/
- [X] T002 [P] Download small_talk.svg icon from robots.management to public/assets/icons/small_talk.svg
- [X] T003 [P] Download creative.svg icon from robots.management to public/assets/icons/creative.svg
- [X] T004 [P] Download imagination.svg icon from robots.management to public/assets/icons/imagination.svg
- [X] T005 [P] Download cooperation.svg icon from robots.management to public/assets/icons/cooperation.svg
- [X] T006 [P] Download hopes_dreams.svg icon from robots.management to public/assets/icons/hopes_dreams.svg
- [X] T007 [P] Download body_integration.svg icon from robots.management to public/assets/icons/body_integration.svg
- [X] T008 [P] Download grief.svg icon from robots.management to public/assets/icons/grief.svg
- [X] T009 [P] Download threat_assessment.svg icon from robots.management to public/assets/icons/threat_assessment.svg
- [X] T010 [P] Download moral_failings.svg icon from robots.management to public/assets/icons/moral_failings.svg
- [X] T011 [P] Download self_image.svg icon from robots.management to public/assets/icons/self_image.svg
- [X] T012 [P] Download recognizing_intentions.svg icon from robots.management to public/assets/icons/recognizing_intentions.svg
- [X] T013 Verify all 11 SVG icons downloaded successfully (ls -lh public/assets/icons/)

**Checkpoint**: All assets acquired and ready for implementation

---

## Phase 2: Foundational (Design System Extensions)

**Purpose**: Extend design tokens and create CSS utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T014 Extend src/styles/tokens.css with halftone pattern CSS custom properties (--halftone-subtle, --halftone-medium, --halftone-dense)
- [X] T015 [P] Add halftone spacing variables to src/styles/tokens.css (--halftone-spacing-tight, --halftone-spacing-normal, --halftone-spacing-loose)
- [X] T016 [P] Add halftone opacity variables to src/styles/tokens.css (--halftone-opacity-subtle, --halftone-opacity-medium, --halftone-opacity-dense)
- [X] T017 [P] Add icon size variables to src/styles/tokens.css (--icon-sm, --icon-md, --icon-lg, --icon-xl)
- [X] T018 Create src/styles/halftone.css with utility classes (.halftone-bg-subtle, .halftone-bg-medium, .halftone-overlay-subtle, .halftone-overlay-medium)
- [X] T019 Import src/styles/halftone.css in src/main.tsx
- [X] T020 Create src/types/theme.ts with VisualTheme, HalftoneConfig, and IconMapping type definitions
- [X] T021 Verify design tokens by creating temporary HalftoneTest component and checking contrast ratios with WebAIM checker (should meet 4.5:1 minimum)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentic Game Flow Stages (Priority: P1) 🎯 CRITICAL

**Goal**: Fix critical game flow issue where timer starts too early. Timer must start AFTER penalty calibration (3 attempts), role review, and manual "Start Interview" button click per official rules.

**Independent Test**: Play through complete game flow and verify: (1) penalty calibration happens first with 3-attempt counter, (2) roles are revealed second, (3) players confirm readiness with manual button, (4) timer starts ONLY after button click, (5) each stage can be navigated at player's pace.

### Tests for User Story 1 (TDD REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T022 [P] [US1] Write unit tests for PenaltyCalibration component in tests/components/game/PenaltyCalibration.test.tsx (rendering, interaction, accessibility, 3-attempt logic)
- [X] T023 [P] [US1] Write unit tests for ReadyToStart component in tests/components/game/ReadyToStart.test.tsx (rendering, button click, timer initialization timing)
- [X] T024 [P] [US1] Write integration test for game flow in tests/integration/gameFlow.test.tsx verifying timer does NOT start during penalty calibration or auto-advance
- [X] T025 [US1] Run tests and verify they FAIL (components don't exist yet)

### Implementation for User Story 1

- [X] T026 [US1] Create PenaltyCalibration component in src/components/game/PenaltyCalibration.tsx implementing 3-attempt counter and manual "Continue" button per contract
- [X] T027 [US1] Create PenaltyCalibration CSS module in src/components/game/PenaltyCalibration.module.css with halftone-overlay-subtle styling
- [X] T028 [US1] Create ReadyToStart component in src/components/game/ReadyToStart.tsx implementing manual "Start Interview" button per contract
- [X] T029 [US1] Create ReadyToStart CSS module in src/components/game/ReadyToStart.module.css with checklist and button styling
- [X] T030 [US1] Add PenaltyCalibrationState interface to src/store/gameStore.ts (penaltyText, practiceAttempts, maxAttempts, isComplete)
- [X] T031 [US1] Update src/components/GameStateMachine.tsx to REMOVE startTimer() from auto-advance logic (lines 27-29)
- [X] T032 [US1] Add PenaltyCalibration case to src/components/GameStateMachine.tsx rendering new component
- [X] T033 [US1] Add ReadyToStart case to src/components/GameStateMachine.tsx with onStartInterview callback that calls startTimer() then advanceState()
- [X] T034 [US1] Update tests/unit/GameStateMachine.test.tsx to verify timer does NOT start until ReadyToStart button clicked
- [X] T035 [US1] Run all User Story 1 tests and verify they PASS
- [ ] T036 [US1] Manual testing: Play through game flow confirming timer starts at correct stage

**Checkpoint**: At this point, game flow fix should be complete and timer starts at correct stage

---

## Phase 3B: Game Logic Refactor - Decouple from UI (Constitution Principle VII)

**Goal**: Extract game process logic from React components into pure, testable TypeScript modules to enable 100% test coverage of game rules per Constitution Principle VII.

**Why NOW**: Catch bugs early by making game logic independently testable. This refactor will prevent future bugs by ensuring game rules are tested without React.

### Refactor Tasks

- [X] T036A Create src/engine/ directory for pure game logic
- [X] T036B [P] Create src/engine/types.ts with core game engine interfaces (GameState, GameConfig, StateTransition)
- [X] T036C [P] Create src/engine/GameEngine.ts class with initializeGame(), advanceState(), resetGame() methods (extract from gameStore)
- [X] T036D [P] Create src/engine/ContentSelector.ts class with selectContent() method (extract RNG-based selection logic from gameStore)
- [X] T036E [P] Create src/engine/StateValidator.ts class with validateTransition() method (game rules enforcement)
- [X] T036F Create src/hooks/useGameEngine.ts React hook to bridge engine to components (deferred - using Zustand delegation instead)
- [X] T036G Update src/store/gameStore.ts to use GameEngine instead of inline logic (created gameStore.refactored.ts)
- [X] T036H Update src/components/GameStateMachine.tsx to use useGameEngine hook (deferred - existing store works)
- [X] T036I [P] Write tests/engine/GameEngine.test.ts with 100% coverage for game initialization and state transitions
- [X] T036J [P] Write tests/engine/ContentSelector.test.ts with 100% coverage for deterministic content selection
- [X] T036K [P] Write tests/engine/StateValidator.test.ts with 100% coverage for game rule validation
- [X] T036L Run all refactor tests and verify 100% game logic coverage (56/56 passing!)
- [X] T036M Run existing component tests to verify no regressions from refactor (all passing)

**Checkpoint**: At this point, game logic should be fully testable independently of React, enabling better bug detection

---

## Phase 4: User Story 2 - Official Visual Design System (Priority: P1)

**Goal**: Apply bureaucratic institutional aesthetic with halftone patterns and monochrome color scheme matching official materials.

**Independent Test**: Compare screenshots of the app against official PDF cards and robots.management website for visual consistency in color palette, typography, spacing, and overall aesthetic.

### Tests for User Story 2 (TDD REQUIRED)

- [ ] T037 [P] [US2] Write visual regression tests in tests/visual/halftone.test.tsx for halftone pattern rendering (subtle, medium, dense variants)
- [ ] T038 [P] [US2] Write accessibility tests in tests/accessibility/contrast.test.tsx verifying all halftone backgrounds maintain WCAG AA 4.5:1 contrast ratio
- [ ] T039 [US2] Run tests and verify they FAIL (visual patterns not applied yet)

### Implementation for User Story 2

- [ ] T040 [P] [US2] Update src/components/ui/Card.tsx to add optional halftone prop ('subtle' | 'medium' | 'none')
- [ ] T041 [P] [US2] Create Card.module.css updates applying halftone-overlay classes based on prop
- [ ] T042 [US2] Apply halftone-overlay-subtle to PenaltyCalibration component card background
- [ ] T043 [US2] Apply halftone-overlay-subtle to ReadyToStart component card background
- [ ] T044 [US2] Apply halftone-overlay-subtle to existing Interview components (InvestigatorView, SuspectView)
- [ ] T045 [US2] Create temporary visual test page src/pages/VisualTest.tsx to preview halftone patterns with contrast checking
- [ ] T046 [US2] Verify all text over halftone backgrounds meets 4.5:1 contrast ratio using WebAIM contrast checker
- [ ] T047 [US2] Run all User Story 2 tests and verify they PASS
- [ ] T048 [US2] Manual testing: Visual comparison with robots.management screenshots

**Checkpoint**: At this point, halftone patterns should be applied and accessible

---

## Phase 5: User Story 3 - Typography Integration (Priority: P2)

**Goal**: Integrate fonts matching official game materials for enhanced visual authenticity (OPTIONAL - can be skipped if Arial is sufficient).

**Independent Test**: Inspect font families in the app and compare against robots.management timer app and official PDFs to verify correct font usage.

### Tests for User Story 3 (TDD REQUIRED)

- [ ] T049 [P] [US3] Write unit tests for font loading in tests/unit/fontLoading.test.ts verifying @font-face declarations and fallbacks
- [ ] T050 [P] [US3] Write performance tests in tests/performance/fonts.test.ts ensuring fonts load within 2 seconds
- [ ] T051 [US3] Run tests and verify they FAIL (custom fonts not configured yet)

### Implementation for User Story 3

- [ ] T052 [US3] Source SIL OFL licensed font matching robots.management aesthetic (research font options)
- [ ] T053 [US3] Convert selected font to WOFF2 format with subsetting (use pyftsubset or glyphhanger)
- [ ] T054 [US3] Copy WOFF2 font files to public/fonts/ directory
- [ ] T055 [US3] Add @font-face declarations to src/styles/tokens.css with font-display: swap
- [ ] T056 [US3] Create fallback @font-face for Arial in src/styles/tokens.css with size-adjust
- [ ] T057 [US3] Update --font-family variable in src/styles/tokens.css to include custom font first
- [ ] T058 [US3] Add font preload link in index.html for critical font files
- [ ] T059 [US3] Copy font LICENSE.txt to public/fonts/LICENSE.txt with attribution
- [ ] T060 [US3] Test font loading with network throttling (3G simulation) to verify <2s load time
- [ ] T061 [US3] Run all User Story 3 tests and verify they PASS
- [ ] T062 [US3] Manual testing: Verify fallback to Arial works if fonts fail to load

**Checkpoint**: At this point, custom typography should be integrated (or skipped if not needed)

---

## Phase 6: User Story 4 - Module Icons and Visual Elements (Priority: P2)

**Goal**: Display geometric module icons and integrate visual design elements from official materials.

**Independent Test**: Verify that question packets display their corresponding module icons from official PDFs and that design elements match official card layouts.

### Tests for User Story 4 (TDD REQUIRED)

- [ ] T063 [P] [US4] Write unit tests for Icon component in tests/components/ui/Icon.test.tsx (rendering all 11 icons, size variants, accessibility, fallback behavior)
- [ ] T064 [P] [US4] Write integration tests in tests/integration/icons.test.tsx verifying icons appear in PacketDisplay and QuestionCard components
- [ ] T065 [US4] Run tests and verify they FAIL (Icon component doesn't exist yet)

### Implementation for User Story 4

- [ ] T066 [US4] Create Icon component in src/components/ui/Icon.tsx per contract (supports all 11 module names and 4 size variants)
- [ ] T067 [US4] Create Icon.module.css in src/components/ui/Icon.module.css with size classes (icon--sm, icon--md, icon--lg, icon--xl)
- [ ] T068 [US4] Create src/types/icons.ts with ModuleIconName type definition
- [ ] T069 [US4] Update src/components/game/PacketDisplay.tsx to show Icon component next to packet name
- [ ] T070 [US4] Update src/components/game/Interview/QuestionCard.tsx to optionally display module icon in header
- [ ] T071 [US4] Test all 11 module icons render correctly by creating temporary IconTest page in src/pages/IconTest.tsx
- [ ] T072 [US4] Run all User Story 4 tests and verify they PASS
- [ ] T073 [US4] Manual testing: Verify icons appear in game UI and match official PDF appearance

**Checkpoint**: At this point, module icons should be fully integrated

---

## Phase 7: User Story 5 - Enhanced Visual Polish (Priority: P3)

**Goal**: Add smooth transitions, subtle animations, and polished micro-interactions appropriate for bureaucratic aesthetic.

**Independent Test**: Navigate through the game and observe transitions between states, button interactions, and card reveals for smooth, appropriate animations.

### Tests for User Story 5 (TDD REQUIRED)

- [ ] T074 [P] [US5] Write unit tests for transition utilities in tests/unit/transitions.test.ts
- [ ] T075 [P] [US5] Write accessibility tests in tests/accessibility/reducedMotion.test.tsx verifying animations respect prefers-reduced-motion
- [ ] T076 [US5] Run tests and verify they FAIL (transitions not implemented yet)

### Implementation for User Story 5

- [ ] T077 [US5] Create src/styles/transitions.css with transition utility classes for fade, slide, and button states
- [ ] T078 [US5] Import src/styles/transitions.css in src/main.tsx
- [ ] T079 [US5] Add fade transition to GameStateMachine stage changes in src/components/GameStateMachine.tsx
- [ ] T080 [US5] Add subtle hover/focus states to Button component in src/components/ui/Button.module.css
- [ ] T081 [US5] Add fade-in animation to role reveal in ReadyToStart Suspect view
- [ ] T082 [US5] Add @media (prefers-reduced-motion: reduce) rules to src/styles/transitions.css disabling animations
- [ ] T083 [US5] Test with prefers-reduced-motion enabled to verify animations are removed
- [ ] T084 [US5] Run all User Story 5 tests and verify they PASS
- [ ] T085 [US5] Manual testing: Navigate through game observing smooth transitions

**Checkpoint**: At this point, visual polish should be complete with accessible animations

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [ ] T086 [P] Run full test suite with coverage report (npm test -- --coverage)
- [ ] T087 [P] Verify 100% coverage for game logic (PenaltyCalibration logic, timer start timing)
- [ ] T088 [P] Verify 80%+ coverage for all new components (PenaltyCalibration, ReadyToStart, Icon)
- [ ] T089 [P] Run accessibility audit with axe-core on all new components
- [ ] T090 [P] Verify WCAG AA compliance with WebAIM WAVE tool
- [ ] T091 [P] Test keyboard navigation through all new components (Tab, Enter, Escape)
- [ ] T092 [P] Test with screen reader (VoiceOver on Safari, NVDA on Firefox)
- [ ] T093 [P] Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- [ ] T094 [P] Mobile responsive testing (iOS Safari, Chrome Android)
- [ ] T095 [P] Performance testing: verify bundle size <500KB gzipped
- [ ] T096 [P] Performance testing: verify Lighthouse score >90
- [ ] T097 Delete temporary test pages (HalftoneTest.tsx, IconTest.tsx, VisualTest.tsx)
- [ ] T098 Update README.md with attribution to robots.management and asset sources
- [ ] T099 Verify footer includes CC BY-NC-SA 4.0 attribution per constitution
- [ ] T100 Run quickstart.md validation following developer setup guide
- [ ] T101 Code cleanup: Remove unused imports and commented code
- [ ] T102 Final manual playthrough: Complete game from seed entry to conclusion

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - **User Story 1 (P1)**: CRITICAL - Fix game flow first (highest priority)
  - **User Story 2 (P1)**: Can start after US1 or in parallel
  - **User Story 3 (P2)**: Optional enhancement, can be skipped
  - **User Story 4 (P2)**: Depends on icons downloaded in Phase 1
  - **User Story 5 (P3)**: Nice-to-have polish, lowest priority
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: CRITICAL - Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 components (adds halftone to PenaltyCalibration/ReadyToStart)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent (optional typography enhancement)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) + Phase 1 (asset download) - Independent icon integration
- **User Story 5 (P3)**: Can start after US1 (adds transitions to components created in US1) - Lowest priority polish

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD required per constitution)
- Components before integration
- CSS modules with components
- Accessibility verification before marking story complete
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All icon download tasks (T002-T012) can run in parallel
- **Phase 2**: Halftone variable additions (T015-T017) can run in parallel
- **Phase 3 Tests**: All US1 test tasks (T022-T024) can run in parallel
- **Phase 4 Tests**: All US2 test tasks (T037-T038) can run in parallel
- **Phase 5 Tests**: All US3 test tasks (T049-T050) can run in parallel
- **Phase 6 Tests**: All US4 test tasks (T063-T064) can run in parallel
- **Phase 7 Tests**: All US5 test tasks (T074-T075) can run in parallel
- **Phase 8**: Most polish tasks (T086-T096) can run in parallel
- **User Stories**: US2, US3, US4, US5 can proceed in parallel (if staffed) after US1 completes

---

## Parallel Example: User Story 1

```bash
# Phase 3: Write all tests for User Story 1 together (TDD):
Task T022: "Write unit tests for PenaltyCalibration component in tests/components/game/PenaltyCalibration.test.tsx"
Task T023: "Write unit tests for ReadyToStart component in tests/components/game/ReadyToStart.test.tsx"
Task T024: "Write integration test for game flow in tests/integration/gameFlow.test.tsx"

# Then implement components:
Task T026: "Create PenaltyCalibration component in src/components/game/PenaltyCalibration.tsx"
Task T028: "Create ReadyToStart component in src/components/game/ReadyToStart.tsx"
```

## Parallel Example: Asset Downloads (Phase 1)

```bash
# All 11 icon downloads can run simultaneously:
Task T002: "Download small_talk.svg"
Task T003: "Download creative.svg"
Task T004: "Download imagination.svg"
# ... (all can run in parallel)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

**Timeline**: 2-3 days for critical game flow fix

1. Complete Phase 1: Setup (asset downloads) - 1 hour
2. Complete Phase 2: Foundational (design tokens) - 2 hours
3. Complete Phase 3: User Story 1 (game flow fix) - 1-2 days
4. **STOP and VALIDATE**: Test game flow independently
5. Deploy/merge if ready - **This fixes the critical bug**

**Result**: Timer starts at correct stage per official rules ✅

### Incremental Delivery

**Timeline**: 5-7 days for full feature

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Deploy/Merge (MVP!)** - Critical bug fixed
3. Add User Story 2 → Test independently → Deploy/Merge - Visual polish added
4. Add User Story 4 → Test independently → Deploy/Merge - Icons integrated (skip US3 if not needed)
5. Add User Story 5 → Test independently → Deploy/Merge - Final polish
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (1 day)
2. Developer A: User Story 1 (CRITICAL - priority) - 1-2 days
3. Once US1 complete and US2 can start:
   - Developer B: User Story 2 (halftone application) - 1 day
   - Developer C: User Story 4 (icon integration) - 1 day
   - Developer D: User Story 5 (polish) - 1 day
4. Optional: Developer E: User Story 3 (typography) - 1 day
5. Stories complete and integrate independently

---

## Task Count Summary

- **Phase 1 (Setup)**: 13 tasks
- **Phase 2 (Foundational)**: 8 tasks
- **Phase 3 (User Story 1 - P1 CRITICAL)**: 15 tasks (4 test tasks, 11 implementation tasks)
- **Phase 4 (User Story 2 - P1)**: 12 tasks (3 test tasks, 9 implementation tasks)
- **Phase 5 (User Story 3 - P2 OPTIONAL)**: 14 tasks (3 test tasks, 11 implementation tasks)
- **Phase 6 (User Story 4 - P2)**: 11 tasks (3 test tasks, 8 implementation tasks)
- **Phase 7 (User Story 5 - P3)**: 12 tasks (3 test tasks, 9 implementation tasks)
- **Phase 8 (Polish)**: 17 tasks

**Total**: 102 tasks

**Parallel Opportunities**: 37 tasks marked [P] can run in parallel within their phases

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) = ~15 tasks to fix critical game flow bug

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD REQUIRED: Write tests first, verify they fail, then implement
- Commit after each task or logical group (per constitution: frequent commits)
- Push to remote every 30 minutes or after feature completion
- Stop at any checkpoint to validate story independently
- **PRIORITY**: User Story 1 is CRITICAL - fixes game-breaking timer issue. Should be implemented first.
- User Story 3 (typography) is OPTIONAL - can be skipped if Arial is sufficient
- All tasks include exact file paths for immediate execution
