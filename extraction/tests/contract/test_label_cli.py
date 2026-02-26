"""
Contract test for label command CLI interface.

Verifies that label command adheres to CLI contract specification.
"""

import subprocess
import sys

import pytest


class TestLabelCLIContract:
    """Test label command CLI contract compliance."""

    @pytest.fixture
    def cli_module(self) -> str:
        """Get path to CLI module."""
        return "src.main"

    def test_label_command_exists(self, cli_module: str) -> None:
        """Verify label command is available."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0
        assert "label" in result.stdout.lower()
        assert "bounding box" in result.stdout.lower() or "pdf" in result.stdout.lower()

    def test_label_command_requires_pdf_path(self, cli_module: str) -> None:
        """Verify label command requires PDF_PATH argument."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "pdf_path" in result.stdout.lower() or "PDF_PATH" in result.stdout

    def test_label_command_has_page_option(self, cli_module: str) -> None:
        """Verify --page option exists and is required."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--page" in result.stdout

    def test_label_command_has_content_type_option(self, cli_module: str) -> None:
        """Verify --content-type option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--content-type" in result.stdout

    def test_label_command_has_labels_file_option(self, cli_module: str) -> None:
        """Verify --labels-file option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--labels-file" in result.stdout

    def test_label_command_has_zoom_option(self, cli_module: str) -> None:
        """Verify --zoom option exists."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "--zoom" in result.stdout

    def test_label_command_content_type_choices(self, cli_module: str) -> None:
        """Verify content-type has correct choices."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        # Should have maze, restriction, task, icon, background, penalty
        assert "maze" in result.stdout
        assert "restriction" in result.stdout or "task" in result.stdout

    def test_label_command_default_labels_file(self, cli_module: str) -> None:
        """Verify default --labels-file path."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "data/labels/labels.json" in result.stdout

    def test_label_command_default_zoom(self, cli_module: str) -> None:
        """Verify default --zoom value is 2.0."""
        result = subprocess.run(
            [sys.executable, "-m", cli_module, "label", "--help"],
            capture_output=True,
            text=True,
        )

        assert "2.0" in result.stdout
