"""
PDFDocument entity representing a downloaded PDF file.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional


class ContentType(Enum):
    """PDF content type classification."""

    MODULE_SUSPECT = "module_suspect"
    MODULE_INVESTIGATOR = "module_investigator"
    PENALTIES = "penalties"
    BACKGROUNDS = "backgrounds"
    PRINT_PLAY = "print_play"
    REMOTE_PLAY = "remote_play"


@dataclass
class PDFDocument:
    """
    Represents a downloaded PDF file with metadata.

    Attributes:
        filename: Unique identifier (e.g., "01_small_talk_suspect.pdf")
        file_path: Absolute path to PDF file
        content_type: Classification of PDF content
        page_count: Total number of pages
        file_size: Size in bytes
        download_timestamp: When PDF was downloaded
        source_url: Original download URL
        md5_hash: File integrity checksum
    """

    filename: str
    file_path: str
    content_type: ContentType
    page_count: int
    file_size: int
    download_timestamp: datetime
    source_url: Optional[str] = None
    md5_hash: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate PDFDocument after initialization."""
        if not self.filename:
            raise ValueError("filename cannot be empty")

        if not self.filename.endswith(".pdf"):
            raise ValueError(f"filename must end with .pdf: {self.filename}")

        if self.page_count < 1:
            raise ValueError(f"page_count must be >= 1: {self.page_count}")

        if self.file_size < 0:
            raise ValueError(f"file_size cannot be negative: {self.file_size}")

    @property
    def exists(self) -> bool:
        """Check if PDF file exists at file_path."""
        return Path(self.file_path).exists()

    def to_dict(self) -> dict:
        """Serialize to dictionary for JSON output."""
        return {
            "filename": self.filename,
            "file_path": self.file_path,
            "content_type": self.content_type.value,
            "page_count": self.page_count,
            "file_size": self.file_size,
            "download_timestamp": self.download_timestamp.isoformat(),
            "source_url": self.source_url,
            "md5_hash": self.md5_hash,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "PDFDocument":
        """Deserialize from dictionary (JSON input)."""
        return cls(
            filename=data["filename"],
            file_path=data["file_path"],
            content_type=ContentType(data["content_type"]),
            page_count=data["page_count"],
            file_size=data["file_size"],
            download_timestamp=datetime.fromisoformat(data["download_timestamp"]),
            source_url=data.get("source_url"),
            md5_hash=data.get("md5_hash"),
        )
