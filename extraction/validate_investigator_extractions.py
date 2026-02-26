#!/usr/bin/env python3
"""Validate extracted investigator card images."""

from pathlib import Path
from PIL import Image
import numpy as np

# Pattern dimensions from extraction (trimmed from labels)
# Investigator cards are landscape: ~577×200
PATTERN_WIDTH = 577.0
PATTERN_HEIGHT = 199.5  # Average from patterns
RENDER_ZOOM = 2.0

# Expected extracted image dimensions
EXPECTED_WIDTH = int(PATTERN_WIDTH * RENDER_ZOOM)
EXPECTED_HEIGHT = int(PATTERN_HEIGHT * RENDER_ZOOM)

WHITE_THRESHOLD = 240

output_dir = Path('data/output')
investigator_cards = sorted(output_dir.glob('*_investigator_*.png'))

print(f'Validating {len(investigator_cards)} investigator cards...\n')

failed = []

for i, card_path in enumerate(investigator_cards, 1):
    img = Image.open(card_path)
    img_array = np.array(img)

    width, height = img.size

    # Check dimensions (±5 pixels tolerance)
    width_ok = abs(width - EXPECTED_WIDTH) <= 5
    height_ok = abs(height - EXPECTED_HEIGHT) <= 5

    # Check for white margins
    if len(img_array.shape) == 3:
        non_white = np.any(img_array < WHITE_THRESHOLD, axis=2)
    else:
        non_white = img_array < WHITE_THRESHOLD

    top_white = not np.any(non_white[0, :])
    bottom_white = not np.any(non_white[-1, :])
    left_white = not np.any(non_white[:, 0])
    right_white = not np.any(non_white[:, -1])

    has_margins = top_white or bottom_white or left_white or right_white

    if not (width_ok and height_ok and has_margins):
        errors = []
        if not width_ok:
            errors.append(f'width {width} (expected ~{EXPECTED_WIDTH})')
        if not height_ok:
            errors.append(f'height {height} (expected ~{EXPECTED_HEIGHT})')
        if not has_margins:
            errors.append('no white margins')
        failed.append((card_path.name, ', '.join(errors)))
        print(f'❌ {card_path.name}: {", ".join(errors)}')
    else:
        if i <= 5 or i % 20 == 0:
            print(f'✅ {card_path.name}: {width}x{height}')

print('')
print('=' * 60)
print(f'Total investigator cards: {len(investigator_cards)}')
print(f'Passed: {len(investigator_cards) - len(failed)}')
print(f'Failed: {len(failed)}')

if len(failed) == 0:
    print('')
    print('✅ ALL INVESTIGATOR EXTRACTIONS PASS VALIDATION!')
else:
    print('')
    for name, error in failed[:10]:
        print(f'  - {name}: {error}')
