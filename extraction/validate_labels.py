#!/usr/bin/env python3
"""Validate all labeled bounding boxes."""

import fitz
from pathlib import Path
from src.labeling import load_labels
from src.extraction import apply_margin_trim_to_label, validate_margin_trim

LABEL_ZOOM = 2.0
labels_file = Path('data/labels/labels.json')
pdfs_dir = Path('data/pdfs')

labels = load_labels(labels_file)
print(f'Validating {len(labels)} labels with 10% threshold...\n')

failed_labels = []

for label in labels:
    pdf_path = pdfs_dir / label.pdf_filename
    if not pdf_path.exists():
        print(f'ERROR: PDF not found for {label.id}: {pdf_path}')
        continue

    doc = fitz.open(pdf_path)
    page = doc[label.page_number - 1]

    # Convert to PDF coordinate space (unzoom)
    label_bbox = {
        'x': label.bounding_box.x / LABEL_ZOOM,
        'y': label.bounding_box.y / LABEL_ZOOM,
        'width': label.bounding_box.width / LABEL_ZOOM,
        'height': label.bounding_box.height / LABEL_ZOOM
    }

    # Apply trimming
    trimmed_bbox = apply_margin_trim_to_label(page, label_bbox)

    # Validate
    is_valid, error_msg = validate_margin_trim(label_bbox, trimmed_bbox)

    if not is_valid:
        failed_labels.append((label.id, error_msg))
        print(f'❌ {label.id}: {error_msg}')
    else:
        # Calculate margin percentage for display
        original_area = label_bbox['width'] * label_bbox['height']
        trimmed_area = trimmed_bbox['width'] * trimmed_bbox['height']
        margin_pct = ((original_area - trimmed_area) / original_area) * 100
        print(f'✅ {label.id}: PASS ({margin_pct:.1f}% margin)')

    doc.close()

print('')
print('=' * 60)
print('VALIDATION SUMMARY:')
print(f'Total labels: {len(labels)}')
print(f'Passed: {len(labels) - len(failed_labels)}')
print(f'Failed: {len(failed_labels)}')

if len(failed_labels) == 0:
    print('')
    print('✅ ALL LABELS PASS VALIDATION!')
else:
    print('')
    print(f'⚠️  {len(failed_labels)} labels still fail validation')
