"""
Integration test for complete labeling workflow.

Tests end-to-end labeling flow from PDF rendering to label persistence.
"""

from pathlib import Path
from unittest.mock import patch, Mock

import pytest


class TestLabelingSession:
    """Test complete labeling workflow."""

    @pytest.fixture
    def sample_pdf(self, tmp_path: Path) -> Path:
        """Create a minimal valid PDF for testing."""
        minimal_pdf = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
187
%%EOF"""
        pdf_path = tmp_path / "test.pdf"
        pdf_path.write_bytes(minimal_pdf)
        return pdf_path

    def test_full_labeling_session_creates_label(
        self, tmp_path: Path, sample_pdf: Path
    ) -> None:
        """Verify complete workflow: render → annotate → validate → save."""
        from src.labeling.interface import PDFAnnotator
        from src.labeling.validator import validate_label
        from src.labeling.storage import save_labels, load_labels

        labels_file = tmp_path / "labels.json"

        # Step 1: Create annotator
        annotator = PDFAnnotator(
            pdf_path=str(sample_pdf),
            page_number=1,
            content_type="maze",
        )

        # Step 2: Simulate bounding box selection
        annotator.on_select(100, 100, 400, 400)

        # Step 3: Get label from annotator
        label = annotator.create_label(label_id="test-001", labeled_by="integration_test")

        # Step 4: Validate label
        is_valid, message = validate_label(label)
        assert is_valid is True

        # Step 5: Save label
        save_labels([label], labels_file)

        # Step 6: Verify label was saved
        assert labels_file.exists()

        # Step 7: Load and verify
        loaded_labels = load_labels(labels_file)
        assert len(loaded_labels) == 1
        assert loaded_labels[0].id == "test-001"

    def test_labeling_session_handles_multiple_labels(
        self, tmp_path: Path, sample_pdf: Path
    ) -> None:
        """Verify multiple labels can be created in one session."""
        from src.labeling.interface import PDFAnnotator
        from src.labeling.storage import save_labels, load_labels

        labels_file = tmp_path / "labels.json"
        labels_to_create = []

        # Create multiple labels
        for i, content_type in enumerate(["maze", "restriction", "task"]):
            annotator = PDFAnnotator(
                pdf_path=str(sample_pdf),
                page_number=1,
                content_type=content_type,
            )

            # Different bounding boxes
            y_offset = i * 150
            annotator.on_select(100, 100 + y_offset, 400, 250 + y_offset)

            label = annotator.create_label(
                label_id=f"test-{i:03d}",
                labeled_by="integration_test",
            )
            labels_to_create.append(label)

        # Save all labels
        save_labels(labels_to_create, labels_file)

        # Verify all labels saved
        loaded_labels = load_labels(labels_file)
        assert len(loaded_labels) == 3
        assert loaded_labels[0].content_type.value == "maze"
        assert loaded_labels[1].content_type.value == "restriction"
        assert loaded_labels[2].content_type.value == "task"

    def test_labeling_session_rejects_invalid_labels(
        self, tmp_path: Path, sample_pdf: Path
    ) -> None:
        """Verify validation catches invalid labels."""
        from src.labeling.interface import PDFAnnotator
        from src.labeling.validator import validate_label

        # Create annotator with maze content type
        annotator = PDFAnnotator(
            pdf_path=str(sample_pdf),
            page_number=1,
            content_type="maze",
        )

        # Create non-square bounding box (invalid for maze)
        annotator.on_select(100, 100, 500, 200)  # Too wide

        label = annotator.create_label(label_id="test-invalid", labeled_by="integration_test")

        # Validation should fail
        is_valid, message = validate_label(label)
        assert is_valid is False
        assert message is not None

    def test_labeling_session_appends_to_existing_file(
        self, tmp_path: Path, sample_pdf: Path
    ) -> None:
        """Verify labels can be incrementally added across sessions."""
        from src.labeling.interface import PDFAnnotator
        from src.labeling.storage import save_labels, load_labels

        labels_file = tmp_path / "labels.json"

        # Session 1: Create first label
        annotator1 = PDFAnnotator(
            pdf_path=str(sample_pdf),
            page_number=1,
            content_type="maze",
        )
        annotator1.on_select(100, 100, 400, 400)
        label1 = annotator1.create_label(label_id="session1-001", labeled_by="user")
        save_labels([label1], labels_file)

        # Session 2: Load existing and add new label
        existing_labels = load_labels(labels_file)
        annotator2 = PDFAnnotator(
            pdf_path=str(sample_pdf),
            page_number=1,
            content_type="restriction",
        )
        annotator2.on_select(50, 500, 450, 650)
        label2 = annotator2.create_label(label_id="session2-001", labeled_by="user")

        # Append and save
        all_labels = existing_labels + [label2]
        save_labels(all_labels, labels_file)

        # Verify both labels exist
        final_labels = load_labels(labels_file)
        assert len(final_labels) == 2
        assert final_labels[0].id == "session1-001"
        assert final_labels[1].id == "session2-001"

    @patch("matplotlib.pyplot.show")
    def test_labeling_session_with_display(
        self, mock_show: Mock, tmp_path: Path, sample_pdf: Path
    ) -> None:
        """Verify labeling session can display matplotlib interface."""
        from src.labeling.interface import PDFAnnotator

        annotator = PDFAnnotator(
            pdf_path=str(sample_pdf),
            page_number=1,
            content_type="maze",
        )

        # Simulate selection
        annotator.on_select(100, 100, 400, 400)

        # Display interface (mocked to avoid blocking)
        annotator.display()

        # Verify show was called
        mock_show.assert_called_once()
