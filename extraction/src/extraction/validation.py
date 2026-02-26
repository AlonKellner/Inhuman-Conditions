"""Validation for extractions and labels."""

from typing import Dict, Tuple

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def validate_margin_trim(original_bbox: Dict, trimmed_bbox: Dict) -> Tuple[bool, str]:
    """
    Validate that margin trimming is correct.

    Requirements:
    1. Must have non-zero white margin (>2 pixels on any side)
    2. Trimmed margin must be small (<15% of total area)

    Args:
        original_bbox: Original bounding box with {x, y, width, height}
        trimmed_bbox: Trimmed bounding box with {x, y, width, height}

    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if validation passes
        - error_message: Empty string if valid, error description if invalid
    """
    # Calculate margin sizes
    left_margin = trimmed_bbox['x'] - original_bbox['x']
    top_margin = trimmed_bbox['y'] - original_bbox['y']
    right_margin = (original_bbox['x'] + original_bbox['width']) - \
                   (trimmed_bbox['x'] + trimmed_bbox['width'])
    bottom_margin = (original_bbox['y'] + original_bbox['height']) - \
                    (trimmed_bbox['y'] + trimmed_bbox['height'])

    # Check non-zero margin (>2 pixels on any side)
    max_margin = max(left_margin, top_margin, right_margin, bottom_margin)
    if max_margin <= 2:
        error_msg = (
            f"FATAL: No white margin detected (max margin: {max_margin:.1f}px). "
            f"Expected >2px on at least one side. "
            f"Margins: L={left_margin:.1f}, T={top_margin:.1f}, "
            f"R={right_margin:.1f}, B={bottom_margin:.1f}"
        )
        logger.error(error_msg)
        return False, error_msg

    # Check small margin (<15% of total area)
    original_area = original_bbox['width'] * original_bbox['height']
    trimmed_area = trimmed_bbox['width'] * trimmed_bbox['height']
    margin_percentage = ((original_area - trimmed_area) / original_area) * 100

    if margin_percentage >= 15:
        error_msg = (
            f"FATAL: Trimmed margin too large ({margin_percentage:.1f}%). "
            f"Expected <15% of total area. "
            f"Original area: {original_area:.1f}px², "
            f"Trimmed area: {trimmed_area:.1f}px²"
        )
        logger.error(error_msg)
        return False, error_msg

    # Validation passed
    logger.debug(
        f"Validation passed: max_margin={max_margin:.1f}px, "
        f"margin_percentage={margin_percentage:.1f}%"
    )
    return True, ""
