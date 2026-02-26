# Feature Specification: Automated PDF Asset Extraction

**Feature Branch**: `003-pdf-asset-extraction`
**Created**: 2026-02-22
**Status**: Draft
**Priority**: P1 (Critical - Blocks correct game functionality)

---

## Overview

### Problem Statement

The current game implementation uses incorrectly extracted visual and textual content from official PDF materials. The inducer maze images shown in the game are random crops from PDFs rather than the actual 5x5 grid mazes from Robot Catalyzer cards. All visual assets (mazes, icons, backgrounds) and textual content (restrictions, tasks, character descriptions) need to be accurately extracted from the official Inhuman Conditions PDFs available at https://robots.management/.

This affects game authenticity and playability - players cannot properly experience the official game mechanics when visual puzzles and rule text are incorrect.

### Solution Summary

Create an automated content extraction system that downloads all official PDFs, analyzes their structure to identify content positions, uses minimal manual labeling (2-3 examples per content type) to train pattern recognition, and automatically extracts all game assets with correct bounding boxes. The system validates extracted content and integrates it into the game's TypeScript data structures.

---

## User Scenarios & Testing

### User Story 1 - Download and Catalog Official PDFs (Priority: P1)

As a developer, I want to automatically download all official PDFs from robots.management so that I have complete source materials for extraction without manual download steps.

**Why this priority**: Foundation for all other extraction work. Without the complete set of official PDFs, no accurate extraction is possible. This is a quick win that provides immediate value by organizing source materials.

**Independent Test**: Can be fully tested by running the download process and verifying all PDFs are present in the expected directory with correct naming. Delivers value by eliminating manual PDF download and organization.

**Acceptance Scenarios**:

1. **Given** the robots.management website is accessible, **When** the download process is initiated, **Then** all 11 module PDFs (suspect and investigator versions), penalties PDF, backgrounds PDF, and print-and-play PDF are downloaded to an organized directory structure

2. **Given** all PDFs have been downloaded, **When** the catalog is generated, **Then** a catalog file lists each PDF with metadata including filename, file size, page count, content type, and download timestamp

3. **Given** a PDF download fails due to network issues, **When** the download process is retried, **Then** the system resumes from the last successful download without re-downloading completed files

---

### User Story 2 - Manual Labeling Interface (Priority: P2)

As a developer, I want to manually label 2-3 examples of each content type with bounding boxes so that the system can learn patterns for automated extraction.

**Why this priority**: Enables the automated extraction in US3. This is a necessary prerequisite but only needs to be done once. The labeling interface must be usable enough to complete labeling in under 15 minutes total.

**Independent Test**: Can be tested independently by loading PDF pages, drawing bounding boxes, saving labels, and verifying the labels are stored with correct coordinates and content types. Delivers value by creating the training dataset for automation.

**Acceptance Scenarios**:

1. **Given** downloaded PDFs are available, **When** the labeling interface opens a PDF page, **Then** the page displays at readable resolution with zoom and pan controls

2. **Given** a PDF page is displayed, **When** the developer draws a rectangular bounding box around content and specifies content type (maze, restriction text, icon, background, penalty), **Then** the label is saved with PDF filename, page number, coordinates, content type, and timestamp

3. **Given** a bounding box has been drawn around an inducer maze, **When** the system validates the labeled region, **Then** it confirms the region contains a grid structure pattern and marks the label as valid

4. **Given** multiple labels have been created, **When** the developer navigates between labeled regions, **Then** all previously drawn boxes are visible and editable

5. **Given** labeling is complete for all content types (maze, restriction, task, icon, background, penalty), **When** the developer reviews the label count, **Then** no more than 10 total labels exist across all content types

---

### User Story 3 - Automated Extraction from Patterns (Priority: P3)

As a developer, I want to automatically extract all remaining assets based on labeled patterns so that I don't need to manually label 60+ catalyzer cards.

**Why this priority**: Core automation that delivers the bulk of the extraction work. Depends on US2 (manual labels) but is independent of integration (US5). This is where the system proves its value by reducing hours of manual work to minutes.

**Independent Test**: Can be tested by running extraction with labeled examples and verifying extracted assets match expected counts and patterns. Delivers value by producing all game assets ready for validation and integration.

**Acceptance Scenarios**:

1. **Given** manual labels exist for at least 2 examples of each content type, **When** automated extraction runs, **Then** the system identifies similar content across all PDFs based on positional, visual, and text patterns

2. **Given** extraction is running, **When** the system processes catalyzer card pages, **Then** all 60+ inducer mazes are extracted as individual PNG images with naming convention {module}-{cardnumber}.png at minimum 300x300 pixel resolution

3. **Given** extraction is processing restriction text, **When** the system extracts text from catalyzer cards, **Then** all patient robot restrictions are extracted and matched to their corresponding fault types with formatting preserved (bullet points, line breaks)

4. **Given** extraction is processing module icons, **When** the system extracts geometric symbols, **Then** all 11 module icons are extracted at minimum 512x512 pixel resolution as PNG or SVG files

5. **Given** extraction is complete, **When** the system generates metadata, **Then** each extracted asset includes source PDF name, page number, and bounding box coordinates for traceability

6. **Given** extraction encounters a page layout that doesn't match labeled patterns, **When** the system cannot confidently extract content, **Then** it flags the extraction as low-confidence and includes it in the error log

---

### User Story 4 - Validation Reports (Priority: P4)

As a developer, I want to see validation reports comparing extracted content to expectations so that I can verify extraction accuracy before integration.

**Why this priority**: Quality assurance before integration. Independent of US5 (integration) but depends on US3 (extraction). Prevents bad data from entering the game codebase.

**Independent Test**: Can be tested by generating reports from extracted assets and verifying they display visual comparisons, text comparisons, and error logs. Delivers value by providing confidence in extraction quality.

**Acceptance Scenarios**:

1. **Given** extraction is complete, **When** the validation report is generated, **Then** a web-viewable report displays a visual gallery showing each extracted maze with its source PDF reference side-by-side

2. **Given** the validation report is open, **When** reviewing text extractions, **Then** a comparison table shows extracted text versus expected format with any discrepancies highlighted

3. **Given** some extractions failed or have low confidence, **When** viewing the error log section, **Then** each failed extraction is listed with specific PDF filename, page number, and reason for failure

4. **Given** the validation report shows all extractions, **When** counting successful extractions, **Then** the success rate is calculated and displayed (target: 95%+ for automated extractions)

5. **Given** the developer needs to verify quality, **When** spot-checking 5-10 random mazes from the visual gallery, **Then** each maze clearly shows the 5x5 grid structure with directional arrows matching the source PDF

---

### User Story 5 - Game Integration (Priority: P5)

As a developer, I want to automatically update TypeScript data files with extracted content so that the game uses correct official assets.

**Why this priority**: Final step that delivers end-user value. Depends on US3 (extraction) and ideally US4 (validation) but is the ultimate goal of the entire feature.

**Independent Test**: Can be tested by running integration, compiling TypeScript, running the game, and verifying assets display correctly. Delivers value by fixing the original problem (incorrect game assets).

**Acceptance Scenarios**:

1. **Given** validated extracted assets are available, **When** integration updates catalyzerCards.ts, **Then** all robot restriction text for patient robots is replaced with extracted content and all task text for violent robots is replaced with extracted content

2. **Given** catalyzerCards.ts has been updated, **When** TypeScript compilation runs, **Then** the compiler reports 0 errors and all type checks pass

3. **Given** extracted maze images exist, **When** integration copies them to public/assets/mazes/, **Then** all image files are present with correct naming convention matching inducerMazeImage paths in catalyzerCards.ts

4. **Given** integration is complete, **When** the game runs and a robot player reaches the interview phase, **Then** the inducer maze displayed shows the correct 5x5 grid structure with directional arrows (not a random PDF crop)

5. **Given** integration is complete, **When** a robot player views their role reveal screen, **Then** the restrictions displayed exactly match the official catalyzer card text from the PDFs

6. **Given** integration is complete, **When** running the game's existing test suite, **Then** all tests pass and no functionality is broken by the asset updates

---

### Edge Cases

- What happens when a PDF download fails mid-process due to network interruption?
  - System should resume from last successful download without re-downloading completed files

- What happens when manual labeling identifies a content region that doesn't match expected patterns (e.g., labeled as "maze" but no grid structure detected)?
  - System should flag the label as invalid and prompt developer to review/correct

- What happens when automated extraction encounters a catalyzer card with a different layout than labeled examples?
  - System should flag as low-confidence extraction, include in error log, and allow manual review before integration

- What happens when OCR is needed for text extraction but produces garbled text?
  - System should attempt PDF text layer extraction first; only use OCR as fallback; validation report highlights OCR-extracted text for manual review

- What happens when extracted maze image resolution is too low to display clearly in-game?
  - System should enforce minimum resolution requirement (300x300 pixels) and flag any extractions below threshold

- What happens when integration would overwrite existing manual corrections to catalyzerCards.ts?
  - System should preserve any manual additions (traits, descriptions) that are not derived from PDFs; only update PDF-sourced content (restrictions, tasks, maze paths)

- What happens when robots.management website structure changes and download URLs are invalid?
  - System should report which PDFs failed to download with specific URL errors, allowing developer to update download configuration

## Requirements

### Functional Requirements

**PDF Download and Organization**

- **FR-001**: System MUST download all official PDFs from https://robots.management/ including all 11 module PDFs (suspect and investigator versions), penalties PDF, backgrounds PDF, and print-and-play PDF

- **FR-002**: System MUST organize downloaded PDFs by content type using consistent naming convention (e.g., 01_small_talk_suspect.pdf, 01_small_talk_investigator.pdf)

- **FR-003**: System MUST generate a catalog file containing PDF metadata (filename, file size, page count, content type, download timestamp)

- **FR-004**: System MUST resume interrupted downloads without re-downloading successfully completed files

**Manual Labeling Interface**

- **FR-005**: System MUST provide an interactive interface for drawing rectangular bounding boxes on PDF pages

- **FR-006**: Interface MUST display PDF pages at readable resolution with zoom and pan controls

- **FR-007**: Developer MUST be able to specify content type for each bounding box (maze, restriction text, task text, icon, background, penalty)

- **FR-008**: System MUST save labels with structured data including PDF filename, page number, coordinates (x, y, width, height), content type, and creation timestamp

- **FR-009**: System MUST validate labeled regions by checking for expected content patterns (e.g., grid structure for mazes, text blocks for restrictions)

- **FR-010**: System MUST support navigation between PDF pages and editing of previously created labels

**Pattern Recognition and Automated Extraction**

- **FR-011**: System MUST analyze labeled examples to identify positional patterns, visual patterns, and text patterns

- **FR-012**: System MUST automatically identify similar content across all PDFs based on position similarity, visual similarity, and content type classification

- **FR-013**: For inducer mazes, system MUST extract each maze as a separate PNG image preserving 5x5 grid structure at minimum 300x300 pixel resolution

- **FR-014**: System MUST name maze image files using convention {module}-{cardnumber}.png (e.g., smalltalk-010.png)

- **FR-015**: For text content (restrictions, tasks, descriptions), system MUST extract text from PDF text layers or use OCR if embedded text is unavailable

- **FR-016**: System MUST match extracted text to appropriate game elements (catalyzer cards, backgrounds, penalties) and preserve formatting (line breaks, bullet points)

- **FR-017**: For module icons, system MUST extract geometric symbols at minimum 512x512 pixel resolution as PNG or SVG format

- **FR-018**: System MUST generate metadata for each extracted asset mapping it to source PDF, page number, and coordinates

- **FR-019**: System MUST flag low-confidence extractions (pattern match below threshold) in an error log

**Content Validation**

- **FR-020**: System MUST generate a validation report containing visual gallery of extracted mazes, text comparison table, asset counts, and error log

- **FR-021**: Validation report MUST provide side-by-side visual comparison showing original PDF crop and extracted PNG image for each maze

- **FR-022**: Validation report MUST flag potential issues including missing extractions, low-confidence extractions, and format mismatches

- **FR-023**: Validation report MUST be viewable in web browser format without requiring additional tools

- **FR-024**: Validation report MUST calculate and display extraction success rate (target: 95%+ accuracy)

**Game Integration**

- **FR-025**: System MUST update catalyzerCards.ts with extracted restriction text for all patient robot cards and task text for all violent robot cards

- **FR-026**: System MUST update inducerMazeImage paths in catalyzerCards.ts to point to extracted PNG files

- **FR-027**: System MUST preserve existing TypeScript structure, typing, and non-PDF-sourced data (traits, descriptions)

- **FR-028**: System MUST copy extracted maze images to public/assets/mazes/ directory

- **FR-029**: System MUST update module icon files in public/assets/icons/ (if extracting new icons)

- **FR-030**: System MUST validate TypeScript compilation succeeds with 0 errors after integration

### Key Entities

**PDF Document**
- Filename (unique identifier within the collection)
- File path (location on disk)
- Content type (module_suspect, module_investigator, penalties, backgrounds, print_play)
- Page count (total number of pages)
- File size (in bytes)
- Download timestamp (when acquired)

**Label** (Manual bounding box annotation)
- ID (unique identifier)
- PDF filename (reference to source document)
- Page number (which page in the PDF)
- Bounding box coordinates (x, y, width, height in PDF coordinate system)
- Content type (maze, restriction, task, icon, background, penalty)
- Creation timestamp (when labeled)
- Validation status (valid, invalid, uncertain - based on pattern matching)

**Extracted Asset** (Output of automated extraction)
- ID (unique identifier)
- Asset type (maze_image, restriction_text, task_text, icon_image, background_text, penalty_text)
- Source PDF filename (traceability)
- Source page number (traceability)
- Source coordinates (x, y, width, height for traceability)
- Extraction method (template_match, position_pattern, text_extraction, OCR)
- Confidence score (0.0-1.0 indicating pattern match quality)
- File path (for image assets)
- Text content (for text assets)
- Extraction timestamp (when extracted)

**Catalyzer Card Mapping** (Integration metadata)
- Card ID (matches catalyzerCards.ts ID like 'smalltalk-ltm-01')
- Inducer maze asset ID (reference to extracted maze image)
- Restriction text asset IDs (references to extracted restriction text, array)
- Task text asset IDs (references to extracted task text, array for violent robots)
- Integration status (pending, integrated, failed)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All inducer pattern mazes display as correct 5x5 grid images matching official Robot Catalyzer cards when viewed in-game

- **SC-002**: Robot restriction and task text extracted from PDFs matches official catalyzer card content with 100% accuracy (zero discrepancies)

- **SC-003**: Module icons extracted at minimum 512x512 pixel resolution display clearly without pixelation

- **SC-004**: Background character descriptions and penalty card text extracted with 100% text accuracy (verified by manual spot-checking)

- **SC-005**: Extraction system requires no more than 10 total manual labels across all content types to achieve 95%+ automated extraction accuracy

- **SC-006**: Asset integration completes without breaking existing game functionality (all existing tests pass)

- **SC-007**: Validation reports show 95%+ accuracy for automated extractions compared to manual verification of 5-10 random samples

- **SC-008**: Complete extraction process from PDF download through integration completes in under 30 minutes of total execution time

- **SC-009**: Manual labeling interface allows developer to complete all labeling in under 15 minutes

- **SC-010**: TypeScript compilation succeeds with 0 errors after integration of extracted assets

---

## Assumptions

1. Official PDFs at robots.management maintain consistent layout across versions (if layout changes significantly, manual labels may need updating)

2. PDF content is embedded as images or vector graphics (not scanned photos) to enable accurate extraction

3. Developer has network access to download PDFs from robots.management

4. Developer can spend 10-15 minutes performing manual labeling for initial pattern training

5. TypeScript data structures (catalyzerCards.ts, packets.ts) have stable interfaces that won't change during integration

6. Game uses standard web formats for assets (PNG for images, UTF-8 text for strings)

7. The 5x5 inducer maze grid structure is consistent across all catalyzer cards in official PDFs

8. Robot restriction and task text follows consistent formatting within PDFs (bullet points, numbered lists, or paragraph format)

9. All PDFs contain embedded text layers (not requiring OCR for text extraction)

10. The system has file system write access to public/assets/ directories for asset integration

---

## Dependencies

### External Systems
- https://robots.management/ website (must be accessible for PDF downloads)
- Web browser (for viewing validation reports)

### Game Codebase
- src/data/catalyzerCards.ts (must exist for integration)
- src/data/packets.ts (may need icon path updates)
- public/assets/mazes/ directory (will be populated with extracted images)
- public/assets/icons/ directory (may be updated with extracted icons)
- TypeScript compiler (for validation after integration)

### Development Environment
- File system access (for reading PDFs, writing extracted assets)
- Network access (for downloading PDFs)
- Display capability (for interactive labeling interface)

---

## Out of Scope

The following are explicitly NOT included in this feature:

1. Creating new game content not present in official PDFs
2. Modifying or editing official PDF files themselves
3. Real-time PDF extraction during gameplay (extraction is a one-time development process)
4. Supporting user-created or unofficial custom content
5. Automatic detection of PDF layout changes (manual re-labeling required if layouts change)
6. Translation or localization of extracted text content
7. Extraction of gameplay rules or instruction manual content
8. Audio or video content extraction (game uses only static images and text)
9. Automated correction of OCR errors (manual review required for OCR-extracted text)
10. Version control or diff tracking for extracted assets across multiple extraction runs

---

## Questions & Clarifications

No critical clarifications needed. The user has provided comprehensive requirements with clear acceptance criteria, technical constraints, and examples of expected content structure.

---

## Risks & Mitigations

**Risk 1: PDF Layout Variations**
- **Risk**: Official PDFs may have inconsistent layouts that break pattern recognition
- **Impact**: Automated extraction fails for pages with unexpected layouts
- **Mitigation**: Manual labeling across multiple PDF modules ensures pattern diversity; validation report identifies failed extractions for manual review; low-confidence extractions flagged for human verification

**Risk 2: OCR Accuracy for Text Extraction**
- **Risk**: If PDFs use scanned images rather than embedded text, OCR may introduce errors
- **Impact**: Extracted restriction/task text contains typos or garbled words
- **Mitigation**: Attempt PDF text layer extraction first; only use OCR as fallback; validation report highlights OCR-extracted text for manual review; 100% text accuracy requirement ensures manual correction before integration

**Risk 3: Maze Image Quality Loss**
- **Risk**: Extracted maze images may lose visual clarity during cropping/scaling
- **Impact**: In-game mazes are blurry or directional arrows are illegible
- **Mitigation**: Extract at high resolution (300x300 minimum); validation report provides visual comparison; developer review before integration; enforce minimum resolution requirement with automatic flagging

**Risk 4: Breaking Changes to Game Data Structures**
- **Risk**: Integration may break existing game functionality if data structure assumptions are wrong
- **Impact**: Game crashes or displays incorrect data after integration
- **Mitigation**: TypeScript validation after integration; preserve existing non-PDF data; automated testing of game flow after integration; integration status tracking (pending/integrated/failed)

**Risk 5: Website Availability**
- **Risk**: robots.management website may be down or restructured
- **Impact**: PDF downloads fail, blocking entire extraction process
- **Mitigation**: Resume capability for interrupted downloads; clear error reporting with specific URLs; manual PDF upload option if automated download fails

---

## Acceptance Testing

### Test Case 1: Complete Extraction Pipeline
**Given**: Official PDFs available at robots.management and developer has allocated 30 minutes
**When**: Developer runs complete extraction pipeline with 10 manual labels
**Then**:
- All PDFs downloaded successfully to organized directory
- Catalog file lists all PDFs with metadata
- 10 manual labels created covering all content types (maze, restriction, task, icon, background, penalty)
- All 60+ mazes extracted as individual PNG files in public/assets/mazes/
- All robot restrictions/tasks extracted as text
- Validation report generated showing 95%+ accuracy
- catalyzerCards.ts updated without TypeScript errors
- Total process time under 30 minutes

### Test Case 2: Maze Visual Accuracy
**Given**: Extracted maze images in public/assets/mazes/
**When**: Developer compares extracted mazes to original PDF pages in validation report
**Then**:
- All mazes show 5x5 grid structure clearly
- Directional arrows visible and correct orientation
- No visual artifacts or cropping errors
- Minimum resolution of 300x300 pixels maintained for all mazes
- Side-by-side comparison in validation report confirms visual fidelity

### Test Case 3: Text Content Accuracy
**Given**: Extracted restriction and task text
**When**: Developer compares extracted text to original PDF content via spot-checking
**Then**:
- Text content matches PDF exactly (100% accuracy for spot-checked samples)
- Formatting preserved (bullet points, line breaks)
- No OCR artifacts present in final text (or OCR-extracted text flagged for review)
- All special characters rendered correctly
- Restriction text properly matched to patient robot cards
- Task text properly matched to violent robot cards

### Test Case 4: Game Integration
**Given**: All assets extracted and validated
**When**: Integration updates catalyzerCards.ts and asset directories, then game runs
**Then**:
- TypeScript compilation succeeds with 0 errors
- Game runs without runtime errors
- Suspect sees correct 5x5 maze during interview (not random PDF crop)
- Robot restrictions display correctly in role reveal screen
- All 11 module icons display correctly in packet selection
- Existing game tests pass (no broken functionality)

### Test Case 5: Validation Report Review
**Given**: Extraction process complete
**When**: Developer opens validation report in web browser
**Then**:
- Visual gallery displays all extracted mazes with source PDF references
- Text comparison table highlights any discrepancies (target: zero discrepancies)
- Error log identifies specific failed extractions with PDF references
- Success rate calculated and displayed (target: 95%+)
- Report navigable without additional tools or setup

### Test Case 6: Labeling Interface Usability
**Given**: Downloaded PDFs available
**When**: Developer uses labeling interface to create 10 labels
**Then**:
- Interface loads PDF pages at readable resolution
- Zoom and pan controls work smoothly
- Bounding box drawing is intuitive and accurate
- Content type selection is clear
- Labels save immediately with confirmation
- Previously created labels are visible and editable
- Total labeling time under 15 minutes

### Test Case 7: Error Handling
**Given**: Network interruption during PDF download
**When**: Download process resumes after network restored
**Then**:
- System identifies which PDFs are incomplete
- Download resumes from last successful file
- No duplicate downloads occur
- Error message clearly indicates which file failed and why

---

## Related Documents

- Original problem identification: DISCREPANCY_REPORT.md
- Previous implementation plan: /Users/akellner/.claude/plans/crispy-squishing-volcano.md
- Robot Catalyzer card data structure: src/data/catalyzerCards.ts
- Official game PDFs source: https://robots.management/
- Game state machine: src/components/GameStateMachine.tsx

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | Claude Sonnet 4.5 | Initial specification created |
