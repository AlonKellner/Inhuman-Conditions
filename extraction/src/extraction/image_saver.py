"""Save extracted card images to disk."""

import fitz  # PyMuPDF
from pathlib import Path
from typing import Dict

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def save_extracted_card(
    pdf_page: fitz.Page,
    card_bbox: Dict,
    output_dir: Path,
    card_id: str
) -> Path:
    """
    Save an extracted card as a PNG image.

    Args:
        pdf_page: PyMuPDF page object
        card_bbox: Bounding box dictionary with {x, y, width, height}
        output_dir: Directory to save extracted images
        card_id: Unique identifier for the card (used in filename)

    Returns:
        Path to saved image file
    """
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)

    # Extract region from PDF
    rect = fitz.Rect(
        card_bbox['x'],
        card_bbox['y'],
        card_bbox['x'] + card_bbox['width'],
        card_bbox['y'] + card_bbox['height']
    )

    # Render at 2x zoom for web display
    pix = pdf_page.get_pixmap(clip=rect, matrix=fitz.Matrix(2, 2))

    # Generate filename (card_id already includes content type)
    filename = f"{card_id}.png"
    output_path = output_dir / filename

    # Save as PNG
    pix.save(output_path)

    logger.debug(f"Saved extracted card: {output_path}")
    return output_path
