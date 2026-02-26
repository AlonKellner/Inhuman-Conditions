"""
Data models for PDF asset extraction pipeline.
"""

from .pdf_document import PDFDocument
from .label import Label, BoundingBox
from .extracted_asset import ExtractedAsset
from .catalyzer_card_mapping import CatalyzerCardMapping

__all__ = [
    "PDFDocument",
    "Label",
    "BoundingBox",
    "ExtractedAsset",
    "CatalyzerCardMapping",
]
