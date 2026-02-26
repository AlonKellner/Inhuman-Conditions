"""
ExtractedAsset entity representing automatically extracted content.
"""

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional

from .label import BoundingBox, LabelContentType


class ExtractionMethod(Enum):
    """How the asset was extracted."""

    PATTERN_MATCH = "pattern_match"
    TEMPLATE_MATCH = "template_match"
    OCR = "ocr"
    TEXT_LAYER = "text_layer"
    MANUAL = "manual"


@dataclass
class ExtractedAsset:
    """
    Represents a single extracted asset (image or text) from a PDF.

    Attributes:
        id: Unique asset identifier (e.g., "maze-smalltalk-001")
        pdf_filename: Source PDF filename
        page_number: Page number (1-indexed)
        content_type: Type of extracted content
        bounding_box: Region coordinates
        extraction_method: How asset was extracted
        confidence_score: Extraction confidence (0.0-1.0)
        asset_path: Path to extracted file (PNG, JSON, etc.)
        text_content: Extracted text (for text-based assets)
        template_label_id: ID of label used as template
    """

    id: str
    pdf_filename: str
    page_number: int
    content_type: LabelContentType
    bounding_box: BoundingBox
    extraction_method: ExtractionMethod
    confidence_score: float
    asset_path: Optional[str] = None
    text_content: Optional[str] = None
    template_label_id: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate ExtractedAsset after initialization."""
        if not self.id:
            raise ValueError("id cannot be empty")

        if not self.pdf_filename:
            raise ValueError("pdf_filename cannot be empty")

        if self.page_number < 1:
            raise ValueError(f"page_number must be >= 1: {self.page_number}")

        if not 0.0 <= self.confidence_score <= 1.0:
            raise ValueError(
                f"confidence_score must be between 0.0 and 1.0: {self.confidence_score}"
            )

        # Validate that either asset_path or text_content is provided
        if self.asset_path is None and self.text_content is None:
            raise ValueError("Either asset_path or text_content must be provided")

    @property
    def is_high_confidence(self) -> bool:
        """Check if extraction confidence is above 0.8 threshold."""
        return self.confidence_score >= 0.8

    @property
    def asset_exists(self) -> bool:
        """Check if asset file exists (for image assets)."""
        if self.asset_path is None:
            return False
        return Path(self.asset_path).exists()

    def to_dict(self) -> dict:
        """Serialize to dictionary for JSON output."""
        return {
            "id": self.id,
            "pdf_filename": self.pdf_filename,
            "page_number": self.page_number,
            "content_type": self.content_type.value,
            "bounding_box": self.bounding_box.to_dict(),
            "extraction_method": self.extraction_method.value,
            "confidence_score": self.confidence_score,
            "asset_path": self.asset_path,
            "text_content": self.text_content,
            "template_label_id": self.template_label_id,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ExtractedAsset":
        """Deserialize from dictionary (JSON input)."""
        return cls(
            id=data["id"],
            pdf_filename=data["pdf_filename"],
            page_number=data["page_number"],
            content_type=LabelContentType(data["content_type"]),
            bounding_box=BoundingBox.from_dict(data["bounding_box"]),
            extraction_method=ExtractionMethod(data["extraction_method"]),
            confidence_score=data["confidence_score"],
            asset_path=data.get("asset_path"),
            text_content=data.get("text_content"),
            template_label_id=data.get("template_label_id"),
        )
