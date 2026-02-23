"""
Unit tests for catalog generation module.
"""

from datetime import datetime
from pathlib import Path

import pytest

from src.models.pdf_document import PDFDocument, ContentType


class TestCatalogGeneration:
    """Test catalog generation functionality."""

    @pytest.fixture
    def sample_pdf_documents(self, tmp_path: Path) -> list[PDFDocument]:
        """Create sample PDFDocument objects for testing."""
        pdf1 = tmp_path / "01_small_talk_suspect.pdf"
        pdf1.write_bytes(b"%PDF-1.4 test content")

        pdf2 = tmp_path / "02_imagination_suspect.pdf"
        pdf2.write_bytes(b"%PDF-1.4 test content 2")

        return [
            PDFDocument(
                filename="01_small_talk_suspect.pdf",
                file_path=str(pdf1),
                content_type=ContentType.MODULE_SUSPECT,
                page_count=20,
                file_size=pdf1.stat().st_size,
                download_timestamp=datetime.now(),
                source_url="https://test.example.com/01_small_talk_suspect.pdf",
                md5_hash="abc123",
            ),
            PDFDocument(
                filename="02_imagination_suspect.pdf",
                file_path=str(pdf2),
                content_type=ContentType.MODULE_SUSPECT,
                page_count=22,
                file_size=pdf2.stat().st_size,
                download_timestamp=datetime.now(),
                source_url="https://test.example.com/02_imagination_suspect.pdf",
                md5_hash="def456",
            ),
        ]

    def test_generate_catalog_creates_json_file(
        self, tmp_path: Path, sample_pdf_documents: list[PDFDocument]
    ) -> None:
        """Verify generate_catalog creates catalog.json file."""
        from src.download.catalog import generate_catalog

        catalog_path = tmp_path / "catalog.json"

        generate_catalog(
            pdf_documents=sample_pdf_documents,
            catalog_path=catalog_path,
        )

        assert catalog_path.exists()

    def test_generate_catalog_includes_all_pdfs(
        self, tmp_path: Path, sample_pdf_documents: list[PDFDocument]
    ) -> None:
        """Verify catalog includes all PDFDocument records."""
        from src.download.catalog import generate_catalog
        from src.utils.file_operations import read_json

        catalog_path = tmp_path / "catalog.json"

        generate_catalog(
            pdf_documents=sample_pdf_documents,
            catalog_path=catalog_path,
        )

        catalog_data = read_json(catalog_path)
        assert "pdfs" in catalog_data
        assert len(catalog_data["pdfs"]) == 2

    def test_generate_catalog_includes_metadata(
        self, tmp_path: Path, sample_pdf_documents: list[PDFDocument]
    ) -> None:
        """Verify catalog includes metadata section."""
        from src.download.catalog import generate_catalog
        from src.utils.file_operations import read_json

        catalog_path = tmp_path / "catalog.json"

        generate_catalog(
            pdf_documents=sample_pdf_documents,
            catalog_path=catalog_path,
        )

        catalog_data = read_json(catalog_path)
        assert "metadata" in catalog_data
        assert "total_pdfs" in catalog_data["metadata"]
        assert catalog_data["metadata"]["total_pdfs"] == 2

    def test_generate_catalog_validates_schema(
        self, tmp_path: Path, sample_pdf_documents: list[PDFDocument]
    ) -> None:
        """Verify catalog output matches expected JSON schema."""
        from src.download.catalog import generate_catalog
        from src.utils.file_operations import read_json

        catalog_path = tmp_path / "catalog.json"

        generate_catalog(
            pdf_documents=sample_pdf_documents,
            catalog_path=catalog_path,
        )

        catalog_data = read_json(catalog_path)

        # Validate top-level keys
        assert set(catalog_data.keys()) == {"pdfs", "metadata"}

        # Validate PDF entries
        for pdf_entry in catalog_data["pdfs"]:
            assert "filename" in pdf_entry
            assert "file_path" in pdf_entry
            assert "content_type" in pdf_entry
            assert "page_count" in pdf_entry
            assert "file_size" in pdf_entry
            assert "download_timestamp" in pdf_entry

        # Validate metadata
        metadata = catalog_data["metadata"]
        assert "total_pdfs" in metadata
        assert "generation_timestamp" in metadata
