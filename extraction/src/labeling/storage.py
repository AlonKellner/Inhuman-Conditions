"""
Label storage for saving/loading labels to/from JSON.
"""

from datetime import datetime
from pathlib import Path
from typing import List

from ..models.label import Label
from ..utils.file_operations import read_json, write_json
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def save_labels(labels: List[Label], labels_file: str | Path) -> None:
    """
    Save labels to JSON file.

    Args:
        labels: List of Label objects to save
        labels_file: Path to output JSON file

    Format matches schema from output-formats.md:
    {
      "labels": [
        {
          "id": "label-001",
          "pdf_filename": "test.pdf",
          "page_number": 1,
          "content_type": "maze",
          "bounding_box": {"x": 100, "y": 100, "width": 300, "height": 300},
          "labeled_by": "user",
          "timestamp": "2026-02-23T12:00:00",
          "notes": null
        }
      ],
      "metadata": {
        "total_labels": 1,
        "last_updated": "2026-02-23T12:00:00",
        "content_type_counts": {"maze": 1}
      }
    }
    """
    # Serialize labels to dicts
    labels_data = [label.to_dict() for label in labels]

    # Count by content type
    content_type_counts: dict[str, int] = {}
    for label in labels:
        content_type = label.content_type.value
        content_type_counts[content_type] = content_type_counts.get(content_type, 0) + 1

    # Build JSON structure
    data = {
        "labels": labels_data,
        "metadata": {
            "total_labels": len(labels),
            "last_updated": datetime.now().isoformat(),
            "content_type_counts": content_type_counts,
        },
    }

    # Write to file
    write_json(data, labels_file)

    logger.info(f"Saved {len(labels)} labels to {labels_file}")


def load_labels(labels_file: str | Path) -> List[Label]:
    """
    Load labels from JSON file.

    Args:
        labels_file: Path to JSON file

    Returns:
        List of Label objects (empty list if file doesn't exist)
    """
    path = Path(labels_file)

    # Return empty list if file doesn't exist
    if not path.exists():
        logger.info(f"No existing labels file found at {labels_file}")
        return []

    try:
        # Read JSON
        data = read_json(labels_file)

        # Deserialize labels
        labels = [Label.from_dict(label_dict) for label_dict in data["labels"]]

        logger.info(f"Loaded {len(labels)} labels from {labels_file}")
        return labels

    except Exception as e:
        logger.error(f"Failed to load labels from {labels_file}: {e}")
        raise
