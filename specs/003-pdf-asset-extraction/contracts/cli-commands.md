# CLI Command Contracts

**Feature**: PDF Asset Extraction Tool
**Contract Type**: Command-Line Interface
**Created**: 2026-02-22

---

## Overview

The PDF extraction tool exposes a command-line interface with 5 main commands corresponding to the 5 user stories in the feature spec. Each command is independently testable and can be run separately or as part of a pipeline.

**Entry Point**: `python -m extraction.main <command> [options]`

---

## Command 1: `download`

Downloads all official PDFs from robots.management and generates a catalog.

### Synopsis

```bash
python -m extraction.main download [OPTIONS]
```

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--output-dir` | path | No | `./data/pdfs/` | Directory to save downloaded PDFs |
| `--base-url` | URL | No | `https://robots.management/` | Base URL for PDF downloads |
| `--resume` | flag | No | False | Resume interrupted downloads (skip existing files) |
| `--verify` | flag | No | True | Verify file integrity after download |
| `--catalog-path` | path | No | `./data/pdfs/catalog.json` | Path to save catalog file |

### Exit Codes

- `0`: Success - All PDFs downloaded
- `1`: Partial failure - Some PDFs failed to download (see stderr for details)
- `2`: Complete failure - No PDFs downloaded (network error, invalid URL)

### Stdout

Success message with download summary:

```text
✓ Downloaded 13 PDFs (total: 87.4 MB)
✓ Catalog saved to ./data/pdfs/catalog.json

PDFs downloaded:
- 01_small_talk_suspect.pdf (4.2 MB)
- 01_small_talk_investigator.pdf (3.8 MB)
- 02_creative_problem_solving_suspect.pdf (5.1 MB)
...
```

### Stderr

Error messages for failed downloads:

```text
✗ Failed to download 03_imagination_suspect.pdf: HTTP 404 Not Found
✗ Failed to download penalties.pdf: Network timeout
```

### Output Files

- `{output-dir}/*.pdf`: Downloaded PDF files
- `{catalog-path}`: JSON catalog (see [output-formats.md](./output-formats.md#pdf-catalog))

### Example Usage

```bash
# Download to default location
python -m extraction.main download

# Download to custom location
python -m extraction.main download --output-dir /tmp/pdfs/

# Resume interrupted download
python -m extraction.main download --resume
```

### Contract Tests

```python
def test_download_creates_catalog():
    """Verify catalog.json is created with correct schema"""
    result = cli.run(['download', '--output-dir', tmp_dir])
    assert result.exit_code == 0
    assert (tmp_dir / 'catalog.json').exists()
    catalog = json.loads((tmp_dir / 'catalog.json').read_text())
    assert 'pdfs' in catalog
    assert len(catalog['pdfs']) > 0

def test_download_resume_skips_existing():
    """Verify --resume skips already downloaded files"""
    # First download
    cli.run(['download', '--output-dir', tmp_dir])
    existing_file = tmp_dir / '01_small_talk_suspect.pdf'
    original_mtime = existing_file.stat().st_mtime

    # Resume download
    time.sleep(0.1)
    cli.run(['download', '--output-dir', tmp_dir, '--resume'])

    # File should not be re-downloaded (mtime unchanged)
    assert existing_file.stat().st_mtime == original_mtime
```

---

## Command 2: `label`

Interactive interface for manually drawing bounding boxes on PDF pages.

### Synopsis

```bash
python -m extraction.main label [OPTIONS] PDF_PATH
```

### Positional Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `PDF_PATH` | path | Path to PDF file to annotate |

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--page` | integer | No | 0 | Page number to annotate (0-indexed) |
| `--labels-file` | path | No | `./data/labels/labels.json` | Path to labels JSON file |
| `--content-type` | enum | No | Prompt interactively | Content type: maze, restriction, task, icon, background, penalty |
| `--zoom` | float | No | 2.0 | Zoom level for PDF rendering (1.0 = 100%) |

### Exit Codes

- `0`: Success - Labels saved
- `1`: Error - Invalid PDF path or page number
- `2`: Error - Cannot write to labels file

### Stdout

Interactive labeling session:

```text
Labeling: 01_small_talk_suspect.pdf (page 0)

Instructions:
- Click and drag to draw bounding box
- Press 's' to save current box
- Press 'n' to skip to next region
- Press 'q' to quit and save

Current labels: 3
Last saved: maze @ (120.5, 300.0, 250.0, 250.0)

✓ Labels saved to ./data/labels/labels.json
```

### Output Files

- `{labels-file}`: Updated labels JSON (see [output-formats.md](./output-formats.md#labels-file))

### Example Usage

```bash
# Label specific page
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5

# Specify content type upfront
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type maze

# Higher zoom for detailed labeling
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --zoom 3.0
```

### Contract Tests

```python
def test_label_creates_labels_file():
    """Verify labels.json is created with correct schema"""
    # Simulate user drawing one bbox
    result = cli.run(['label', sample_pdf, '--page', '0'], input_sim=mock_draw_bbox())
    assert result.exit_code == 0
    assert labels_file.exists()
    labels = json.loads(labels_file.read_text())
    assert 'labels' in labels
    assert len(labels['labels']) == 1

def test_label_appends_to_existing():
    """Verify new labels are appended to existing labels.json"""
    # Create initial label
    initial_labels = {'labels': [mock_label()]}
    labels_file.write_text(json.dumps(initial_labels))

    # Add new label
    cli.run(['label', sample_pdf, '--page', '1'], input_sim=mock_draw_bbox())

    # Verify both labels exist
    labels = json.loads(labels_file.read_text())
    assert len(labels['labels']) == 2
```

---

## Command 3: `extract`

Automated extraction of assets based on labeled patterns.

### Synopsis

```bash
python -m extraction.main extract [OPTIONS]
```

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--pdfs-dir` | path | No | `./data/pdfs/` | Directory containing PDFs to extract from |
| `--labels-file` | path | No | `./data/labels/labels.json` | Path to labels JSON file |
| `--output-dir` | path | No | `./data/output/` | Directory to save extracted assets |
| `--confidence-threshold` | float | No | 0.8 | Minimum confidence score for automated extraction (0.0-1.0) |
| `--content-types` | enum[] | No | All types | Extract only specific content types: maze, restriction, task, icon, background, penalty |
| `--dry-run` | flag | No | False | Show what would be extracted without saving files |

### Exit Codes

- `0`: Success - All extractions completed
- `1`: Partial success - Some extractions failed (see stderr)
- `2`: Error - No labels found or invalid configuration

### Stdout

Extraction progress and summary:

```text
Starting extraction...

Processing PDFs: 13 total
Labels available: 10 (maze: 3, restriction: 4, task: 2, icon: 1)

[====================] 100% (13/13 PDFs)

Extraction complete:
✓ maze_image: 62 extracted (avg confidence: 0.94)
✓ restriction_text: 45 extracted (avg confidence: 0.98)
✓ task_text: 18 extracted (avg confidence: 0.96)
✓ icon_image: 11 extracted (avg confidence: 1.00)
⚠ Low confidence: 5 assets (see error log)

Output saved to: ./data/output/
Metadata saved to: ./data/output/metadata/extraction_metadata.json
```

### Stderr

Warnings and errors:

```text
⚠ Low confidence extraction: smalltalk-015.png (confidence: 0.72 < threshold: 0.80)
✗ Failed to extract restriction from page 8: No matching pattern found
```

### Output Files

- `{output-dir}/mazes/*.png`: Extracted maze images
- `{output-dir}/icons/*.png`: Extracted module icons
- `{output-dir}/metadata/extraction_metadata.json`: Extraction metadata (see [output-formats.md](./output-formats.md#extraction-metadata))

### Example Usage

```bash
# Extract all content types
python -m extraction.main extract

# Extract only mazes
python -m extraction.main extract --content-types maze

# Higher confidence threshold (stricter matching)
python -m extraction.main extract --confidence-threshold 0.9

# Dry run to preview extractions
python -m extraction.main extract --dry-run
```

### Contract Tests

```python
def test_extract_creates_metadata():
    """Verify extraction_metadata.json is created with correct schema"""
    result = cli.run(['extract', '--pdfs-dir', pdfs_dir, '--labels-file', labels_file])
    assert result.exit_code == 0
    metadata_file = output_dir / 'metadata' / 'extraction_metadata.json'
    assert metadata_file.exists()
    metadata = json.loads(metadata_file.read_text())
    assert 'extracted_assets' in metadata

def test_extract_respects_confidence_threshold():
    """Verify assets below threshold are flagged"""
    result = cli.run(['extract', '--confidence-threshold', '0.95'])
    metadata = json.loads(metadata_file.read_text())
    low_conf = [a for a in metadata['extracted_assets'] if a['confidence_score'] < 0.95]
    # All low-confidence assets should be in stderr warnings
    assert len(low_conf) == result.stderr.count('Low confidence')
```

---

## Command 4: `validate`

Generate HTML validation report comparing extracted assets to source PDFs.

### Synopsis

```bash
python -m extraction.main validate [OPTIONS]
```

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--pdfs-dir` | path | No | `./data/pdfs/` | Directory containing source PDFs |
| `--output-dir` | path | No | `./data/output/` | Directory containing extracted assets |
| `--metadata-file` | path | No | `./data/output/metadata/extraction_metadata.json` | Extraction metadata file |
| `--report-path` | path | No | `./reports/validation_report.html` | Path to save validation report |
| `--sample-size` | integer | No | 10 | Number of random samples to include in detailed comparison |

### Exit Codes

- `0`: Success - Report generated
- `1`: Error - Missing input files or invalid configuration

### Stdout

Report generation summary:

```text
Generating validation report...

Analyzing 136 extracted assets:
- maze_image: 62 assets
- restriction_text: 45 assets
- task_text: 18 assets
- icon_image: 11 assets

Validation results:
✓ Success rate: 97.1% (132/136 assets)
✓ Average confidence: 0.94
⚠ Low confidence: 5 assets
✗ Failed extractions: 4 assets

Report saved to: ./reports/validation_report.html
Open in browser to review side-by-side comparisons.
```

### Output Files

- `{report-path}`: HTML validation report (see [output-formats.md](./output-formats.md#validation-report))

### Example Usage

```bash
# Generate default report
python -m extraction.main validate

# Generate report with more samples
python -m extraction.main validate --sample-size 20

# Custom report location
python -m extraction.main validate --report-path /tmp/report.html
```

### Contract Tests

```python
def test_validate_creates_html_report():
    """Verify HTML report is generated and valid"""
    result = cli.run(['validate'])
    assert result.exit_code == 0
    assert report_path.exists()
    html_content = report_path.read_text()
    assert '<html>' in html_content
    assert 'Validation Report' in html_content

def test_validate_includes_side_by_side_images():
    """Verify report contains embedded images"""
    cli.run(['validate', '--sample-size', '5'])
    html_content = report_path.read_text()
    # Should have base64-encoded images
    assert 'data:image/png;base64,' in html_content
    # Should have at least 10 images (5 samples × 2 images each)
    assert html_content.count('<img') >= 10
```

---

## Command 5: `integrate`

Integrate extracted assets into game TypeScript data structures.

### Synopsis

```bash
python -m extraction.main integrate [OPTIONS]
```

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--output-dir` | path | No | `./data/output/` | Directory containing extracted assets |
| `--metadata-file` | path | No | `./data/output/metadata/extraction_metadata.json` | Extraction metadata file |
| `--catalyzer-file` | path | No | `../src/data/catalyzerCards.ts` | Path to catalyzerCards.ts file to update |
| `--assets-dir` | path | No | `../public/assets/` | Path to public assets directory |
| `--dry-run` | flag | No | False | Show what would be updated without modifying files |
| `--backup` | flag | No | True | Create backup of catalyzerCards.ts before modifying |

### Exit Codes

- `0`: Success - Integration complete, TypeScript compilation passed
- `1`: Partial success - Some mappings failed (see stderr)
- `2`: Error - TypeScript compilation failed after integration (backup restored)
- `3`: Error - Missing input files or invalid configuration

### Stdout

Integration progress and summary:

```text
Starting integration...

Backing up catalyzerCards.ts → catalyzerCards.ts.backup

Updating catalyzerCards.ts:
✓ Updated 60 catalyzer cards
  - Restrictions updated: 45 cards
  - Tasks updated: 18 cards
  - Inducer maze paths updated: 62 cards

Copying assets:
✓ Copied 62 maze images → ../public/assets/mazes/
✓ Copied 11 module icons → ../public/assets/icons/

Validating TypeScript:
✓ TypeScript compilation succeeded (0 errors)

Integration complete!
Mapping saved to: ./data/output/metadata/integration_mapping.json
```

### Stderr

Warnings and errors:

```text
⚠ Missing maze image for card: smalltalk-ltm-15 (using placeholder path)
✗ Failed to map restriction text for violent-robot-03: Asset not found
```

### Output Files

- `{catalyzer-file}`: Updated catalyzerCards.ts
- `{catalyzer-file}.backup`: Backup of original file (if --backup enabled)
- `{assets-dir}/mazes/*.png`: Copied maze images
- `{assets-dir}/icons/*.png`: Copied module icons
- `./data/output/metadata/integration_mapping.json`: Integration mapping (see [output-formats.md](./output-formats.md#integration-mapping))

### Example Usage

```bash
# Integrate with defaults
python -m extraction.main integrate

# Dry run to preview changes
python -m extraction.main integrate --dry-run

# Integrate without backup (risky!)
python -m extraction.main integrate --no-backup
```

### Contract Tests

```python
def test_integrate_updates_catalyzer_cards():
    """Verify catalyzerCards.ts is updated correctly"""
    original_content = catalyzer_file.read_text()
    result = cli.run(['integrate'])
    assert result.exit_code == 0

    updated_content = catalyzer_file.read_text()
    assert updated_content != original_content

    # Verify TypeScript still valid
    tsc_result = subprocess.run(['tsc', '--noEmit'], cwd=game_root, capture_output=True)
    assert tsc_result.returncode == 0

def test_integrate_creates_backup():
    """Verify backup file is created"""
    cli.run(['integrate', '--backup'])
    backup_file = catalyzer_file.parent / f"{catalyzer_file.name}.backup"
    assert backup_file.exists()

def test_integrate_copies_maze_images():
    """Verify maze images are copied to public/assets/mazes/"""
    cli.run(['integrate'])
    mazes_dir = assets_dir / 'mazes'
    png_files = list(mazes_dir.glob('*.png'))
    assert len(png_files) > 0
    # Verify naming convention
    for png in png_files:
        assert re.match(r'[a-z_]+-\d{3}\.png', png.name)
```

---

## Pipeline Usage

All commands can be chained together for full extraction pipeline:

```bash
# Full pipeline
python -m extraction.main download && \
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5 --content-type maze && \
python -m extraction.main extract && \
python -m extraction.main validate && \
python -m extraction.main integrate
```

Or using a shell script:

```bash
#!/bin/bash
set -e  # Exit on first error

echo "=== PDF Asset Extraction Pipeline ==="

echo "Step 1: Downloading PDFs..."
python -m extraction.main download

echo "Step 2: Manual labeling (interactive)..."
echo "Please label at least 2 examples for each content type"
python -m extraction.main label data/pdfs/01_small_talk_suspect.pdf --page 5

echo "Step 3: Automated extraction..."
python -m extraction.main extract

echo "Step 4: Generating validation report..."
python -m extraction.main validate

echo "Step 5: Integration (dry run first)..."
python -m extraction.main integrate --dry-run
read -p "Integration dry run complete. Proceed with actual integration? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python -m extraction.main integrate
fi

echo "=== Pipeline Complete ==="
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | Claude Sonnet 4.5 | Initial CLI contract specification |
