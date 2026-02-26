"""Extraction module for automated PDF asset extraction."""

from .margin_trimmer import trim_white_margins, apply_margin_trim_to_label
from .validation import validate_margin_trim
from .pattern_matcher import extract_position_patterns, apply_pattern_to_pdf_page
from .image_saver import save_extracted_card

__all__ = [
    'trim_white_margins',
    'apply_margin_trim_to_label',
    'validate_margin_trim',
    'extract_position_patterns',
    'apply_pattern_to_pdf_page',
    'save_extracted_card',
]
