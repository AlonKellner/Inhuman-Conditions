"""
PDF downloader module for fetching official game PDFs.
"""

import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import requests

from ..models.pdf_document import PDFDocument, ContentType
from ..utils.file_operations import ensure_directory
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def calculate_md5_hash(file_path: str | Path) -> str:
    """
    Calculate MD5 hash of file for integrity verification.

    Args:
        file_path: Path to file

    Returns:
        MD5 hash as hex string
    """
    md5 = hashlib.md5()
    path = Path(file_path)

    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            md5.update(chunk)

    return md5.hexdigest()


def should_download_file(
    file_path: Path,
    expected_size: Optional[int] = None,
    resume: bool = False,
) -> bool:
    """
    Determine if file should be downloaded based on resume logic.

    Args:
        file_path: Path to file
        expected_size: Expected file size in bytes (from Content-Length header)
        resume: Whether resume mode is enabled

    Returns:
        True if file should be downloaded, False if it should be skipped
    """
    # If resume is disabled, always download
    if not resume:
        return True

    # If file doesn't exist, download it
    if not file_path.exists():
        return True

    # If expected size is known and file size matches, skip
    if expected_size is not None:
        actual_size = file_path.stat().st_size
        if actual_size == expected_size:
            logger.info(f"Skipping {file_path.name} (already downloaded, {actual_size} bytes)")
            return False
        else:
            logger.warning(
                f"Re-downloading {file_path.name} "
                f"(size mismatch: expected {expected_size}, got {actual_size})"
            )
            return True

    # If we can't verify size, re-download to be safe
    return True


def infer_content_type(filename: str) -> ContentType:
    """
    Infer PDF content type from filename.

    Args:
        filename: PDF filename (e.g., "01_small_talk_suspect.pdf")

    Returns:
        ContentType enum value
    """
    filename_lower = filename.lower()

    if "suspect" in filename_lower:
        return ContentType.MODULE_SUSPECT
    elif "investigator" in filename_lower:
        return ContentType.MODULE_INVESTIGATOR
    elif "penalties" in filename_lower or "penalty" in filename_lower:
        return ContentType.PENALTIES
    elif "backgrounds" in filename_lower or "background" in filename_lower:
        return ContentType.BACKGROUNDS
    elif "print" in filename_lower and "play" in filename_lower:
        return ContentType.PRINT_PLAY
    elif "remote" in filename_lower and "play" in filename_lower:
        return ContentType.REMOTE_PLAY
    else:
        # Default to module suspect if unclear
        return ContentType.MODULE_SUSPECT


def download_pdfs(
    base_url: str,
    output_dir: str | Path,
    pdf_list: list[dict[str, str]],
    resume: bool = False,
    verify_md5: bool = False,
) -> list[PDFDocument]:
    """
    Download PDFs from URLs to output directory.

    Args:
        base_url: Base URL for downloads (e.g., "https://robots.management/")
        output_dir: Directory to save PDFs
        pdf_list: List of dicts with 'filename' and 'url' keys
        resume: Skip already downloaded files
        verify_md5: Calculate MD5 hashes for verification

    Returns:
        List of PDFDocument objects for successfully downloaded files

    Raises:
        requests.HTTPError: If download fails
        IOError: If file cannot be written
    """
    output_path = Path(output_dir)
    ensure_directory(output_path)

    pdf_documents: list[PDFDocument] = []

    for pdf_info in pdf_list:
        filename = pdf_info["filename"]
        url = pdf_info["url"]
        file_path = output_path / filename

        try:
            # Quick check: if file exists and resume is enabled, check size without downloading
            if resume and file_path.exists():
                # Make a HEAD request to get file size without downloading
                head_response = requests.head(url, timeout=10)
                expected_size = head_response.headers.get("content-length")
                expected_size = int(expected_size) if expected_size else None

                if not should_download_file(file_path, expected_size, resume):
                    # File already exists and is valid, create PDFDocument from it
                    logger.info(f"Skipping {filename} (already exists)")
                    doc = fitz.open(file_path)
                    page_count = doc.page_count
                    doc.close()

                    pdf_doc = PDFDocument(
                        filename=filename,
                        file_path=str(file_path.absolute()),
                        content_type=infer_content_type(filename),
                        page_count=page_count,
                        file_size=file_path.stat().st_size,
                        download_timestamp=datetime.fromtimestamp(
                            file_path.stat().st_mtime
                        ),
                        source_url=url,
                        md5_hash=calculate_md5_hash(file_path) if verify_md5 else None,
                    )
                    pdf_documents.append(pdf_doc)
                    continue

            # Download file
            logger.info(f"Downloading {filename}...")
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()

            with file_path.open("wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            file_size = file_path.stat().st_size
            logger.info(f"✓ Downloaded {filename} ({file_size:,} bytes)")

            # Extract page count using PyMuPDF
            doc = fitz.open(file_path)
            page_count = doc.page_count
            doc.close()

            # Calculate MD5 hash if requested
            md5_hash = calculate_md5_hash(file_path) if verify_md5 else None

            # Create PDFDocument record
            pdf_doc = PDFDocument(
                filename=filename,
                file_path=str(file_path.absolute()),
                content_type=infer_content_type(filename),
                page_count=page_count,
                file_size=file_size,
                download_timestamp=datetime.now(),
                source_url=url,
                md5_hash=md5_hash,
            )

            pdf_documents.append(pdf_doc)

        except requests.RequestException as e:
            logger.error(f"Failed to download {filename}: {e}")
            raise

        except Exception as e:
            logger.error(f"Error processing {filename}: {e}")
            raise

    logger.info(f"Successfully downloaded {len(pdf_documents)} PDFs")
    return pdf_documents
