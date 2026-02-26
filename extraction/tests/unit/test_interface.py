"""
Unit tests for interactive labeling interface.
"""

from pathlib import Path
from unittest.mock import Mock, MagicMock, patch

import pytest


class TestPDFAnnotator:
    """Test interactive PDF labeling interface."""

    def test_pdf_annotator_initializes_with_pdf_path(self, tmp_path: Path) -> None:
        """Verify PDFAnnotator can be initialized with valid PDF."""
        from src.labeling.interface import PDFAnnotator

        # Create a minimal valid PDF
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

        annotator = PDFAnnotator(
            pdf_path=str(pdf_path),
            page_number=1,
            content_type="maze",
            zoom=2.0,
        )

        assert annotator.pdf_path == str(pdf_path)
        assert annotator.page_number == 1
        assert annotator.content_type == "maze"
        assert annotator.zoom == 2.0

    def test_pdf_annotator_renders_page_as_image(self, tmp_path: Path) -> None:
        """Verify PDFAnnotator renders PDF page to image."""
        from src.labeling.interface import PDFAnnotator

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

        annotator = PDFAnnotator(pdf_path=str(pdf_path), page_number=1, content_type="maze")
        page_image = annotator.render_page()

        assert page_image is not None
        assert hasattr(page_image, "shape")  # Should be numpy array

    def test_pdf_annotator_captures_bounding_box(self, tmp_path: Path) -> None:
        """Verify PDFAnnotator captures bounding box selection."""
        from src.labeling.interface import PDFAnnotator
        from src.models.label import BoundingBox

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

        annotator = PDFAnnotator(pdf_path=str(pdf_path), page_number=1, content_type="maze")

        # Simulate rectangle selection
        annotator.on_select(100, 200, 400, 500)  # x1, y1, x2, y2

        bbox = annotator.get_bounding_box()
        assert isinstance(bbox, BoundingBox)
        assert bbox.x == 100
        assert bbox.y == 200
        assert bbox.width == 300  # 400 - 100
        assert bbox.height == 300  # 500 - 200

    def test_pdf_annotator_handles_page_out_of_range(self, tmp_path: Path) -> None:
        """Verify PDFAnnotator raises error for invalid page number."""
        from src.labeling.interface import PDFAnnotator

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

        with pytest.raises(ValueError, match="page"):
            PDFAnnotator(pdf_path=str(pdf_path), page_number=999, content_type="maze")

    @patch("matplotlib.pyplot.show")
    def test_pdf_annotator_displays_interface(self, mock_show: Mock, tmp_path: Path) -> None:
        """Verify PDFAnnotator displays matplotlib interface."""
        from src.labeling.interface import PDFAnnotator

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

        annotator = PDFAnnotator(pdf_path=str(pdf_path), page_number=1, content_type="maze")

        # Mock the selection to avoid interactive blocking
        annotator.on_select(100, 200, 400, 500)

        # Show should be called when display() is called
        annotator.display()
        mock_show.assert_called_once()
