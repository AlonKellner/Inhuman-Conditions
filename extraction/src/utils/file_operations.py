"""
File operation utilities for PDF asset extraction.
"""

import json
import shutil
from pathlib import Path
from typing import Any


def ensure_directory(path: str | Path) -> Path:
    """
    Ensure directory exists, creating it if necessary.

    Args:
        path: Directory path

    Returns:
        Path object for the directory
    """
    dir_path = Path(path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path


def copy_file(source: str | Path, destination: str | Path) -> None:
    """
    Copy file from source to destination.

    Args:
        source: Source file path
        destination: Destination file path

    Raises:
        FileNotFoundError: If source file doesn't exist
    """
    source_path = Path(source)
    dest_path = Path(destination)

    if not source_path.exists():
        raise FileNotFoundError(f"Source file not found: {source}")

    # Ensure destination directory exists
    ensure_directory(dest_path.parent)

    # Copy file
    shutil.copy2(source_path, dest_path)


def read_json(file_path: str | Path) -> Any:
    """
    Read and parse JSON file.

    Args:
        file_path: Path to JSON file

    Returns:
        Parsed JSON data

    Raises:
        FileNotFoundError: If file doesn't exist
        json.JSONDecodeError: If file contains invalid JSON
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {file_path}")

    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(data: Any, file_path: str | Path, indent: int = 2) -> None:
    """
    Write data to JSON file with pretty formatting.

    Args:
        data: Data to serialize to JSON
        file_path: Path to output file
        indent: Indentation spaces (default: 2)
    """
    path = Path(file_path)

    # Ensure directory exists
    ensure_directory(path.parent)

    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)
