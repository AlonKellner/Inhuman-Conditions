"""
Integration test for full download pipeline.

Tests end-to-end download flow from URL to catalog generation.
"""

from pathlib import Path
from unittest.mock import Mock, patch

import pytest


class TestDownloadPipeline:
    """Test complete download workflow."""

    @pytest.fixture
    def mock_http_response(self) -> Mock:
        """Create mock HTTP response with valid PDF content."""
        # Minimal valid PDF structure for PyMuPDF
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

        mock_resp = Mock()
        mock_resp.status_code = 200
        mock_resp.headers = {"content-length": str(len(minimal_pdf))}
        mock_resp.content = minimal_pdf
        mock_resp.iter_content = Mock(return_value=[minimal_pdf])
        return mock_resp

    def test_full_download_pipeline_creates_catalog(
        self, tmp_path: Path, mock_http_response: Mock
    ) -> None:
        """Verify complete pipeline: download → catalog generation."""
        from src.download.pdf_downloader import download_pdfs
        from src.download.catalog import generate_catalog
        from src.utils.file_operations import read_json

        output_dir = tmp_path / "pdfs"
        catalog_path = tmp_path / "catalog.json"

        pdf_list = [
            {
                "filename": "01_small_talk_suspect.pdf",
                "url": "https://test.example.com/01_small_talk_suspect.pdf",
            },
            {
                "filename": "02_imagination_suspect.pdf",
                "url": "https://test.example.com/02_imagination_suspect.pdf",
            },
        ]

        with patch("requests.get", return_value=mock_http_response):
            # Step 1: Download PDFs
            pdf_documents = download_pdfs(
                base_url="https://test.example.com",
                output_dir=output_dir,
                pdf_list=pdf_list,
            )

            # Verify PDFs downloaded
            assert len(pdf_documents) == 2
            assert (output_dir / "01_small_talk_suspect.pdf").exists()
            assert (output_dir / "02_imagination_suspect.pdf").exists()

            # Step 2: Generate catalog
            generate_catalog(
                pdf_documents=pdf_documents,
                catalog_path=catalog_path,
            )

            # Verify catalog created
            assert catalog_path.exists()
            catalog_data = read_json(catalog_path)
            assert catalog_data["metadata"]["total_pdfs"] == 2

    def test_pipeline_handles_partial_download_failure(
        self, tmp_path: Path, mock_http_response: Mock
    ) -> None:
        """Verify pipeline handles scenarios where some downloads fail."""
        from src.download.pdf_downloader import download_pdfs
        import requests

        # Mock responses: first succeeds, second fails
        mock_failure = Mock()
        mock_failure.status_code = 404
        mock_failure.raise_for_status = Mock(side_effect=requests.HTTPError("404 Not Found"))

        pdf_list = [
            {
                "filename": "success.pdf",
                "url": "https://test.example.com/success.pdf",
            },
            {
                "filename": "failure.pdf",
                "url": "https://test.example.com/failure.pdf",
            },
        ]

        with patch("requests.get", side_effect=[mock_http_response, mock_failure]):
            with pytest.raises(requests.HTTPError):
                download_pdfs(
                    base_url="https://test.example.com",
                    output_dir=tmp_path,
                    pdf_list=pdf_list,
                )

    def test_pipeline_resume_skips_existing_files(
        self, tmp_path: Path, mock_http_response: Mock
    ) -> None:
        """Verify resume functionality in full pipeline."""
        from src.download.pdf_downloader import download_pdfs

        output_dir = tmp_path / "pdfs"
        output_dir.mkdir()

        # Create existing PDF with valid content
        existing_pdf = output_dir / "01_small_talk_suspect.pdf"
        existing_pdf.write_bytes(mock_http_response.content)

        pdf_list = [
            {
                "filename": "01_small_talk_suspect.pdf",
                "url": "https://test.example.com/01_small_talk_suspect.pdf",
            },
            {
                "filename": "02_imagination_suspect.pdf",
                "url": "https://test.example.com/02_imagination_suspect.pdf",
            },
        ]

        # Mock HEAD request for resume check
        mock_head = Mock()
        mock_head.headers = {"content-length": str(len(mock_http_response.content))}

        with patch("requests.head", return_value=mock_head) as mock_head_call, \
             patch("requests.get", return_value=mock_http_response) as mock_get:
            pdf_documents = download_pdfs(
                base_url="https://test.example.com",
                output_dir=output_dir,
                pdf_list=pdf_list,
                resume=True,
            )

            # Should only download the second PDF (first already exists)
            # HEAD is called for first PDF, GET is called for second
            assert mock_head_call.call_count == 1
            assert mock_get.call_count == 1

            # Both PDFs should exist
            assert existing_pdf.exists()
            assert (output_dir / "02_imagination_suspect.pdf").exists()
            assert len(pdf_documents) == 2
