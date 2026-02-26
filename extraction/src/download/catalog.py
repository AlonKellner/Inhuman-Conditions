"""
PDF catalog generation module.
"""

from datetime import datetime
from pathlib import Path

from ..models.pdf_document import PDFDocument
from ..utils.file_operations import write_json
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def generate_catalog(
    pdf_documents: list[PDFDocument],
    catalog_path: str | Path,
) -> None:
    """
    Generate catalog.json from downloaded PDFs.

    Args:
        pdf_documents: List of PDFDocument objects
        catalog_path: Path to output catalog.json file

    The catalog format matches the schema from output-formats.md:
    {
      "pdfs": [
        {
          "filename": "01_small_talk_suspect.pdf",
          "file_path": "/absolute/path/to/file.pdf",
          "content_type": "module_suspect",
          "page_count": 20,
          "file_size": 1234567,
          "download_timestamp": "2026-02-23T12:00:00",
          "source_url": "https://robots.management/...",
          "md5_hash": "abc123..."
        },
        ...
      ],
      "metadata": {
        "total_pdfs": 13,
        "total_size_bytes": 87654321,
        "generation_timestamp": "2026-02-23T12:00:00",
        "content_type_counts": {
          "module_suspect": 11,
          "penalties": 1,
          "backgrounds": 1
        }
      }
    }
    """
    logger.info(f"Generating catalog with {len(pdf_documents)} PDFs...")

    # Serialize PDFDocument objects to dicts
    pdfs_data = [doc.to_dict() for doc in pdf_documents]

    # Calculate metadata
    total_size = sum(doc.file_size for doc in pdf_documents)

    # Count by content type
    content_type_counts: dict[str, int] = {}
    for doc in pdf_documents:
        content_type = doc.content_type.value
        content_type_counts[content_type] = content_type_counts.get(content_type, 0) + 1

    # Build catalog data
    catalog_data = {
        "pdfs": pdfs_data,
        "metadata": {
            "total_pdfs": len(pdf_documents),
            "total_size_bytes": total_size,
            "generation_timestamp": datetime.now().isoformat(),
            "content_type_counts": content_type_counts,
        },
    }

    # Write to file
    write_json(catalog_data, catalog_path)

    logger.info(f"✓ Catalog saved to {catalog_path}")
    logger.info(
        f"  Total: {len(pdf_documents)} PDFs ({total_size / (1024 * 1024):.1f} MB)"
    )
