# Quick Start Guide: PDF Asset Extraction

**Feature**: Automated PDF Asset Extraction
**Created**: 2026-02-22
**For**: Developers extracting official game assets from PDFs

---

## Prerequisites

- Python 3.11+ installed
- ~200MB disk space for PDFs and extracted assets
- Internet connection for initial PDF download
- 10-15 minutes for manual labeling

---

## Installation

```bash
# Navigate to extraction tool directory
cd extraction/

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -m extraction.main --version
```

---

## Quick Start: 5-Minute Walkthrough

### Step 1: Download PDFs (2 minutes)

Download all official PDFs from robots.management:

```bash
python -m extraction.main download
```

**Expected Output**:
```text
✓ Downloaded 13 PDFs (total: 87.4 MB)
✓ Catalog saved to ./data/pdfs/catalog.json
```

**Verify**: Check that `data/pdfs/` contains 13 PDF files.

---

### Step 2: Manual Labeling (5-10 minutes)

Label 2-3 examples for each content type (maze, restriction, task, icon, background, penalty).

#### Label a maze example:

```bash
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type maze
```

**Interactive Steps**:
1. PDF page opens in matplotlib window
2. Click and drag to draw bounding box around inducer maze (5x5 grid)
3. Press 's' to save
4. Press 'q' to quit

**Repeat for other content types**:
```bash
# Label restriction text
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type restriction

# Label task text (violent robot card)
python -m extraction.main label data/pdfs/02_creative_problem_solving_suspect.pdf --page 8 --content-type task

# Label module icon
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 0 --content-type icon
```

**Goal**: Create at least 2 labels per content type (10 labels total).

**Verify**: Check `data/labels/labels.json` contains your labels.

---

### Step 3: Automated Extraction (5 minutes)

Extract all assets based on labeled patterns:

```bash
python -m extraction.main extract
```

**Expected Output**:
```text
Extraction complete:
✓ maze_image: 62 extracted (avg confidence: 0.94)
✓ restriction_text: 45 extracted (avg confidence: 0.98)
✓ task_text: 18 extracted (avg confidence: 0.96)
✓ icon_image: 11 extracted (avg confidence: 1.00)
```

**Verify**: Check `data/output/mazes/` contains PNG images.

---

### Step 4: Validate Results (2 minutes)

Generate HTML validation report:

```bash
python -m extraction.main validate
```

**Expected Output**:
```text
✓ Success rate: 97.1% (132/136 assets)
Report saved to: ./reports/validation_report.html
```

**Review**: Open `reports/validation_report.html` in browser.

---

### Step 5: Integrate into Game (2 minutes)

Update catalyzerCards.ts and copy assets:

```bash
# Dry run first (preview changes)
python -m extraction.main integrate --dry-run

# Actual integration
python -m extraction.main integrate
```

**Expected Output**:
```text
✓ Updated 60 catalyzer cards
✓ Copied 62 maze images → ../public/assets/mazes/
✓ TypeScript compilation succeeded (0 errors)
```

**Verify**: Run game and check that mazes display correctly.

---

## Common Use Cases

### Use Case 1: Extract Only Mazes

If you only need maze images:

```bash
# Label 2-3 maze examples
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type maze

# Extract only mazes
python -m extraction.main extract --content-types maze

# Validate
python -m extraction.main validate

# Integrate
python -m extraction.main integrate
```

---

### Use Case 2: Higher Quality Threshold

For stricter matching (fewer false positives, may miss some assets):

```bash
# Extract with 90% confidence threshold (default: 80%)
python -m extraction.main extract --confidence-threshold 0.9
```

Assets below threshold will be flagged in validation report for manual review.

---

### Use Case 3: Resume Interrupted Extraction

If download or extraction is interrupted:

```bash
# Resume download (skip already downloaded PDFs)
python -m extraction.main download --resume

# Re-run extraction (existing assets won't be re-extracted)
python -m extraction.main extract
```

---

### Use Case 4: Multiple Labeling Sessions

You can label in multiple sessions (labels are appended):

```bash
# Session 1: Label mazes
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type maze

# Session 2: Label restrictions (tomorrow)
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type restriction

# All labels are saved to same labels.json file
```

---

### Use Case 5: Re-extract After More Labeling

If extraction accuracy is low, add more labels and re-extract:

```bash
# Check validation report - success rate only 85%
python -m extraction.main validate

# Add 2 more labels per content type
python -m extraction.main label data/pdfs/03_imagination_suspect.pdf --page 7 --content-type maze
python -m extraction.main label data/pdfs/04_history_suspect.pdf --page 10 --content-type maze

# Re-run extraction with more training data
python -m extraction.main extract

# Validate again - success rate should improve
python -m extraction.main validate
```

---

## Troubleshooting

### Problem: Low Extraction Accuracy (<95%)

**Symptoms**:
- Validation report shows success rate <95%
- Many "low confidence" warnings in extraction output

**Solutions**:
1. **Add more labels**: Label 1-2 more examples per content type from different PDF modules
2. **Lower confidence threshold**: Use `--confidence-threshold 0.7` (but review low-confidence extractions manually)
3. **Review labeled regions**: Ensure bounding boxes tightly fit content (not too much whitespace)

---

### Problem: TypeScript Compilation Fails After Integration

**Symptoms**:
- `integrate` command exits with code 2
- Error message: "TypeScript compilation failed"

**Solutions**:
1. **Check backup**: Integration automatically creates backup (`catalyzerCards.ts.backup`)
2. **Restore backup**: `cp src/data/catalyzerCards.ts.backup src/data/catalyzerCards.ts`
3. **Review extraction metadata**: Check `data/output/metadata/extraction_metadata.json` for malformed text
4. **Report issue**: Check integration mapping (`data/output/metadata/integration_mapping.json`) for failed cards

---

### Problem: Incorrect Maze Images

**Symptoms**:
- Validation report shows mazes are cropped incorrectly
- Mazes missing 5x5 grid structure

**Solutions**:
1. **Check label bounding boxes**: Open PDF in viewer, verify labeled region is exactly the maze (no extra whitespace)
2. **Increase zoom**: Use `--zoom 3.0` when labeling for better precision
3. **Review template matching**: Check `extraction_metadata.json` to see which template was used
4. **Label more examples**: Add diverse maze examples from different PDF layouts

---

### Problem: Download Fails for Some PDFs

**Symptoms**:
- Download command exits with code 1
- Stderr shows "HTTP 404 Not Found" or "Network timeout"

**Solutions**:
1. **Check URL**: Verify PDFs still exist at robots.management (website may have changed)
2. **Resume download**: Use `--resume` flag to download missing PDFs
3. **Manual download**: Download PDFs manually and place in `data/pdfs/`
4. **Update catalog**: Edit `catalog.json` to add manually downloaded PDFs

---

### Problem: Text Extraction Garbled (OCR Issues)

**Symptoms**:
- Restriction/task text contains typos or nonsensical characters
- Validation report shows text mismatches

**Solutions**:
1. **Check PDF text layer**: PDFs should have embedded text (not scanned images)
2. **Verify OCR confidence**: Check `metadata.ocr_confidence` in extraction metadata
3. **Manual correction**: Edit `extraction_metadata.json` to fix text_content
4. **Re-integrate**: Run `integrate` command after manual fixes

---

## Directory Structure After Extraction

```text
extraction/
├── data/
│   ├── pdfs/                         # Downloaded PDFs (87 MB)
│   │   ├── 01_small_talk_suspect.pdf
│   │   ├── 01_small_talk_investigator.pdf
│   │   ├── ... (13 PDFs total)
│   │   └── catalog.json              # PDF metadata
│   ├── labels/
│   │   └── labels.json               # Manual annotations (10 labels)
│   └── output/
│       ├── mazes/
│       │   ├── smalltalk-001.png
│       │   ├── smalltalk-002.png
│       │   └── ... (62 mazes total)
│       ├── icons/
│       │   └── ... (11 module icons)
│       └── metadata/
│           ├── extraction_metadata.json    # Asset records
│           └── integration_mapping.json    # Game integration tracking
├── reports/
│   └── validation_report.html        # Open in browser to review
└── src/
    └── ... (Python source code)

../src/data/
└── catalyzerCards.ts                 # UPDATED with extracted content

../public/assets/
├── mazes/                            # POPULATED with maze PNGs
│   ├── smalltalk-001.png
│   └── ... (62 mazes total)
└── icons/                            # UPDATED with module icons
```

---

## Performance Expectations

| Phase | Time | Bottleneck |
|-------|------|------------|
| Download | 2-5 min | Network speed |
| Labeling | 10-15 min | Manual effort (2 labels × 5 content types) |
| Extraction | 5-10 min | Pattern matching, OCR (if needed) |
| Validation | 1-2 min | Image comparison |
| Integration | 1-2 min | File I/O, TypeScript compilation |
| **Total** | **20-30 min** | |

---

## Next Steps After Quickstart

1. **Review validation report**: Open `reports/validation_report.html` in browser
2. **Spot-check extracted assets**: Manually verify 5-10 random mazes match source PDFs
3. **Run game tests**: Verify existing tests still pass (`npm test`)
4. **Test in-game**: Run game and check that mazes display correctly during interview

---

## Advanced Usage

See [cli-commands.md](./contracts/cli-commands.md) for full command reference and options.

See [output-formats.md](./contracts/output-formats.md) for JSON schema specifications.

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | Claude Sonnet 4.5 | Initial quickstart guide |
