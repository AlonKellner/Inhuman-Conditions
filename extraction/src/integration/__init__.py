"""Integration module for TypeScript data generation."""

from .asset_mapper import map_extracted_assets_to_game_data
from .typescript_generator import generate_typescript_files

__all__ = ['map_extracted_assets_to_game_data', 'generate_typescript_files']
