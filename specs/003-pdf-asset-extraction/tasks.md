# Tasks: Automated PDF Asset Extraction

**Input**: Design documents from `/specs/003-pdf-asset-extraction/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included - TDD approach required per constitution (Principle III)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Python extraction tool project

- [X] T001 Create extraction/ directory structure per plan.md
- [X] T002 Create extraction/requirements.txt with dependencies (pymupdf>=1.27.1, pillow>=12.1.1, opencv-python>=4.13, paddleocr, jinja2>=3.0, matplotlib>=3.0, pytest)
- [X] T003 [P] Create extraction/pyproject.toml with Python 3.11+ configuration
- [X] T004 [P] Create extraction/README.md with tool documentation
- [X] T005 [P] Create extraction/data/ directory structure (pdfs/, labels/, output/)
- [X] T006 [P] Create extraction/tests/fixtures/ with sample PDFs for testing
- [X] T007 [P] Create extraction/.gitignore for data/ and reports/ directories
- [X] T008 Install dependencies with `pip install -r extraction/requirements.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create extraction/src/__init__.py as package marker
- [X] T010 [P] Create extraction/src/models/ directory with __init__.py
- [X] T011 [P] Create extraction/src/utils/ directory with __init__.py
- [X] T012 [P] Implement extraction/src/models/pdf_document.py with PDFDocument dataclass (from data-model.md)
- [X] T013 [P] Implement extraction/src/models/label.py with Label dataclass (from data-model.md)
- [X] T014 [P] Implement extraction/src/models/extracted_asset.py with ExtractedAsset dataclass (from data-model.md)
- [X] T015 [P] Implement extraction/src/models/catalyzer_mapping.py with CatalyzerCardMapping dataclass (from data-model.md)
- [X] T016 [P] Implement extraction/src/utils/json_handler.py with JSON serialization/deserialization utilities
- [X] T017 [P] Implement extraction/src/utils/logger.py with logging configuration
- [X] T018 Create extraction/src/main.py with CLI entry point skeleton using argparse

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Download and Catalog Official PDFs (Priority: P1) 🎯 MVP

**Goal**: Automatically download all official PDFs from robots.management and generate catalog

**Independent Test**: Run download command and verify all PDFs present in data/pdfs/ with catalog.json

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T019 [P] [US1] Contract test for download command in extraction/tests/contract/test_download_cli.py
- [X] T020 [P] [US1] Unit test for pdf_downloader in extraction/tests/unit/test_pdf_downloader.py
- [X] T021 [P] [US1] Unit test for catalog generation in extraction/tests/unit/test_catalog.py
- [X] T022 [P] [US1] Integration test for full download pipeline in extraction/tests/integration/test_download_pipeline.py
- [X] T023 [P] [US1] Test for resume functionality in extraction/tests/unit/test_pdf_downloader_resume.py

### Implementation for User Story 1

- [X] T024 [P] [US1] Create extraction/src/download/__init__.py
- [X] T025 [US1] Implement extraction/src/download/pdf_downloader.py with download_pdfs() function using requests library
- [X] T026 [US1] Implement extraction/src/download/catalog.py with generate_catalog() function
- [X] T027 [US1] Add download command to extraction/src/main.py with options (--output-dir, --base-url, --resume, --verify, --catalog-path)
- [X] T028 [US1] Add error handling for network failures and invalid URLs
- [X] T029 [US1] Add logging for download progress (per-file and overall)
- [X] T030 [US1] Verify all tests pass (T019-T023)

**Checkpoint**: At this point, User Story 1 should be fully functional - download command works independently

---

## Phase 4: User Story 2 - Manual Labeling Interface (Priority: P2)

**Goal**: Interactive matplotlib interface for drawing bounding boxes on PDF pages

**Independent Test**: Run label command, draw boxes, verify labels.json created with correct schema

### Tests for User Story 2

- [X] T031 [P] [US2] Contract test for label command in extraction/tests/contract/test_label_cli.py
- [X] T032 [P] [US2] Unit test for interactive interface in extraction/tests/unit/test_interface.py
- [X] T033 [P] [US2] Unit test for label validator in extraction/tests/unit/test_validator.py
- [X] T034 [P] [US2] Unit test for label storage in extraction/tests/unit/test_storage.py
- [X] T035 [P] [US2] Integration test for labeling session in extraction/tests/integration/test_labeling_session.py

### Implementation for User Story 2

- [X] T036 [P] [US2] Create extraction/src/labeling/__init__.py
- [X] T037 [US2] Implement extraction/src/labeling/interface.py with PDFAnnotator class using matplotlib.widgets.RectangleSelector
- [X] T038 [US2] Implement extraction/src/labeling/validator.py with validate_label() function (check grid structure for mazes, text blocks for restrictions)
- [X] T039 [US2] Implement extraction/src/labeling/storage.py with save_labels() and load_labels() functions
- [X] T040 [US2] Add label command to extraction/src/main.py with options (PDF_PATH, --page, --labels-file, --content-type, --zoom)
- [X] T041 [US2] Add content type selection UI (interactive prompt if --content-type not provided)
- [X] T042 [US2] Add keyboard shortcuts (s=save, n=next, q=quit) to interface
- [X] T043 [US2] Add logging for labeling actions (box drawn, label saved, validation result)
- [X] T044 [US2] Verify all tests pass (T031-T035)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Automated Extraction from Patterns (Priority: P3)

**Goal**: Extract all assets based on labeled patterns using template matching and text extraction

**Independent Test**: Run extract command with labels, verify extracted assets match expected counts

### Tests for User Story 3

- [ ] T045 [P] [US3] Contract test for extract command in extraction/tests/contract/test_extract_cli.py
- [ ] T046 [P] [US3] Unit test for pattern matcher in extraction/tests/unit/test_pattern_matcher.py
- [ ] T047 [P] [US3] Unit test for image extractor in extraction/tests/unit/test_image_extractor.py
- [ ] T048 [P] [US3] Unit test for text extractor in extraction/tests/unit/test_text_extractor.py
- [ ] T049 [P] [US3] Unit test for metadata generator in extraction/tests/unit/test_metadata.py
- [ ] T050 [P] [US3] Integration test for extraction pipeline in extraction/tests/integration/test_extraction_pipeline.py

### Implementation for User Story 3

- [ ] T051 [P] [US3] Create extraction/src/extraction/__init__.py
- [ ] T052 [US3] Implement extraction/src/extraction/pattern_matcher.py with find_similar_regions() using cv2.matchTemplate()
- [ ] T053 [US3] Implement extraction/src/extraction/image_extractor.py with extract_maze_image() using PyMuPDF and Pillow
- [ ] T054 [US3] Implement extraction/src/extraction/text_extractor.py with extract_text() using PyMuPDF text layer and PaddleOCR fallback
- [ ] T055 [US3] Implement extraction/src/extraction/metadata.py with generate_extraction_metadata() function
- [ ] T056 [US3] Add extract command to extraction/src/main.py with options (--pdfs-dir, --labels-file, --output-dir, --confidence-threshold, --content-types, --dry-run)
- [ ] T057 [US3] Add multi-scale template matching for scale-invariant pattern detection
- [ ] T058 [US3] Add confidence scoring and low-confidence flagging
- [ ] T059 [US3] Add progress bar for extraction (per PDF and overall)
- [ ] T060 [US3] Add logging for extractions (per asset and summary statistics)
- [ ] T061 [US3] Verify all tests pass (T045-T050)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Validation Reports (Priority: P4)

**Goal**: Generate HTML validation report with side-by-side comparisons of extracted assets vs source PDFs

**Independent Test**: Run validate command, open HTML report in browser, verify visual comparisons present

### Tests for User Story 4

- [ ] T062 [P] [US4] Contract test for validate command in extraction/tests/contract/test_validate_cli.py
- [ ] T063 [P] [US4] Unit test for report generator in extraction/tests/unit/test_report_generator.py
- [ ] T064 [P] [US4] Unit test for comparator in extraction/tests/unit/test_comparator.py
- [ ] T065 [P] [US4] Integration test for report generation in extraction/tests/integration/test_validation_report.py

### Implementation for User Story 4

- [ ] T066 [P] [US4] Create extraction/src/validation/__init__.py
- [ ] T067 [US4] Implement extraction/src/validation/comparator.py with compare_assets() function (image similarity, text matching)
- [ ] T068 [US4] Implement extraction/src/validation/report_generator.py with generate_html_report() using Jinja2
- [ ] T069 [US4] Create extraction/templates/validation_report.html Jinja2 template with CSS Grid layout
- [ ] T070 [US4] Add validate command to extraction/src/main.py with options (--pdfs-dir, --output-dir, --metadata-file, --report-path, --sample-size)
- [ ] T071 [US4] Add base64 image embedding for offline HTML reports
- [ ] T072 [US4] Add success rate calculation and color-coded status (green >= 95%, yellow 80-95%, red < 80%)
- [ ] T073 [US4] Add error log section with specific PDF references
- [ ] T074 [US4] Add logging for validation progress
- [ ] T075 [US4] Verify all tests pass (T062-T065)

**Checkpoint**: All core extraction functionality complete and independently testable

---

## Phase 7: User Story 5 - Game Integration (Priority: P5)

**Goal**: Update catalyzerCards.ts with extracted content and copy assets to public/assets/

**Independent Test**: Run integrate command, verify TypeScript compilation succeeds and game tests pass

### Tests for User Story 5

- [ ] T076 [P] [US5] Contract test for integrate command in extraction/tests/contract/test_integrate_cli.py
- [ ] T077 [P] [US5] Unit test for TypeScript updater in extraction/tests/unit/test_ts_updater.py
- [ ] T078 [P] [US5] Unit test for asset copier in extraction/tests/unit/test_asset_copier.py
- [ ] T079 [P] [US5] Integration test for full integration pipeline in extraction/tests/integration/test_integration_pipeline.py
- [ ] T080 [P] [US5] Test for TypeScript compilation validation in extraction/tests/integration/test_ts_compilation.py

### Implementation for User Story 5

- [ ] T081 [P] [US5] Create extraction/src/integration/__init__.py
- [ ] T082 [US5] Implement extraction/src/integration/ts_updater.py with update_catalyzer_cards() function (parse TS, update data, write back)
- [ ] T083 [US5] Implement extraction/src/integration/asset_copier.py with copy_assets() function
- [ ] T084 [US5] Add integrate command to extraction/src/main.py with options (--output-dir, --metadata-file, --catalyzer-file, --assets-dir, --dry-run, --backup)
- [ ] T085 [US5] Add backup creation for catalyzerCards.ts before modification
- [ ] T086 [US5] Add TypeScript compilation validation (run tsc --noEmit) after integration
- [ ] T087 [US5] Add automatic rollback on TypeScript compilation failure
- [ ] T088 [US5] Generate integration_mapping.json with mapping status
- [ ] T089 [US5] Add logging for integration actions (files updated, assets copied, compilation result)
- [ ] T090 [US5] Verify all tests pass (T076-T080)

**Checkpoint**: Complete feature - all user stories functional and game integration working

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T091 [P] Add extraction/src/utils/validation.py with JSON schema validators for all output formats
- [ ] T092 [P] Implement extraction/tests/contract/test_output_formats.py to verify all outputs match schemas from contracts/output-formats.md
- [ ] T093 [P] Create extraction/templates/ directory with all Jinja2 templates
- [ ] T094 [P] Add progress bars using tqdm library for all long-running operations
- [ ] T095 [P] Add comprehensive error messages with actionable suggestions
- [ ] T096 Add extraction/docs/ARCHITECTURE.md documenting module structure and data flow
- [ ] T097 Run complete end-to-end pipeline test following quickstart.md
- [ ] T098 Verify all 10 success criteria from spec.md are met
- [ ] T099 [P] Add type hints to all Python functions and verify with mypy
- [ ] T100 [P] Run code formatting with black and lint with pylint
- [ ] T101 Update extraction/README.md with complete usage examples from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Download) can start after Foundational - No dependencies on other stories
  - US2 (Labeling) can start after Foundational - No dependencies on other stories
  - US3 (Extraction) depends on US1 (needs PDFs) and US2 (needs labels) completion
  - US4 (Validation) depends on US3 (needs extracted assets) completion
  - US5 (Integration) depends on US3 (needs extracted assets) completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (Phase 2)
    ├─> US1 (Download PDFs) ────┐
    ├─> US2 (Labeling) ─────────┼─> US3 (Extraction) ──┬─> US4 (Validation)
    │                            │                       └─> US5 (Integration)
    └────────────────────────────┘
```

**Sequential Order**: US1 → US2 → US3 → US4/US5 (in parallel)
**Minimum for MVP**: US1 only (provides PDF download and catalog functionality)
**Recommended MVP**: US1 + US2 + US3 (provides complete extraction without validation/integration)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Unit tests can run in parallel [P]
- Implementation tasks follow: models → utilities → core logic → CLI integration
- Verify all tests pass before marking story complete

### Parallel Opportunities

- **Setup tasks (T003-T007)**: Can all run in parallel after T001-T002
- **Foundational models (T012-T015)**: Can all run in parallel
- **Foundational utilities (T016-T017)**: Can all run in parallel
- **US1 tests (T019-T023)**: Can all run in parallel (write them all, they all fail initially)
- **US1 implementation modules (T024-T026)**: Core modules can be built in parallel
- **US2 tests (T031-T035)**: Can all run in parallel
- **US3 tests (T045-T050)**: Can all run in parallel
- **US3 extractors (T052-T054)**: Different extractor modules can be built in parallel
- **US4 tests (T062-T065)**: Can all run in parallel
- **US5 tests (T076-T080)**: Can all run in parallel
- **US5 modules (T082-T083)**: Updater and copier can be built in parallel
- **Polish tasks (T091-T095, T099-T100)**: Most can run in parallel

---

## Parallel Example: User Story 3 (Extraction)

```bash
# Phase 1: Write all tests in parallel (they should FAIL)
Task: "Contract test for extract command in extraction/tests/contract/test_extract_cli.py" [T045]
Task: "Unit test for pattern matcher in extraction/tests/unit/test_pattern_matcher.py" [T046]
Task: "Unit test for image extractor in extraction/tests/unit/test_image_extractor.py" [T047]
Task: "Unit test for text extractor in extraction/tests/unit/test_text_extractor.py" [T048]
Task: "Unit test for metadata generator in extraction/tests/unit/test_metadata.py" [T049]
Task: "Integration test for extraction pipeline in extraction/tests/integration/test_extraction_pipeline.py" [T050]

# Verify all tests FAIL (RED phase of TDD)

# Phase 2: Implement core modules in parallel
Task: "Implement pattern_matcher.py with find_similar_regions()" [T052]
Task: "Implement image_extractor.py with extract_maze_image()" [T053]
Task: "Implement text_extractor.py with extract_text()" [T054]

# Phase 3: Sequential CLI integration (depends on T052-T054)
Task: "Add extract command to main.py with options" [T056]
Task: "Add multi-scale template matching" [T057]
Task: "Add confidence scoring" [T058]

# Verify all tests PASS (GREEN phase of TDD)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T018) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T019-T030)
4. **STOP and VALIDATE**: Test download command independently
   - Run: `python -m extraction.main download`
   - Verify: 13 PDFs downloaded, catalog.json created
5. Deploy/demo if ready

**Time Estimate**: 4-6 hours (Setup: 1h, Foundational: 1h, US1: 2-4h)

### Recommended MVP (User Stories 1-3)

1. Complete Setup + Foundational (T001-T018)
2. Complete US1: Download PDFs (T019-T030) → Test independently
3. Complete US2: Labeling Interface (T031-T044) → Test independently
4. Complete US3: Automated Extraction (T045-T061) → Test independently
5. **STOP and VALIDATE**: Full extraction pipeline
   - Download PDFs
   - Label 2-3 examples per content type (10 labels total)
   - Run extraction
   - Verify 60+ mazes extracted with 95%+ confidence
6. Deploy/demo if ready (validation and integration optional)

**Time Estimate**: 16-24 hours total

### Full Feature (All User Stories)

1. Complete Setup + Foundational (T001-T018)
2. Add US1: Download (T019-T030) → Test independently
3. Add US2: Labeling (T031-T044) → Test independently
4. Add US3: Extraction (T045-T061) → Test independently
5. Add US4: Validation (T062-T075) → Test independently (optional for MVP)
6. Add US5: Integration (T076-T090) → Test independently
7. Add Polish (T091-T101) → Final touches
8. Each story adds value without breaking previous stories

**Time Estimate**: 24-32 hours total

### Parallel Team Strategy

With 3 developers:

1. **Together**: Complete Setup + Foundational (T001-T018)
2. **Once Foundational done**:
   - Developer A: US1 (Download) → US4 (Validation) [independent]
   - Developer B: US2 (Labeling) → US3 (Extraction) [sequential]
   - Developer C: Polish tasks (T091-T101) [independent]
3. **Final integration**: Developer A + B: US5 (Integration) together
4. Stories complete and integrate independently

**Time Estimate with 3 devs**: 12-16 hours total

---

## Task Summary

- **Total Tasks**: 101 tasks
- **Setup (Phase 1)**: 8 tasks
- **Foundational (Phase 2)**: 10 tasks (BLOCKING)
- **US1 - Download PDFs (P1)**: 12 tasks (5 tests + 7 implementation)
- **US2 - Labeling Interface (P2)**: 14 tasks (5 tests + 9 implementation)
- **US3 - Automated Extraction (P3)**: 17 tasks (6 tests + 11 implementation)
- **US4 - Validation Reports (P4)**: 14 tasks (4 tests + 10 implementation)
- **US5 - Game Integration (P5)**: 15 tasks (5 tests + 10 implementation)
- **Polish (Phase 8)**: 11 tasks
- **Parallel Opportunities**: 47 tasks marked [P] (47% can run in parallel)

---

## Independent Test Criteria

### User Story 1 (Download PDFs)
- ✅ Run `python -m extraction.main download`
- ✅ Verify 13 PDFs in data/pdfs/
- ✅ Verify catalog.json exists and matches schema
- ✅ Verify resume functionality skips existing files

### User Story 2 (Labeling Interface)
- ✅ Run `python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type maze`
- ✅ Draw bounding box in matplotlib window
- ✅ Verify labels.json created with correct coordinates
- ✅ Verify validation status is "valid" for grid structure

### User Story 3 (Automated Extraction)
- ✅ Run `python -m extraction.main extract` with 10 manual labels
- ✅ Verify 60+ maze images extracted to data/output/mazes/
- ✅ Verify extraction_metadata.json contains all assets
- ✅ Verify average confidence >= 0.95

### User Story 4 (Validation Reports)
- ✅ Run `python -m extraction.main validate`
- ✅ Open reports/validation_report.html in browser
- ✅ Verify side-by-side image comparisons visible
- ✅ Verify success rate displayed (target: 95%+)

### User Story 5 (Game Integration)
- ✅ Run `python -m extraction.main integrate --dry-run` (preview changes)
- ✅ Run `python -m extraction.main integrate` (actual integration)
- ✅ Verify catalyzerCards.ts updated with restrictions/tasks
- ✅ Verify 62 maze images in ../public/assets/mazes/
- ✅ Run `npm run build` in game root (TypeScript compilation succeeds)
- ✅ Run `npm test` in game root (all tests pass)

---

## Notes

- [P] tasks = different files, no dependencies (can run in parallel)
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD Required**: Verify tests fail before implementing (RED → GREEN → REFACTOR)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow quickstart.md for usage examples
- Reference contracts/cli-commands.md for CLI interface details
- Reference contracts/output-formats.md for JSON schemas
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Criteria Validation (from spec.md)

After completing all phases, verify:

- [ ] **SC-001**: All inducer mazes display as correct 5x5 grids (run game and check)
- [ ] **SC-002**: 100% text accuracy for restrictions/tasks (spot-check 10 random cards)
- [ ] **SC-003**: Module icons at 512x512 resolution minimum (check extracted icons)
- [ ] **SC-004**: Background/penalty text 100% accurate (spot-check)
- [ ] **SC-005**: ≤10 total manual labels required (count labels.json entries)
- [ ] **SC-006**: Integration doesn't break game (npm test passes)
- [ ] **SC-007**: 95%+ automated extraction accuracy (validation report confirms)
- [ ] **SC-008**: Complete process <30 minutes (time full pipeline)
- [ ] **SC-009**: Manual labeling <15 minutes (time labeling session)
- [ ] **SC-010**: TypeScript compilation succeeds (npm run build succeeds)
