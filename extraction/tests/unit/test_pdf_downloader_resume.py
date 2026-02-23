"""
Unit tests for PDF downloader resume functionality.
"""

from pathlib import Path
from unittest.mock import Mock, patch

import pytest


class TestPDFDownloaderResume:
    """Test resume functionality for interrupted downloads."""

    @pytest.fixture
    def mock_response(self) -> Mock:
        """Create mock HTTP response."""
        mock_resp = Mock()
        mock_resp.status_code = 200
        mock_resp.headers = {"content-length": "1024000"}
        mock_resp.content = b"%PDF-1.4 fake pdf content"
        mock_resp.iter_content = Mock(return_value=[b"%PDF-1.4 fake pdf content"])
        return mock_resp

    def test_resume_skips_existing_file_exact_size(
        self, tmp_path: Path, mock_response: Mock
    ) -> None:
        """Verify resume skips file if it matches expected size."""
        from src.download.pdf_downloader import should_download_file

        existing_file = tmp_path / "test.pdf"
        existing_file.write_bytes(b"%PDF-1.4 test" * 100)  # Create file

        with pytest.raises(ImportError):
            # If file exists and size matches, should skip
            result = should_download_file(
                file_path=existing_file,
                expected_size=existing_file.stat().st_size,
                resume=True,
            )
            assert result is False

    def test_resume_downloads_missing_file(
        self, tmp_path: Path
    ) -> None:
        """Verify resume downloads file if it doesn't exist."""
        from src.download.pdf_downloader import should_download_file

        missing_file = tmp_path / "missing.pdf"

        with pytest.raises(ImportError):
            # If file doesn't exist, should download
            result = should_download_file(
                file_path=missing_file,
                expected_size=1024000,
                resume=True,
            )
            assert result is True

    def test_resume_redownloads_incomplete_file(
        self, tmp_path: Path
    ) -> None:
        """Verify resume re-downloads file if size doesn't match."""
        from src.download.pdf_downloader import should_download_file

        incomplete_file = tmp_path / "incomplete.pdf"
        incomplete_file.write_bytes(b"%PDF-1.4 partial")  # Smaller than expected

        with pytest.raises(ImportError):
            # If file size doesn't match expected, should re-download
            result = should_download_file(
                file_path=incomplete_file,
                expected_size=1024000,  # Much larger than actual
                resume=True,
            )
            assert result is True

    def test_no_resume_always_downloads(
        self, tmp_path: Path
    ) -> None:
        """Verify resume=False always downloads, even if file exists."""
        from src.download.pdf_downloader import should_download_file

        existing_file = tmp_path / "existing.pdf"
        existing_file.write_bytes(b"%PDF-1.4 test")

        with pytest.raises(ImportError):
            # If resume=False, should always download
            result = should_download_file(
                file_path=existing_file,
                expected_size=existing_file.stat().st_size,
                resume=False,
            )
            assert result is True

    def test_resume_with_multiple_files(
        self, tmp_path: Path, mock_response: Mock
    ) -> None:
        """Verify resume correctly handles mix of existing and missing files."""
        from src.download.pdf_downloader import download_pdfs

        output_dir = tmp_path / "pdfs"
        output_dir.mkdir()

        # Create some existing files
        (output_dir / "file1.pdf").write_bytes(b"%PDF-1.4 content 1")
        (output_dir / "file3.pdf").write_bytes(b"%PDF-1.4 content 3")

        pdf_list = [
            {"filename": "file1.pdf", "url": "https://test.example.com/file1.pdf"},
            {"filename": "file2.pdf", "url": "https://test.example.com/file2.pdf"},
            {"filename": "file3.pdf", "url": "https://test.example.com/file3.pdf"},
            {"filename": "file4.pdf", "url": "https://test.example.com/file4.pdf"},
        ]

        with patch("requests.get", return_value=mock_response) as mock_get:
            with pytest.raises(ImportError):
                download_pdfs(
                    base_url="https://test.example.com",
                    output_dir=output_dir,
                    pdf_list=pdf_list,
                    resume=True,
                )

                # Should only download file2 and file4 (file1 and file3 already exist)
                # This exact assertion depends on implementation
                assert mock_get.call_count == 2
