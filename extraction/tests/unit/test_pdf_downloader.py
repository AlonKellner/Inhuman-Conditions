"""
Unit tests for PDF downloader module.
"""

from datetime import datetime
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

import pytest

from src.models.pdf_document import PDFDocument, ContentType


class TestPDFDownloader:
    """Test PDF download functionality."""

    @pytest.fixture
    def mock_response(self) -> Mock:
        """Create mock HTTP response."""
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

    def test_download_pdfs_creates_output_directory(
        self, tmp_path: Path, mock_response: Mock
    ) -> None:
        """Verify download_pdfs creates output directory if it doesn't exist."""
        from src.download.pdf_downloader import download_pdfs

        output_dir = tmp_path / "pdfs"
        assert not output_dir.exists()

        with patch("requests.get", return_value=mock_response):
            download_pdfs(
                base_url="https://test.example.com",
                output_dir=output_dir,
                pdf_list=[
                    {
                        "filename": "test.pdf",
                        "url": "https://test.example.com/test.pdf",
                    }
                ],
            )

            assert output_dir.exists()

    def test_download_pdfs_returns_pdf_documents(
        self, tmp_path: Path, mock_response: Mock
    ) -> None:
        """Verify download_pdfs returns list of PDFDocument objects."""
        from src.download.pdf_downloader import download_pdfs

        with patch("requests.get", return_value=mock_response):
            result = download_pdfs(
                base_url="https://test.example.com",
                output_dir=tmp_path,
                pdf_list=[
                    {
                        "filename": "test.pdf",
                        "url": "https://test.example.com/test.pdf",
                    }
                ],
            )

            assert isinstance(result, list)
            assert len(result) == 1
            assert isinstance(result[0], PDFDocument)

    def test_download_pdfs_skips_existing_files_when_resume_true(
        self, tmp_path: Path, mock_response: Mock
    ) -> None:
        """Verify resume=True skips already downloaded files."""
        from src.download.pdf_downloader import download_pdfs

        # Create existing valid PDF file
        existing_file = tmp_path / "test.pdf"
        # Use the same minimal PDF content from mock_response
        minimal_pdf = mock_response.content
        existing_file.write_bytes(minimal_pdf)

        # Mock HEAD request (used to check file size)
        mock_head = Mock()
        mock_head.headers = {"content-length": str(len(minimal_pdf))}

        with patch("requests.head", return_value=mock_head) as mock_head_call, \
             patch("requests.get", return_value=mock_response) as mock_get:
            download_pdfs(
                base_url="https://test.example.com",
                output_dir=tmp_path,
                pdf_list=[
                    {
                        "filename": "test.pdf",
                        "url": "https://test.example.com/test.pdf",
                    }
                ],
                resume=True,
            )
            # Should make HEAD request but not GET request
            mock_head_call.assert_called_once()
            mock_get.assert_not_called()

    def test_download_pdfs_handles_http_errors(
        self, tmp_path: Path
    ) -> None:
        """Verify download_pdfs handles HTTP errors gracefully."""
        from src.download.pdf_downloader import download_pdfs
        import requests

        mock_resp = Mock()
        mock_resp.status_code = 404
        mock_resp.raise_for_status = Mock(
            side_effect=requests.HTTPError("404 Not Found")
        )

        with patch("requests.get", return_value=mock_resp):
            with pytest.raises(requests.HTTPError, match="404"):
                download_pdfs(
                    base_url="https://test.example.com",
                    output_dir=tmp_path,
                    pdf_list=[
                        {
                            "filename": "missing.pdf",
                            "url": "https://test.example.com/missing.pdf",
                        }
                    ],
                )

    def test_calculate_md5_hash(self, tmp_path: Path) -> None:
        """Verify MD5 hash calculation."""
        from src.download.pdf_downloader import calculate_md5_hash
        import hashlib

        test_file = tmp_path / "test.pdf"
        test_content = b"test content"
        test_file.write_bytes(test_content)

        # Calculate expected hash
        expected_hash = hashlib.md5(test_content).hexdigest()

        hash_result = calculate_md5_hash(test_file)
        assert hash_result == expected_hash
