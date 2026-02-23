# PDF Asset Extraction Tool

Automated content extraction system that downloads all official Inhuman Conditions PDFs from robots.management, analyzes their structure using minimal manual labeling (2-3 examples per content type), and automatically extracts all game assets (inducer mazes, restriction/task text, module icons) with correct bounding boxes.

## Prerequisites

- Python 3.11+ installed
- `uv` package manager ([install guide](https://github.com/astral-sh/uv))
- ~200MB disk space for PDFs and extracted assets
- Internet connection for initial PDF download
- 10-15 minutes for manual labeling

## Installation

```bash
# Navigate to extraction tool directory
cd extraction/

# Create venv and install all dependencies in one command
uv sync

# Verify installation
uv run python -m src.main --version
```

**Note**: All subsequent commands should be prefixed with `uv run` (e.g., `uv run python -m src.main label ...`)

## Quick Start

### Step 1: Download PDFs (2 minutes)

Download all official PDFs from robots.management:

```bash
python -m src.main download
```

**Expected Output**:
```text
✓ Downloaded 13 PDFs (total: 87.4 MB)
✓ Catalog saved to ./data/pdfs/catalog.json
```

### Step 2: Manual Labeling (5-10 minutes)

**NEW**: You can now label multiple bounding boxes on the same page!

```bash
# Label multiple items on page 5 (mazes, restrictions, icons, etc.)
uv run python -m src.main label data/pdfs/01_small_talk_suspect.pdf --page 5

# Workflow:
# 1. Draw ALL bounding boxes first (click and drag for each)
# 2. Press 'q' when done drawing
# 3. Window closes, then you assign content types in console
# 4. Enter 1-6 for each box (1=maze, 2=restriction, etc.)
# 5. All boxes saved together
```

**Controls**:
- **Zoom**: Scroll wheel to zoom in/out (zooms towards cursor position)
- **Fit page**: Press `0` to reset zoom and fit entire page
- **Delete**: Press `d` to delete last labeled box
- **Save**: Press `q` to save all boxes and close
- **Cancel**: Press `c` to discard all boxes and close
- **Drawing**: Click and drag with mouse to draw bounding boxes

**Goal**: Create at least 2 labels per content type (10 labels total). With multi-box labeling, you can knock this out in 2-3 pages!

### Step 3: Automated Extraction (5 minutes)

Extract all assets based on labeled patterns:

```bash
python -m src.main extract
```

**Expected Output**:
```text
Extraction complete:
✓ maze_image: 62 extracted (avg confidence: 0.94)
✓ restriction_text: 45 extracted (avg confidence: 0.98)
✓ task_text: 18 extracted (avg confidence: 0.96)
✓ icon_image: 11 extracted (avg confidence: 1.00)
```

### Step 4: Validate Results (2 minutes)

Generate HTML validation report:

```bash
python -m src.main validate
```

**Expected Output**:
```text
✓ Success rate: 97.1% (132/136 assets)
Report saved to: ./reports/validation_report.html
```

**Review**: Open `reports/validation_report.html` in browser.

### Step 5: Integrate into Game (2 minutes)

Update catalyzerCards.ts and copy assets:

```bash
# Dry run first (preview changes)
python -m src.main integrate --dry-run

# Actual integration
python -m src.main integrate
```

**Expected Output**:
```text
✓ Updated 60 catalyzer cards
✓ Copied 62 maze images → ../public/assets/mazes/
✓ TypeScript compilation succeeded (0 errors)
```

## Commands

- `download` - Download all official PDFs from robots.management
- `label` - Interactive bounding box labeling for content types
- `extract` - Automated extraction based on labeled patterns
- `validate` - Generate HTML validation report
- `integrate` - Update TypeScript data files with extracted content

## Documentation

For complete documentation, see:
- [Quick Start Guide](../specs/003-pdf-asset-extraction/quickstart.md)
- [CLI Commands](../specs/003-pdf-asset-extraction/contracts/cli-commands.md)
- [Output Formats](../specs/003-pdf-asset-extraction/contracts/output-formats.md)
- [Implementation Plan](../specs/003-pdf-asset-extraction/plan.md)

## Performance Expectations

| Phase | Time | Bottleneck |
|-------|------|------------|
| Download | 2-5 min | Network speed |
| Labeling | 10-15 min | Manual effort (2 labels × 5 content types) |
| Extraction | 5-10 min | Pattern matching, OCR (if needed) |
| Validation | 1-2 min | Image comparison |
| Integration | 1-2 min | File I/O, TypeScript compilation |
| **Total** | **20-30 min** | |

## Troubleshooting

See [Quick Start Guide - Troubleshooting](../specs/003-pdf-asset-extraction/quickstart.md#troubleshooting) for common issues and solutions.

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | Claude Sonnet 4.5 | Initial implementation |

## License

MIT
