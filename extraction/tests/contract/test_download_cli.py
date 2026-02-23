"""
Contract test for download command CLI interface.

Verifies that download command adheres to CLI contract specification.
"""

import subprocess
import sys
from pathlib import Path

import pytest


class TestDownloadCLIContract:
    """Test download command CLI contract compliance."""

    @pytest.fixture
    def cli_module(self) -> str:
        """Get path to CLI module."""
        return "src.main"

    def test_download_command_exists(self, cli_module: str) -> None:
        """Verify download command is available."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0
        assert "download" in result.stdout.lower()
        assert "pdf" in result.stdout.lower()

    def test_download_command_has_output_dir_option(self, cli_module: str) -> None:
        """Verify --output-dir option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--output-dir" in result.stdout

    def test_download_command_has_base_url_option(self, cli_module: str) -> None:
        """Verify --base-url option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--base-url" in result.stdout

    def test_download_command_has_resume_option(self, cli_module: str) -> None:
        """Verify --resume option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--resume" in result.stdout

    def test_download_command_has_verify_option(self, cli_module: str) -> None:
        """Verify --verify option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--verify" in result.stdout

    def test_download_command_has_catalog_path_option(self, cli_module: str) -> None:
        """Verify --catalog-path option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--catalog-path" in result.stdout

    def test_download_command_default_output_dir(self, cli_module: str) -> None:
        """Verify default --output-dir value is data/pdfs."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "data/pdfs" in result.stdout

    def test_download_command_default_catalog_path(self, cli_module: str) -> None:
        """Verify default --catalog-path value is data/pdfs/catalog.json."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "download", "--help"],
            capture_output=True,
            text=True,
        )

        assert "data/pdfs/catalog.json" in result.stdout
