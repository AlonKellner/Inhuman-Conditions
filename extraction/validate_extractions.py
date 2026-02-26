#!/usr/bin/env python3
"""Validate extracted card images."""

import fitz
from pathlib import Path
from PIL import Image
import numpy as np

# Pattern dimensions from extraction (trimmed from labels)
PATTERN_WIDTH = 199.0
PATTERN_HEIGHT = 577.0
RENDER_ZOOM = 2.0

# Expected extracted image dimensions (pattern * zoom)
EXPECTED_WIDTH = int(PATTERN_WIDTH * RENDER_ZOOM)
EXPECTED_HEIGHT = int(PATTERN_HEIGHT * RENDER_ZOOM)

# White threshold for margin detection
WHITE_THRESHOLD = 240

output_dir = Path('data/output')

# Find all extracted cards
extracted_cards = sorted(output_dir.glob('*.png'))

print(f'Validating {len(extracted_cards)} extracted cards...\n')

failed_extractions = []

for i, card_path in enumerate(extracted_cards, 1):
    # Load image
    img = Image.open(card_path)
    img_array = np.array(img)

    # Check dimensions
    actual_width, actual_height = img.size

    # Allow some tolerance for rounding (±5 pixels)
    width_ok = abs(actual_width - EXPECTED_WIDTH) <= 5
    height_ok = abs(actual_height - EXPECTED_HEIGHT) <= 5

    # Check for white margins (edges should have some white pixels)
    # Find non-white pixels
    if len(img_array.shape) == 3:  # RGB
        non_white = np.any(img_array < WHITE_THRESHOLD, axis=2)
    else:  # Grayscale
        non_white = img_array < WHITE_THRESHOLD

    # Check edges for white margins
    top_row_white = not np.any(non_white[0, :])
    bottom_row_white = not np.any(non_white[-1, :])
    left_col_white = not np.any(non_white[:, 0])
    right_col_white = not np.any(non_white[:, -1])

    has_margins = top_row_white or bottom_row_white or left_col_white or right_col_white

    if not (width_ok and height_ok and has_margins):
        error_parts = []
        if not width_ok:
            error_parts.append(f'width {actual_width} (expected ~{EXPECTED_WIDTH})')
        if not height_ok:
            error_parts.append(f'height {actual_height} (expected ~{EXPECTED_HEIGHT})')
        if not has_margins:
            error_parts.append('no white margins detected')

        error_msg = ', '.join(error_parts)
        failed_extractions.append((card_path.name, error_msg))
        print(f'❌ {card_path.name}: {error_msg}')
    else:
        if i <= 5 or i % 20 == 0:  # Show first 5 and every 20th
            print(f'✅ {card_path.name}: {actual_width}x{actual_height}')

print('')
print('=' * 60)
print('VALIDATION SUMMARY:')
print(f'Total extractions: {len(extracted_cards)}')
print(f'Passed: {len(extracted_cards) - len(failed_extractions)}')
print(f'Failed: {len(failed_extractions)}')

if len(failed_extractions) == 0:
    print('')
    print('✅ ALL EXTRACTIONS PASS VALIDATION!')
    print(f'   All {len(extracted_cards)} cards have correct dimensions and margins')
else:
    print('')
    print(f'⚠️  {len(failed_extractions)} extractions fail validation')
    print('')
    for name, error in failed_extractions[:10]:  # Show first 10 failures
        print(f'  - {name}: {error}')
    if len(failed_extractions) > 10:
        print(f'  ... and {len(failed_extractions) - 10} more')
