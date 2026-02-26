"""
PDF labeling functionality for interactive bounding box annotation.
"""

from .interface import PDFAnnotator
from .validator import validate_label
from .storage import save_labels, load_labels

__all__ = [
    "PDFAnnotator",
    "validate_label",
    "save_labels",
    "load_labels",
]
