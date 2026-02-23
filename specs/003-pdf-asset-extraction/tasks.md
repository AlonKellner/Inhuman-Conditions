---
description: "Task list for PDF Asset Integration (US5)"
---

# Tasks: PDF Asset Integration (US5)

**Input**: Design documents from `/specs/003-pdf-asset-extraction/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Context**: User Stories 1-4 (download, labeling, extraction, validation) are **COMPLETE**. 225 assets extracted and validated. This task list covers **User Story 5 (Game Integration) ONLY**.

**Tests**: Included - TDD approach per constitution requirement (100% coverage for game logic)

**Organization**: Tasks organized for sequential implementation with parallel opportunities marked [P]

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US5]**: All tasks belong to User Story 5 (Game Integration)
- Include exact file paths in descriptions

## Path Conventions

Project structure:
- `src/` - TypeScript source code at repository root
- `tests/` - Test files at repository root
- `public/` - Static assets (card images already present)
- `specs/003-pdf-asset-extraction/contracts/` - TypeScript interface contracts (reference)

---

## Phase 1: Setup (TypeScript Interfaces & Utilities)

**Purpose**: Update TypeScript interfaces and create utility functions for card image path generation

**⚠️ CRITICAL**: These tasks update core type definitions - all subsequent tasks depend on this phase

- [X] T001 [P] Update CatalyzerCard interface with optional cardImage field in src/data/catalyzerCards.ts
- [X] T002 [P] Update Question interface with optional cardImage field in src/types/packet.ts
- [X] T003 [P] Update Packet interface with optional coverSheetImage field in src/types/packet.ts
- [X] T004 [P] Create card image path utilities in src/utils/cardImagePaths.ts (getSuspectCardImagePath, getInvestigatorCardImagePath, validateCardImagePath, MODULE_MAPPING)
- [X] T005 Verify TypeScript compilation succeeds with 0 errors (run npx tsc --noEmit)

**Checkpoint**: TypeScript interfaces updated, utilities created, compilation succeeds ✅

---

## Phase 2: User Story 5 - Game Integration (Priority: P5) 🎯

**Goal**: Integrate 225 extracted PDF card images into TypeScript game data so players see official game components instead of custom UI widgets

**Independent Test**: Run game in browser, verify catalyzer cards display official PNG images instead of custom widgets, verify investigator questions display card images, verify TypeScript compilation passes, verify all tests pass

### Tests for User Story 5 (TDD - Write These First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

**Unit Tests for Utilities:**

- [X] T006 [P] [US5] Test getSuspectCardImagePath generates correct paths for human cards in tests/unit/utils/cardImagePaths.test.ts
- [X] T007 [P] [US5] Test getSuspectCardImagePath generates correct paths for patient cards in tests/unit/utils/cardImagePaths.test.ts
- [X] T008 [P] [US5] Test getSuspectCardImagePath generates correct paths for violent cards in tests/unit/utils/cardImagePaths.test.ts
- [X] T009 [P] [US5] Test getInvestigatorCardImagePath generates correct paths for cover sheets in tests/unit/utils/cardImagePaths.test.ts
- [X] T010 [P] [US5] Test getInvestigatorCardImagePath generates correct paths for primary prompts in tests/unit/utils/cardImagePaths.test.ts
- [X] T011 [P] [US5] Test getInvestigatorCardImagePath generates correct paths for secondary prompts in tests/unit/utils/cardImagePaths.test.ts
- [X] T012 [P] [US5] Test validateCardImagePath accepts valid suspect card paths in tests/unit/utils/cardImagePaths.test.ts
- [X] T013 [P] [US5] Test validateCardImagePath rejects invalid paths in tests/unit/utils/cardImagePaths.test.ts
- [X] T014 [P] [US5] Test MODULE_MAPPING correctly maps all 11 modules in tests/unit/utils/cardImagePaths.test.ts

**Integration Tests for Components:**

- [X] T015 [P] [US5] Test CatalyzerCardImage renders card image when cardImage is present in tests/integration/components/CatalyzerCardImage.test.tsx
- [X] T016 [P] [US5] Test CatalyzerCardImage renders fallback widget when cardImage is undefined in tests/integration/components/CatalyzerCardImage.test.tsx
- [X] T017 [P] [US5] Test CatalyzerCardImage has correct alt text for accessibility in tests/integration/components/CatalyzerCardImage.test.tsx
- [X] T018 [P] [US5] Test CatalyzerCardImage lazy-loads images in tests/integration/components/CatalyzerCardImage.test.tsx
- [X] T019 [P] [US5] Test QuestionCardImage renders card image when cardImage is present in tests/integration/components/QuestionCardImage.test.tsx
- [X] T020 [P] [US5] Test QuestionCardImage renders fallback text when cardImage is undefined in tests/integration/components/QuestionCardImage.test.tsx
- [X] T021 [P] [US5] Test QuestionCardImage has correct alt text for accessibility in tests/integration/components/QuestionCardImage.test.tsx

**Run All Tests to Verify They FAIL:**

- [X] T022 [US5] Run npm test to verify all new tests fail (expected - implementation not done yet)

**Checkpoint**: Tests written and failing as expected ✅

### Implementation for User Story 5

**Create Card Display Components:**

- [X] T023 [P] [US5] Create CatalyzerCardImage component with image rendering and fallback logic in src/components/cards/CatalyzerCardImage.tsx
- [X] T024 [P] [US5] Create QuestionCardImage component with image rendering and fallback logic in src/components/cards/QuestionCardImage.tsx
- [X] T025 [P] [US5] Create card image CSS styles (responsive, lazy-loading, fallback widgets) in src/styles/cards.css

**Update Data Files with Card Image Paths:**

> **Reference**: Use `extraction/typescript_integration_guide.md` for exact asset paths

- [X] T026 [US5] Update catalyzerCards.ts with cardImage paths for all 99 suspect cards in src/data/catalyzerCards.ts (use getSuspectCardImagePath utility)
- [X] T027 [US5] Update packets.ts with coverSheetImage paths for all 11 modules in src/data/packets.ts (use getInvestigatorCardImagePath utility)
- [X] T028 [US5] Update packets.ts with cardImage paths for all primary questions in src/data/packets.ts (use getInvestigatorCardImagePath utility)
- [X] T029 [US5] Update packets.ts with cardImage paths for all secondary questions in src/data/packets.ts (use getInvestigatorCardImagePath utility)

**Update Existing Game UI Components:**

- [X] T030 [US5] Update RoleReveal component to use CatalyzerCardImage instead of custom widget in src/components/game/RoleReveal.tsx
- [X] T031 [US5] Update InterviewPhase component to use QuestionCardImage instead of custom text display in src/components/game/InterviewPhase.tsx

**Verify Implementation:**

- [X] T032 [US5] Run npm run typecheck to verify TypeScript compilation succeeds (0 errors)
- [X] T033 [US5] Run npm test to verify all tests pass (unit + integration)
- [X] T034 [US5] Run npm run build to verify production build succeeds and bundle size < 500KB gzipped

**Checkpoint**: User Story 5 implementation complete - all tests passing, TypeScript compiles, game displays card images ✅

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance validation, and documentation

**Accessibility Validation:**

- [ ] T035 [P] Verify all card images have descriptive alt text (manual check)
- [ ] T036 [P] Test keyboard navigation for card viewing (Tab, Enter, Space)
- [ ] T037 [P] Test screen reader announces card content correctly (VoiceOver/NVDA)
- [ ] T038 [P] Run WCAG AA contrast checker on card images (4.5:1 minimum)

**Performance Validation:**

- [ ] T039 [P] Verify bundle size < 500KB gzipped (run npm run build and check output)
- [ ] T040 [P] Verify card images are lazy-loaded (check Network tab in browser DevTools)
- [ ] T041 [P] Run Lighthouse performance audit (score > 90 target)
- [ ] T042 [P] Test game on mobile devices (iOS Safari, Chrome Android) for responsive card display

**Manual Testing:**

- [ ] T043 Start dev server (npm run dev) and manually test game flow
- [ ] T044 Verify role reveal shows catalyzer card image (not custom widget)
- [ ] T045 Verify inducer maze still displays correctly alongside card image
- [ ] T046 Verify interview phase shows question card images
- [ ] T047 Verify all 11 modules load correctly with card images
- [ ] T048 Verify no console errors or 404s for missing images
- [ ] T049 Verify fallback widgets work by temporarily removing cardImage field from one card

**Documentation:**

- [ ] T050 [P] Update README.md with card image integration notes (if needed)
- [ ] T051 [P] Document integration guide reference in extraction/typescript_integration_guide.md

**Final Validation:**

- [ ] T052 Run quickstart.md validation steps (Section 7 - Validate Integration)
- [ ] T053 Verify all 225 assets are correctly integrated and displaying
- [ ] T054 Run full test suite one final time (npm test)

**Checkpoint**: Integration complete, accessible, performant, and documented ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Tasks T001-T004 can run in parallel [P]
  - Task T005 depends on T001-T004 completion
- **User Story 5 (Phase 2)**: Depends on Setup (Phase 1) completion
  - Tests (T006-T022) can run in parallel [P] after Phase 1
  - Components (T023-T025) can run in parallel [P] after tests written
  - Data updates (T026-T029) run sequentially (same file dependencies)
  - UI updates (T030-T031) run sequentially after components created
  - Verification (T032-T034) runs sequentially after implementation
- **Polish (Phase 3)**: Depends on User Story 5 completion
  - Accessibility tasks (T035-T038) can run in parallel [P]
  - Performance tasks (T039-T042) can run in parallel [P]
  - Manual testing (T043-T049) runs sequentially
  - Documentation (T050-T051) can run in parallel [P]
  - Final validation (T052-T054) runs sequentially

### Task Dependencies Within Phases

**Phase 1 (Setup):**
- T001, T002, T003, T004 → Parallel [P]
- T005 → Depends on T001-T004

**Phase 2 (User Story 5 Implementation):**
- T006-T021 (Tests) → Parallel [P] after Phase 1
- T022 → Depends on T006-T021
- T023, T024, T025 (Components) → Parallel [P] after T022
- T026 → Depends on T004, T023
- T027 → Depends on T026 (same file)
- T028 → Depends on T027 (same file)
- T029 → Depends on T028 (same file)
- T030 → Depends on T023, T026
- T031 → Depends on T024, T027-T029
- T032, T033, T034 → Sequential

**Phase 3 (Polish):**
- T035-T038 → Parallel [P]
- T039-T042 → Parallel [P]
- T043-T049 → Sequential (manual testing flow)
- T050-T051 → Parallel [P]
- T052-T054 → Sequential

### Parallel Opportunities

**Maximum Parallelization:**
- Phase 1: 4 tasks in parallel (T001-T004)
- Phase 2 Tests: 16 tasks in parallel (T006-T021)
- Phase 2 Components: 3 tasks in parallel (T023-T025)
- Phase 3 Accessibility: 4 tasks in parallel (T035-T038)
- Phase 3 Performance: 4 tasks in parallel (T039-T042)
- Phase 3 Documentation: 2 tasks in parallel (T050-T051)

**Critical Path** (minimum time to completion):
Setup (T001-T005) → Tests (T006-T022) → Components (T023-T025) → Data (T026-T029) → UI (T030-T031) → Verify (T032-T034) → Polish (T035-T054)

---

## Parallel Example: Phase 2 Tests

```bash
# All unit tests for utilities can run in parallel
npm test -- tests/unit/utils/cardImagePaths.test.ts &  # T006-T014 run together

# All integration tests for components can run in parallel
npm test -- tests/integration/components/CatalyzerCardImage.test.tsx &  # T015-T018
npm test -- tests/integration/components/QuestionCardImage.test.tsx &   # T019-T021

# Wait for all parallel tests to complete
wait

# Then run full test suite to verify all tests fail
npm test  # T022
```

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**Scope**: User Story 5 complete - game displays official card images

**Definition of Done**:
- TypeScript interfaces updated with optional cardImage fields
- Utility functions created for path generation
- Card display components created (CatalyzerCardImage, QuestionCardImage)
- Data files updated with cardImage paths for all 99 suspect cards and 77 investigator cards
- Existing game UI updated to use card components
- All tests pass (100% coverage for utilities)
- TypeScript compiles with 0 errors
- Game runs in browser and displays card images correctly
- Accessibility validated (WCAG AA)
- Performance validated (bundle < 500KB, Lighthouse > 90)

### Incremental Delivery

**Milestone 1**: Interfaces & Utilities (Phase 1 complete)
- TypeScript can import and use new types
- Path generation utilities available

**Milestone 2**: Tests Written (T006-T022 complete)
- All tests fail as expected (no implementation yet)
- Test coverage defined for all new code

**Milestone 3**: Components Created (T023-T025 complete)
- Card display components available for use
- Some tests start passing

**Milestone 4**: Data Updated (T026-T029 complete)
- All game data has cardImage paths
- TypeScript compilation succeeds

**Milestone 5**: UI Updated (T030-T031 complete)
- Game displays card images instead of custom widgets
- All tests pass
- Feature complete

**Milestone 6**: Polished (Phase 3 complete)
- Accessible, performant, documented
- Production-ready

### Testing Strategy

**Test-First (TDD):**
1. Write tests that define expected behavior (T006-T021)
2. Run tests and verify they fail (T022)
3. Implement minimum code to make tests pass (T023-T031)
4. Refactor if needed while keeping tests green
5. All tests must pass before marking story complete (T033)

**Coverage Requirements:**
- Utility functions: 100% coverage (constitution requirement)
- React components: 80%+ coverage
- Integration tests verify game flow end-to-end

**Manual Testing:**
- Complement automated tests with browser testing
- Verify visual appearance matches expectations
- Test on multiple devices and browsers

### Success Metrics

**Technical:**
- TypeScript compilation: 0 errors ✅
- Test coverage: 100% for utilities, 80%+ for components ✅
- Bundle size: < 500KB gzipped ✅
- Lighthouse score: > 90 ✅

**Functional:**
- All 99 catalyzer cards display correct card images ✅
- All 77 investigator questions display card images ✅
- All 11 modules work correctly ✅
- No broken image links (404 errors) ✅

**User Experience:**
- Card images render within 500ms (lazy-loaded) ✅
- Card text readable at mobile sizes ✅
- Screen reader announces card content ✅
- Keyboard navigation works ✅

---

## Total Task Count: 54 tasks

**By Phase:**
- Phase 1 (Setup): 5 tasks
- Phase 2 (User Story 5): 29 tasks
  - Tests: 17 tasks
  - Implementation: 12 tasks
- Phase 3 (Polish): 20 tasks

**Parallel Opportunities:**
- 33 tasks can run in parallel (marked with [P])
- 21 tasks must run sequentially

**Estimated Timeline:**
- Phase 1: 1-2 hours
- Phase 2: 4-6 hours
- Phase 3: 2-3 hours
- **Total**: 7-11 hours

---

## References

- **Specification**: [spec.md](spec.md) - User Story 5 (Game Integration)
- **Implementation Plan**: [plan.md](plan.md) - Technical approach and architecture
- **Data Model**: [data-model.md](data-model.md) - Entity definitions and integration details
- **Contracts**: [contracts/](contracts/) - TypeScript interface definitions
- **Quickstart**: [quickstart.md](quickstart.md) - Step-by-step integration guide
- **Integration Guide**: [../../extraction/typescript_integration_guide.md](../../extraction/typescript_integration_guide.md) - Asset path mappings
- **Validation Report**: [../../extraction/reports/validation_report.html](../../extraction/reports/validation_report.html) - Extraction validation

---

**Generated**: 2026-02-23
**Feature**: 003-pdf-asset-extraction
**Status**: Ready for implementation
