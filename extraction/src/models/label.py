"""
Label entity representing manual bounding box annotations.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class LabelContentType(Enum):
    """Content type for labeled regions."""

    MAZE = "maze"
    RESTRICTION = "restriction"
    TASK = "task"
    ICON = "icon"
    BACKGROUND = "background"
    PENALTY = "penalty"


@dataclass
class BoundingBox:
    """
    Rectangular region coordinates in PDF page space.

    Attributes:
        x: Left edge (pixels from left)
        y: Top edge (pixels from top)
        width: Box width in pixels
        height: Box height in pixels
    """

    x: float
    y: float
    width: float
    height: float

    def __post_init__(self) -> None:
        """Validate BoundingBox coordinates."""
        if self.width <= 0:
            raise ValueError(f"width must be positive: {self.width}")

        if self.height <= 0:
            raise ValueError(f"height must be positive: {self.height}")

        if self.x < 0 or self.y < 0:
            raise ValueError(f"x and y must be non-negative: ({self.x}, {self.y})")

    @property
    def area(self) -> float:
        """Calculate bounding box area."""
        return self.width * self.height

    @property
    def right(self) -> float:
        """Right edge coordinate."""
        return self.x + self.width

    @property
    def bottom(self) -> float:
        """Bottom edge coordinate."""
        return self.y + self.height

    def to_dict(self) -> dict:
        """Serialize to dictionary."""
        return {
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "BoundingBox":
        """Deserialize from dictionary."""
        return cls(
            x=data["x"],
            y=data["y"],
            width=data["width"],
            height=data["height"],
        )


@dataclass
class Label:
    """
    Manual annotation linking a PDF region to a content type.

    Attributes:
        id: Unique label identifier (e.g., "label-001")
        pdf_filename: Source PDF filename
        page_number: Page number (1-indexed)
        content_type: What type of content is in this region
        bounding_box: Coordinates of labeled region
        labeled_by: Who/what created this label
        timestamp: When label was created
        notes: Optional description or context
    """

    id: str
    pdf_filename: str
    page_number: int
    content_type: LabelContentType
    bounding_box: BoundingBox
    labeled_by: str
    timestamp: datetime
    notes: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate Label after initialization."""
        if not self.id:
            raise ValueError("id cannot be empty")

        if not self.pdf_filename:
            raise ValueError("pdf_filename cannot be empty")

        if self.page_number < 1:
            raise ValueError(f"page_number must be >= 1: {self.page_number}")

    def to_dict(self) -> dict:
        """Serialize to dictionary for JSON output."""
        return {
            "id": self.id,
            "pdf_filename": self.pdf_filename,
            "page_number": self.page_number,
            "content_type": self.content_type.value,
            "bounding_box": self.bounding_box.to_dict(),
            "labeled_by": self.labeled_by,
            "timestamp": self.timestamp.isoformat(),
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Label":
        """Deserialize from dictionary (JSON input)."""
        return cls(
            id=data["id"],
            pdf_filename=data["pdf_filename"],
            page_number=data["page_number"],
            content_type=LabelContentType(data["content_type"]),
            bounding_box=BoundingBox.from_dict(data["bounding_box"]),
            labeled_by=data["labeled_by"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            notes=data.get("notes"),
        )
