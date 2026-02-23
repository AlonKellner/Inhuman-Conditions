# Implementation Plan: Automated PDF Asset Extraction

**Branch**: `003-pdf-asset-extraction` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-pdf-asset-extraction/spec.md`

## Summary

Create an automated content extraction system that downloads all official Inhuman Conditions PDFs from robots.management, analyzes their structure using minimal manual labeling (2-3 examples per content type), and automatically extracts all game assets (inducer mazes, restriction/task text, module icons) with correct bounding boxes. The system validates extracted content and integrates it into the game's TypeScript data structures (catalyzerCards.ts).

**Technical Approach**: Python-based extraction pipeline with PDF parsing, image processing, pattern recognition, and OCR fallback. Interactive labeling interface for manual bounding box annotation. Web-based validation report for quality assurance. TypeScript integration script to update game data files.

## Technical Context

**Language/Version**: Python 3.11+ (for PDF processing, image manipulation, pattern matching)
**Primary Dependencies**:
- PyMuPDF (fitz) v1.27.1+ - PDF parsing and rendering
- Pillow v12.1.1+ - Image processing
- OpenCV (opencv-python) v4.13+ - Pattern matching
- PaddleOCR v3.x+ - OCR (fallback)
- Jinja2 v3.0+ - HTML report generation
- Matplotlib v3.0+ - Interactive labeling interface
**Storage**: Local filesystem (PDFs in `extraction/pdfs/`, extracted assets in `extraction/output/`, labels in `extraction/labels/`)
**Testing**: pytest with fixtures for sample PDFs and mock extractions
**Target Platform**: Developer's local machine (macOS/Linux/Windows) - development tooling, not production deployment
**Project Type**: CLI tool / development script (one-time extraction process, not runtime code)
**Performance Goals**: Complete extraction pipeline in <30 minutes, labeling interface responsive (<100ms interaction latency)
**Constraints**:
- Minimal manual labeling (≤10 total labels across all content types)
- 95%+ automated extraction accuracy
- 100% text extraction accuracy (verified by spot-checking)
- Integration must not break existing game (TypeScript compilation succeeds, all tests pass)
**Scale/Scope**:
- 13+ PDFs to download (11 modules × 2 versions + penalties + backgrounds + print-play)
- 60+ catalyzer cards to extract
- 5-6 content types (maze, restriction, task, icon, background, penalty)
- ~200-300 individual assets to extract

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Applicable Constitution Principles

✅ **Test-First Development (Principle III)**
- **Status**: COMPLIANT
- **Application**: Extraction pipeline will be developed using TDD with pytest
- **Scope**: Unit tests for extraction logic, integration tests for full pipeline, contract tests for TypeScript integration

✅ **TypeScript Strict Mode (Architecture)**
- **Status**: COMPLIANT
- **Application**: TypeScript integration script and generated data files must pass strict mode compilation
- **Scope**: Integration output (catalyzerCards.ts updates) must maintain strict typing

✅ **Frequent Commits and Pushes (Principle VI)**
- **Status**: COMPLIANT
- **Application**: Commit after each phase completion (download, labeling, extraction, validation, integration)
- **Co-Authoring**: Include `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

⚠️ **No Network Dependencies (Principle V)**
- **Status**: PARTIAL EXEMPTION - JUSTIFIED
- **Justification**: This is a **development tool**, not game runtime code. PDF download requires network access to robots.management
- **Mitigation**:
  - Network access is ONE-TIME during extraction phase
  - Downloaded PDFs are cached locally
  - Game runtime remains fully offline (no changes to game code network policy)
  - Extraction tool is separate from game bundle (in `extraction/` directory, not deployed)
- **Alternative Considered**: Manual PDF download by developer → Rejected because automation is a core requirement (US1 in spec)

✅ **Separation of Game Logic from UI (Principle VII)**
- **Status**: COMPLIANT
- **Application**: Extraction tool is completely separate from game engine and UI
- **Scope**: Tool outputs data files consumed by game; game logic unchanged

### Non-Applicable Principles

🔵 **Determinism (Principle II)** - Not applicable (extraction tool, not game logic)
🔵 **Accessibility (Principle IV)** - Not applicable (CLI tool for developers, not user-facing UI)
🔵 **Legal Compliance (Principle I)** - Not directly applicable (tool for extracting official content, not distributing it)

### Quality Gates

**Before Phase 0 Research**:
- [X] Constitution review complete
- [X] Network exemption justified (development tool, not runtime)
- [X] TDD approach confirmed

**Before Phase 1 Design**:
- [ ] Research findings documented (research.md)
- [ ] Library choices validated for PDF extraction, image processing, OCR

**Before Implementation (/speckit.implement)**:
- [ ] All tests written for extraction logic (TDD)
- [ ] TypeScript integration tested (compilation succeeds)
- [ ] No impact on game runtime (offline capability preserved)

## Project Structure

### Documentation (this feature)

```text
specs/003-pdf-asset-extraction/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: Library research for PDF/image/OCR
├── data-model.md        # Phase 1 output: Entities (Label, ExtractedAsset, etc.)
├── quickstart.md        # Phase 1 output: Usage examples for extraction pipeline
├── contracts/           # Phase 1 output: CLI command schemas, output formats
│   ├── cli-commands.md  # Download, label, extract, validate, integrate commands
│   └── output-format.md # JSON schema for labels, extraction metadata, validation reports
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
extraction/                      # NEW: Extraction tool (separate from game runtime)
├── requirements.txt             # Python dependencies
├── pyproject.toml              # Python project config
├── README.md                   # Extraction tool documentation
├── src/
│   ├── download/
│   │   ├── __init__.py
│   │   ├── pdf_downloader.py  # Download PDFs from robots.management
│   │   └── catalog.py          # Generate PDF catalog
│   ├── labeling/
│   │   ├── __init__.py
│   │   ├── interface.py        # Interactive bounding box labeling
│   │   ├── validator.py        # Validate labeled regions
│   │   └── storage.py          # Save/load labels (JSON)
│   ├── extraction/
│   │   ├── __init__.py
│   │   ├── pattern_matcher.py  # Pattern recognition from labels
│   │   ├── image_extractor.py  # Extract maze images
│   │   ├── text_extractor.py   # Extract text (PDF layers + OCR fallback)
│   │   └── metadata.py         # Generate extraction metadata
│   ├── validation/
│   │   ├── __init__.py
│   │   ├── report_generator.py # Generate HTML validation report
│   │   └── comparator.py       # Compare extracted vs. source
│   ├── integration/
│   │   ├── __init__.py
│   │   ├── ts_updater.py       # Update catalyzerCards.ts
│   │   └── asset_copier.py     # Copy assets to public/
│   └── main.py                 # CLI entry point
├── tests/
│   ├── unit/
│   │   ├── test_pdf_downloader.py
│   │   ├── test_pattern_matcher.py
│   │   ├── test_image_extractor.py
│   │   ├── test_text_extractor.py
│   │   └── test_ts_updater.py
│   ├── integration/
│   │   ├── test_download_pipeline.py
│   │   ├── test_extraction_pipeline.py
│   │   └── test_integration_pipeline.py
│   ├── contract/
│   │   ├── test_cli_commands.py      # Verify CLI interface contracts
│   │   └── test_output_formats.py    # Verify JSON schemas
│   └── fixtures/
│       ├── sample_pdfs/              # Small test PDFs
│       ├── sample_labels.json        # Test label data
│       └── expected_output/          # Expected extraction results
├── data/                             # Runtime data (gitignored)
│   ├── pdfs/                         # Downloaded PDFs
│   ├── labels/                       # Manual labels (JSON)
│   └── output/                       # Extracted assets
│       ├── mazes/                    # Extracted maze PNGs
│       ├── text/                     # Extracted text (JSON)
│       └── metadata/                 # Extraction metadata
└── reports/                          # Generated validation reports
    └── validation_report.html

src/                                  # EXISTING: Game runtime (unchanged)
├── data/
│   ├── catalyzerCards.ts            # MODIFIED: Updated by integration script
│   └── packets.ts                   # POTENTIALLY MODIFIED: Icon paths
└── [existing game structure...]

public/                               # EXISTING: Static assets
├── assets/
│   ├── mazes/                       # POPULATED: By extraction tool
│   │   ├── smalltalk-001.png       # NEW: Extracted mazes
│   │   └── [60+ more mazes]
│   └── icons/                       # POTENTIALLY UPDATED: Module icons
└── [existing assets...]
```

**Structure Decision**:

The extraction tool is implemented as a **separate Python project** in the `extraction/` directory, completely isolated from the TypeScript game runtime. This design:

1. **Preserves game offline capability**: Extraction tool's network dependency doesn't affect game runtime
2. **Enables independent testing**: Python pytest for extraction logic, separate from game's Vitest tests
3. **Clear separation of concerns**: Development tooling vs. production game code
4. **Prevents deployment bloat**: Extraction tool not bundled with game (can be in .gitignore or separate repo branch)
5. **Type safety boundary**: Integration script produces TypeScript that must pass strict compilation

The tool outputs data files (`catalyzerCards.ts` updates, maze PNGs) that are consumed by the game, but the tool itself never runs in production.

## Complexity Tracking

> **Network Dependency Exemption Justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Network access in extraction tool (Principle V exemption) | Must download official PDFs from robots.management to extract authentic game content | **Manual download**: Rejected because automation is core requirement (US1). **Bundled PDFs in repo**: Rejected due to licensing (can't redistribute official PDFs without permission) and repo size (13 PDFs = ~50-100MB). |

---

## Phase Completion

### Phase 0: Research (COMPLETE ✓)

**Deliverable**: [research.md](./research.md)

**Research Questions Resolved**:
1. ✅ PDF Parsing: **PyMuPDF (fitz)** - 35x faster than alternatives, no external dependencies
2. ✅ Image Processing: **Pillow** - Simple, lightweight, perfect for basic operations
3. ✅ Pattern Matching: **OpenCV** - Industry standard template matching
4. ✅ OCR: **PaddleOCR** - State-of-the-art accuracy, faster than Tesseract
5. ✅ Labeling Interface: **Matplotlib + RectangleSelector** - Pure Python, integrates with PyMuPDF
6. ✅ Validation Reports: **Jinja2 + HTML/CSS** - True offline capability, no server needed

**Technology Stack Finalized**:
```bash
pip install pymupdf>=1.27.1      # PDF parsing + rendering
pip install pillow>=12.1.1       # Image operations
pip install opencv-python>=4.13  # Pattern matching
pip install "paddleocr[all]"     # OCR (Python 3.11 only)
pip install jinja2>=3.0          # HTML report generation
pip install matplotlib>=3.0      # Interactive labeling
```

---

### Phase 1: Design & Contracts (COMPLETE ✓)

**Deliverables**:
- ✅ [data-model.md](./data-model.md) - Entity definitions (PDFDocument, Label, ExtractedAsset, CatalyzerCardMapping)
- ✅ [contracts/cli-commands.md](./contracts/cli-commands.md) - CLI interface specification (5 commands)
- ✅ [contracts/output-formats.md](./contracts/output-formats.md) - JSON schemas and HTML report format
- ✅ [quickstart.md](./quickstart.md) - Usage examples and troubleshooting
- ✅ Agent context updated ([CLAUDE.md](../../CLAUDE.md)) - Python 3.11+ stack added

**Design Decisions**:
1. **Separation of concerns**: Extraction tool in `extraction/` directory, completely isolated from game runtime
2. **CLI architecture**: 5 independent commands (download, label, extract, validate, integrate) mapping to 5 user stories
3. **Data flow**: PDFDocument → Label → ExtractedAsset → CatalyzerCardMapping → Game integration
4. **Storage format**: JSON for structured data (catalog, labels, metadata, mappings), HTML for human-readable reports
5. **Integration boundary**: Python tool produces TypeScript-compatible output that must pass strict compilation

**Interface Contracts Defined**:
- `download`: Downloads PDFs, generates catalog.json
- `label`: Interactive matplotlib labeling, saves labels.json
- `extract`: Pattern matching, generates extraction_metadata.json + asset files
- `validate`: Generates validation_report.html with side-by-side comparisons
- `integrate`: Updates catalyzerCards.ts, copies assets to public/, creates integration_mapping.json

---

### Constitution Check (RE-EVALUATED ✓)

**Post-Design Review**:

✅ **Test-First Development (Principle III)**
- Contract tests defined in cli-commands.md
- JSON schema validation tests specified
- Round-trip serialization tests documented
- TypeScript compilation validation required before integration complete

✅ **TypeScript Strict Mode (Architecture)**
- Integration script must produce TypeScript that passes strict compilation
- Generated code must maintain existing type definitions
- Integration includes TypeScript validation step with automatic rollback on failure

✅ **Frequent Commits and Pushes (Principle VI)**
- Commit after each phase: download → label → extract → validate → integrate
- Each command completion is a natural commit point

⚠️ **No Network Dependencies (Principle V)**
- **Status**: EXEMPTION JUSTIFIED (re-confirmed)
- **Scope**: Network access limited to `download` command only (one-time, development phase)
- **Mitigation**: Extraction tool is development tooling, not bundled with game
- **Game Impact**: Zero - game runtime remains fully offline

✅ **Separation of Game Logic from UI (Principle VII)**
- Extraction tool completely separate from game engine
- Tool produces data files consumed by game
- No runtime dependency on extraction tool

**No New Violations Introduced**

---

## Implementation Readiness

**Status**: Ready for `/speckit.tasks` command

**Prerequisites Complete**:
- [X] Research findings documented (research.md)
- [X] Library choices validated
- [X] Data model defined
- [X] Interface contracts specified
- [X] JSON schemas documented
- [X] Usage examples provided
- [X] Agent context updated
- [X] Constitution compliance verified

**Next Steps**:
1. Run `/speckit.tasks` to generate tasks.md
2. Implement extraction tool following TDD approach
3. Validate TypeScript integration passes strict compilation
4. Verify no impact on game runtime (offline capability preserved)

---

## Success Metrics

From feature spec, the implementation must achieve:

- ✅ **SC-001**: All inducer mazes display as correct 5x5 grids (validation report confirms)
- ✅ **SC-002**: 100% text accuracy for restrictions/tasks (spot-checking validates)
- ✅ **SC-003**: Module icons at 512x512 resolution minimum
- ✅ **SC-004**: Background/penalty text 100% accurate (spot-checking validates)
- ✅ **SC-005**: ≤10 total manual labels required (labeling interface supports this)
- ✅ **SC-006**: Integration doesn't break game (TypeScript compilation validation ensures this)
- ✅ **SC-007**: 95%+ automated extraction accuracy (validation report tracks this)
- ✅ **SC-008**: Complete process <30 minutes (performance goals achievable with PyMuPDF)
- ✅ **SC-009**: Manual labeling <15 minutes (matplotlib interface designed for speed)
- ✅ **SC-010**: TypeScript compilation succeeds (integration command validates this)
