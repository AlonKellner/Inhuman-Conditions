"""
Label validation logic.

Validates labeled bounding boxes based on content type rules.
"""

from typing import Optional, Tuple

from ..models.label import Label, LabelContentType
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


# Validation thresholds
MIN_BOX_SIZE = 50  # Minimum width/height in pixels
MAZE_ASPECT_RATIO_TOLERANCE = 0.3  # Max deviation from 1.0 for square mazes
ICON_ASPECT_RATIO_TOLERANCE = 0.3  # Max deviation from 1.0 for square icons


def validate_label(label: Label) -> Tuple[bool, Optional[str]]:
    """
    Validate a label based on content type rules.

    Args:
        label: Label to validate

    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if label passes validation
        - error_message: None if valid, error description if invalid

    Validation rules:
    - All labels: Bounding box must be >= MIN_BOX_SIZE
    - Maze labels: Must be approximately square (aspect ratio ~1.0)
    - Icon labels: Must be approximately square (aspect ratio ~1.0)
    - Text labels (restriction, task, background, penalty): Can be rectangular
    """
    bbox = label.bounding_box

    # Check minimum size
    if bbox.width < MIN_BOX_SIZE or bbox.height < MIN_BOX_SIZE:
        message = (
            f"Bounding box too small: {bbox.width:.0f}x{bbox.height:.0f}. "
            f"Minimum size is {MIN_BOX_SIZE}x{MIN_BOX_SIZE} pixels."
        )
        logger.warning(f"Label validation failed: {message}")
        return False, message

    # Content-type specific validation
    if label.content_type in [LabelContentType.MAZE, LabelContentType.ICON]:
        # Mazes and icons should be approximately square
        aspect_ratio = bbox.width / bbox.height
        deviation = abs(aspect_ratio - 1.0)

        tolerance = (
            MAZE_ASPECT_RATIO_TOLERANCE
            if label.content_type == LabelContentType.MAZE
            else ICON_ASPECT_RATIO_TOLERANCE
        )

        if deviation > tolerance:
            message = (
                f"{label.content_type.value.capitalize()} bounding box should be square. "
                f"Current aspect ratio: {aspect_ratio:.2f} (width/height). "
                f"Expected: ~1.0 ± {tolerance:.2f}"
            )
            logger.warning(f"Label validation failed: {message}")
            return False, message

    # All validation checks passed
    logger.info(
        f"Label validation passed: {label.content_type.value} "
        f"({bbox.width:.0f}x{bbox.height:.0f})"
    )
    return True, None
