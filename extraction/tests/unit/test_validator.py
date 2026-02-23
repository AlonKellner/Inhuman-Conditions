"""
Unit tests for label validation.
"""

from pathlib import Path

import pytest

from src.models.label import Label, BoundingBox, LabelContentType
from datetime import datetime


class TestLabelValidator:
    """Test label validation logic."""

    def test_validate_label_accepts_valid_maze_label(self) -> None:
        """Verify validation passes for valid maze label with 5x5 grid aspect ratio."""
        from src.labeling.validator import validate_label

        # Maze should be roughly square (5x5 grid)
        bbox = BoundingBox(x=100, y=100, width=300, height=300)
        label = Label(
            id="test-001",
            pdf_filename="test.pdf",
            page_number=1,
            content_type=LabelContentType.MAZE,
            bounding_box=bbox,
            labeled_by="test",
            timestamp=datetime.now(),
        )

        is_valid, message = validate_label(label)
        assert is_valid is True
        assert message is None or "valid" in message.lower()

    def test_validate_label_rejects_non_square_maze(self) -> None:
        """Verify validation fails for maze with incorrect aspect ratio."""
        from src.labeling.validator import validate_label

        # Maze too wide (not square)
        bbox = BoundingBox(x=100, y=100, width=500, height=200)
        label = Label(
            id="test-002",
            pdf_filename="test.pdf",
            page_number=1,
            content_type=LabelContentType.MAZE,
            bounding_box=bbox,
            labeled_by="test",
            timestamp=datetime.now(),
        )

        is_valid, message = validate_label(label)
        assert is_valid is False
        assert "aspect ratio" in message.lower() or "square" in message.lower()

    def test_validate_label_accepts_text_blocks(self) -> None:
        """Verify validation passes for text content (restriction, task)."""
        from src.labeling.validator import validate_label

        # Text blocks can be rectangular
        bbox = BoundingBox(x=50, y=100, width=400, height=150)
        label = Label(
            id="test-003",
            pdf_filename="test.pdf",
            page_number=1,
            content_type=LabelContentType.RESTRICTION,
            bounding_box=bbox,
            labeled_by="test",
            timestamp=datetime.now(),
        )

        is_valid, message = validate_label(label)
        assert is_valid is True

    def test_validate_label_rejects_tiny_bounding_boxes(self) -> None:
        """Verify validation fails for unreasonably small bounding boxes."""
        from src.labeling.validator import validate_label

        # Bounding box too small (< 50x50 pixels)
        bbox = BoundingBox(x=100, y=100, width=20, height=20)
        label = Label(
            id="test-004",
            pdf_filename="test.pdf",
            page_number=1,
            content_type=LabelContentType.MAZE,
            bounding_box=bbox,
            labeled_by="test",
            timestamp=datetime.now(),
        )

        is_valid, message = validate_label(label)
        assert is_valid is False
        assert "too small" in message.lower() or "minimum size" in message.lower()

    def test_validate_label_accepts_valid_icon(self) -> None:
        """Verify validation passes for icon (should be square)."""
        from src.labeling.validator import validate_label

        # Icons should be square
        bbox = BoundingBox(x=100, y=100, width=200, height=200)
        label = Label(
            id="test-005",
            pdf_filename="test.pdf",
            page_number=1,
            content_type=LabelContentType.ICON,
            bounding_box=bbox,
            labeled_by="test",
            timestamp=datetime.now(),
        )

        is_valid, message = validate_label(label)
        assert is_valid is True

    def test_validate_label_checks_coordinates_are_positive(self) -> None:
        """Verify validation fails for negative coordinates."""
        from src.labeling.validator import validate_label

        # Negative coordinates are invalid (caught by BoundingBox __post_init__)
        with pytest.raises(ValueError):
            bbox = BoundingBox(x=-10, y=100, width=200, height=200)
            Label(
                id="test-006",
                pdf_filename="test.pdf",
                page_number=1,
                content_type=LabelContentType.MAZE,
                bounding_box=bbox,
                labeled_by="test",
                timestamp=datetime.now(),
            )
