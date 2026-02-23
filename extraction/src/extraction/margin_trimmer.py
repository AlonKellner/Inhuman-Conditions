"""White margin trimming for labeled bounding boxes."""

import fitz  # PyMuPDF
import numpy as np
from PIL import Image
from typing import Dict, Tuple

from ..utils.logging_config import get_logger

logger = get_logger(__name__)

WHITE_THRESHOLD = 240  # Pixels with RGB values > 240 are considered white


def trim_white_margins(image: Image.Image) -> Tuple[int, int, int, int]:
    """
    Detect and trim white margins from an image.

    Args:
        image: PIL Image to process

    Returns:
        Tuple of (x_offset, y_offset, trimmed_width, trimmed_height)
        representing the content bounding box
    """
    # Convert to numpy array
    img_array = np.array(image)

    logger.debug(f"Image shape: {img_array.shape}, dtype: {img_array.dtype}")

    # Find non-white pixels (any channel < WHITE_THRESHOLD)
    if len(img_array.shape) == 3:  # RGB
        non_white = np.any(img_array < WHITE_THRESHOLD, axis=2)
    else:  # Grayscale
        non_white = img_array < WHITE_THRESHOLD

    # Find bounding box of non-white content
    rows = np.any(non_white, axis=1)
    cols = np.any(non_white, axis=0)

    logger.debug(f"Rows with content: {rows.sum()}/{len(rows)}, Cols with content: {cols.sum()}/{len(cols)}")

    if not rows.any() or not cols.any():
        # No content found, return original dimensions
        logger.warning("No non-white content found in image")
        return 0, 0, image.width, image.height

    y_min, y_max = np.where(rows)[0][[0, -1]]
    x_min, x_max = np.where(cols)[0][[0, -1]]

    logger.debug(f"Content bounds: x=[{x_min}, {x_max}], y=[{y_min}, {y_max}]")

    return x_min, y_min, x_max - x_min + 1, y_max - y_min + 1


def apply_margin_trim_to_label(pdf_page: fitz.Page, label_bbox: Dict) -> Dict:
    """
    Apply white margin trimming to a labeled bounding box.

    Args:
        pdf_page: PyMuPDF page object
        label_bbox: Dictionary with keys {x, y, width, height}

    Returns:
        New bounding box dictionary with trimmed dimensions
    """
    # Extract labeled region from PDF
    rect = fitz.Rect(
        label_bbox['x'],
        label_bbox['y'],
        label_bbox['x'] + label_bbox['width'],
        label_bbox['y'] + label_bbox['height']
    )

    logger.debug(f"Rendering rect: {rect}, is_valid: {rect.is_valid}, is_empty: {rect.is_empty}")
    logger.debug(f"Page bounds: {pdf_page.bound()}, Page size: {pdf_page.rect}")

    # Intersect rect with page bounds to ensure it's within page
    page_rect = pdf_page.rect
    clipped_rect = rect & page_rect  # Intersection
    logger.debug(f"Clipped rect: {clipped_rect}")

    # Render region at 2x zoom
    pix = pdf_page.get_pixmap(clip=clipped_rect, matrix=fitz.Matrix(2, 2))
    logger.debug(f"Pixmap dimensions: {pix.width}x{pix.height}")
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    # Trim white margins
    trim_x, trim_y, trim_w, trim_h = trim_white_margins(img)

    # Adjust bounding box (account for 2x zoom)
    trimmed_bbox = {
        'x': label_bbox['x'] + (trim_x / 2),
        'y': label_bbox['y'] + (trim_y / 2),
        'width': trim_w / 2,
        'height': trim_h / 2
    }

    # Calculate margins for debugging
    left_m = trim_x / 2
    top_m = trim_y / 2
    right_m = (label_bbox['width'] - trimmed_bbox['width'] - left_m)
    bottom_m = (label_bbox['height'] - trimmed_bbox['height'] - top_m)
    area_pct = ((label_bbox['width'] * label_bbox['height'] - trimmed_bbox['width'] * trimmed_bbox['height']) /
                (label_bbox['width'] * label_bbox['height']) * 100)

    logger.debug(
        f"Trimmed margins: original ({label_bbox['width']:.1f}x{label_bbox['height']:.1f}) "
        f"-> trimmed ({trimmed_bbox['width']:.1f}x{trimmed_bbox['height']:.1f}), "
        f"margins L={left_m:.1f} T={top_m:.1f} R={right_m:.1f} B={bottom_m:.1f}, "
        f"area trimmed={area_pct:.1f}%"
    )

    return trimmed_bbox
