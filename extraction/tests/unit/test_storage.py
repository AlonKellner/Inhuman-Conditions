"""
Unit tests for label storage (save/load labels).
"""

from pathlib import Path
from datetime import datetime

import pytest

from src.models.label import Label, BoundingBox, LabelContentType


class TestLabelStorage:
    """Test label persistence to JSON."""

    def test_save_labels_creates_json_file(self, tmp_path: Path) -> None:
        """Verify save_labels creates labels.json file."""
        from src.labeling.storage import save_labels

        labels_file = tmp_path / "labels.json"
        labels = [
            Label(
                id="label-001",
                pdf_filename="test.pdf",
                page_number=1,
                content_type=LabelContentType.MAZE,
                bounding_box=BoundingBox(x=100, y=100, width=300, height=300),
                labeled_by="test",
                timestamp=datetime.now(),
            )
        ]

        save_labels(labels, labels_file)

        assert labels_file.exists()

    def test_save_labels_writes_correct_schema(self, tmp_path: Path) -> None:
        """Verify save_labels writes JSON with correct schema."""
        from src.labeling.storage import save_labels
        from src.utils.file_operations import read_json

        labels_file = tmp_path / "labels.json"
        labels = [
            Label(
                id="label-001",
                pdf_filename="test.pdf",
                page_number=1,
                content_type=LabelContentType.MAZE,
                bounding_box=BoundingBox(x=100, y=100, width=300, height=300),
                labeled_by="test",
                timestamp=datetime.now(),
            ),
            Label(
                id="label-002",
                pdf_filename="test.pdf",
                page_number=1,
                content_type=LabelContentType.RESTRICTION,
                bounding_box=BoundingBox(x=50, y=500, width=400, height=150),
                labeled_by="test",
                timestamp=datetime.now(),
            ),
        ]

        save_labels(labels, labels_file)

        data = read_json(labels_file)
        assert "labels" in data
        assert "metadata" in data
        assert len(data["labels"]) == 2
        assert data["metadata"]["total_labels"] == 2

    def test_load_labels_reads_from_json(self, tmp_path: Path) -> None:
        """Verify load_labels reads labels from JSON file."""
        from src.labeling.storage import save_labels, load_labels

        labels_file = tmp_path / "labels.json"
        original_labels = [
            Label(
                id="label-001",
                pdf_filename="test.pdf",
                page_number=1,
                content_type=LabelContentType.MAZE,
                bounding_box=BoundingBox(x=100, y=100, width=300, height=300),
                labeled_by="test",
                timestamp=datetime.now(),
            )
        ]

        save_labels(original_labels, labels_file)
        loaded_labels = load_labels(labels_file)

        assert len(loaded_labels) == 1
        assert loaded_labels[0].id == "label-001"
        assert loaded_labels[0].content_type == LabelContentType.MAZE

    def test_load_labels_returns_empty_list_if_file_missing(self, tmp_path: Path) -> None:
        """Verify load_labels returns empty list if file doesn't exist."""
        from src.labeling.storage import load_labels

        labels_file = tmp_path / "nonexistent.json"

        loaded_labels = load_labels(labels_file)

        assert loaded_labels == []

    def test_save_labels_appends_to_existing_labels(self, tmp_path: Path) -> None:
        """Verify save_labels can append new labels to existing file."""
        from src.labeling.storage import save_labels, load_labels

        labels_file = tmp_path / "labels.json"

        # Save first label
        label1 = Label(
            id="label-001",
            pdf_filename="test.pdf",
            page_number=1,
            content_type=LabelContentType.MAZE,
            bounding_box=BoundingBox(x=100, y=100, width=300, height=300),
            labeled_by="test",
            timestamp=datetime.now(),
        )
        save_labels([label1], labels_file)

        # Load existing labels
        existing_labels = load_labels(labels_file)

        # Add new label
        label2 = Label(
            id="label-002",
            pdf_filename="test2.pdf",
            page_number=2,
            content_type=LabelContentType.RESTRICTION,
            bounding_box=BoundingBox(x=50, y=500, width=400, height=150),
            labeled_by="test",
            timestamp=datetime.now(),
        )

        # Save combined labels
        save_labels(existing_labels + [label2], labels_file)

        # Verify both labels exist
        all_labels = load_labels(labels_file)
        assert len(all_labels) == 2
        assert all_labels[0].id == "label-001"
        assert all_labels[1].id == "label-002"

    def test_save_labels_validates_json_schema(self, tmp_path: Path) -> None:
        """Verify saved JSON matches expected schema from output-formats.md."""
        from src.labeling.storage import save_labels
        from src.utils.file_operations import read_json

        labels_file = tmp_path / "labels.json"
        labels = [
            Label(
                id="label-001",
                pdf_filename="test.pdf",
                page_number=1,
                content_type=LabelContentType.MAZE,
                bounding_box=BoundingBox(x=100, y=100, width=300, height=300),
                labeled_by="test",
                timestamp=datetime.now(),
            )
        ]

        save_labels(labels, labels_file)

        data = read_json(labels_file)

        # Validate schema
        assert set(data.keys()) == {"labels", "metadata"}

        # Validate label entry
        label_entry = data["labels"][0]
        assert "id" in label_entry
        assert "pdf_filename" in label_entry
        assert "page_number" in label_entry
        assert "content_type" in label_entry
        assert "bounding_box" in label_entry
        assert "labeled_by" in label_entry
        assert "timestamp" in label_entry

        # Validate bounding box
        bbox = label_entry["bounding_box"]
        assert "x" in bbox
        assert "y" in bbox
        assert "width" in bbox
        assert "height" in bbox

        # Validate metadata
        metadata = data["metadata"]
        assert "total_labels" in metadata
        assert "generation_timestamp" in metadata or "last_updated" in metadata
