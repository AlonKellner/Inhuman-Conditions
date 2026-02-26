"""Position pattern extraction and application for card extraction."""

import fitz  # PyMuPDF
import numpy as np
from typing import List, Dict

from ..models.label import Label
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def extract_position_patterns(labeled_cards: List[Label]) -> Dict:
    """
    Extract position patterns from labeled cards.

    Given labeled cards (typically 3 cards per page across multiple pages),
    infer the grid layout (row/column positions).

    Args:
        labeled_cards: List of Label objects with bounding_box, page_number

    Returns:
        Dictionary with:
        - row_positions: List of y-coordinates for card rows (sorted)
        - col_positions: List of x-coordinates for card columns (sorted)
        - card_width: Average card width
        - card_height: Average card height
    """
    # Group cards by page to find patterns
    cards_by_page: Dict[int, List[Label]] = {}
    for card in labeled_cards:
        page = card.page_number
        if page not in cards_by_page:
            cards_by_page[page] = []
        cards_by_page[page].append(card)

    # Analyze first page with cards to extract pattern
    sample_page_num = min(cards_by_page.keys())
    sample_page = cards_by_page[sample_page_num]

    if len(sample_page) < 3:
        logger.warning(
            f"Sample page {sample_page_num} has only {len(sample_page)} cards. "
            f"Expected 3 cards per page."
        )

    # Extract coordinates
    y_coords = sorted([card.bounding_box.y for card in sample_page])
    x_coords = sorted([card.bounding_box.x for card in sample_page])

    # Cluster nearby positions (e.g., from different PDFs with same card positions)
    # This handles cases where we have labels from multiple PDFs
    position_tolerance = 50  # px - positions within this distance are considered the same card

    def cluster_positions(coords: List[float], tolerance: float) -> List[float]:
        """Cluster nearby positions and return their averages."""
        if not coords:
            return []

        clusters: List[List[float]] = []
        for coord in coords:
            # Find existing cluster within tolerance
            added = False
            for cluster in clusters:
                if abs(coord - np.mean(cluster)) <= tolerance:
                    cluster.append(coord)
                    added = True
                    break

            # Create new cluster if no match
            if not added:
                clusters.append([coord])

        # Return average of each cluster
        return [float(np.mean(cluster)) for cluster in clusters]

    # Cluster positions to handle labels from multiple PDFs
    clustered_y = cluster_positions(y_coords, position_tolerance)
    clustered_x = cluster_positions(x_coords, position_tolerance)

    # Calculate average dimensions
    widths = [card.bounding_box.width for card in sample_page]
    heights = [card.bounding_box.height for card in sample_page]

    pattern = {
        'row_positions': clustered_y,
        'col_positions': clustered_x,
        'card_width': float(np.mean(widths)),
        'card_height': float(np.mean(heights))
    }

    logger.info(
        f"Extracted position pattern from {len(sample_page)} labels: "
        f"{len(clustered_y)} rows, {len(clustered_x)} columns "
        f"(clustered from {len(y_coords)} y-coords, {len(x_coords)} x-coords), "
        f"avg size {pattern['card_width']:.1f}x{pattern['card_height']:.1f}"
    )

    return pattern


def apply_pattern_to_pdf_page(
    pdf_page: fitz.Page,
    pattern: Dict,
    page_type: str
) -> List[Dict]:
    """
    Apply position pattern to extract cards from a new PDF page.

    Before trimming, expands bounding boxes by EQUAL pixel margins on all sides.
    Target expansion: ~9% area increase (staying below 10% validation threshold).

    For cards with area A = W×H, to get 1.09×A with equal margin M on each side:
    (W + 2M)(H + 2M) = 1.09×W×H
    Solving for M: M ≈ 0.09×W×H / (2(W + H))

    Args:
        pdf_page: PyMuPDF page object
        pattern: Position pattern from extract_position_patterns()
        page_type: Content type (e.g., 'human-card', 'patient-card', 'violent-card')

    Returns:
        List of extracted bounding boxes with content_type (pre-expanded for robust trimming)
    """
    extracted_cards = []

    # Calculate equal pixel margin on all sides for ~9% area increase
    # M = 0.09 × W × H / (2(W + H))
    W = pattern['card_width']
    H = pattern['card_height']
    area = W * H
    perimeter_sum = W + H

    # Target 9% area increase with equal pixel margins
    margin = (0.09 * area) / (2 * perimeter_sum)

    logger.debug(f"Expansion: {margin:.1f}px margin on each side for {W:.1f}x{H:.1f} cards")

    # Extract cards based on the pattern layout
    # Cards can be arranged in 1D (horizontal/vertical) or 2D (grid) layouts

    # Get page bounds to ensure expanded boxes stay within page
    page_rect = pdf_page.rect

    # Support both 1D and 2D layouts by using nested loops
    # If only one row/column, the inner loop runs once
    for y_pos in pattern['row_positions']:
        for x_pos in pattern['col_positions']:
            # Expand bounding box equally on all sides for robust trimming
            expanded_x = max(0, x_pos - margin)  # Don't go below 0
            expanded_y = max(0, y_pos - margin)
            expanded_width = min(
                pattern['card_width'] + 2 * margin,
                page_rect.width - expanded_x  # Don't exceed page width
            )
            expanded_height = min(
                pattern['card_height'] + 2 * margin,
                page_rect.height - expanded_y  # Don't exceed page height
            )

            bbox = {
                'x': expanded_x,
                'y': expanded_y,
                'width': expanded_width,
                'height': expanded_height,
                'content_type': page_type,
                'confidence': 1.0
            }
            extracted_cards.append(bbox)

    logger.debug(
        f"Applied pattern to extract {len(extracted_cards)} cards "
        f"of type '{page_type}' from PDF page "
        f"({len(pattern['row_positions'])} rows × {len(pattern['col_positions'])} cols, "
        f"expanded by {margin:.1f}px equally on each side for robust trimming)"
    )

    return extracted_cards
