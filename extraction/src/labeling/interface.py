"""
Interactive PDF annotation interface using matplotlib.

Provides PDFAnnotator class for drawing bounding boxes on PDF pages.
"""

from datetime import datetime
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle
from matplotlib.widgets import RectangleSelector

from ..models.label import Label, BoundingBox, LabelContentType
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class PDFAnnotator:
    """
    Interactive PDF labeling interface using matplotlib.

    Allows users to draw bounding boxes on PDF pages to label content regions.
    """

    def __init__(
        self,
        pdf_path: str,
        page_number: int,
        content_type: str,
        zoom: float = 2.0,
    ):
        """
        Initialize PDFAnnotator.

        Args:
            pdf_path: Path to PDF file
            page_number: Page number to annotate (1-indexed)
            content_type: Type of content being labeled (maze, restriction, etc.)
            zoom: Zoom factor for rendering (default: 2.0)

        Raises:
            ValueError: If page_number is out of range
        """
        self.pdf_path = pdf_path
        self.page_number = page_number
        self.content_type = content_type
        self.zoom = zoom

        # Open PDF and validate page number
        self.doc = fitz.open(pdf_path)
        if page_number < 1 or page_number > self.doc.page_count:
            raise ValueError(
                f"page_number {page_number} out of range (1-{self.doc.page_count})"
            )

        logger.info(
            f"PDFAnnotator initialized: {Path(pdf_path).name} | "
            f"Page {page_number}/{self.doc.page_count} | "
            f"Type: {content_type} | Zoom: {zoom}x"
        )

        # Selection state
        self.bbox_coords: Optional[tuple[float, float, float, float]] = None
        self.fig: Optional[plt.Figure] = None
        self.ax: Optional[plt.Axes] = None
        self.selector: Optional[RectangleSelector] = None

        # Keyboard action state
        self.should_save = False
        self.should_quit = False

    def render_page(self) -> np.ndarray:
        """
        Render PDF page to numpy array (image).

        Returns:
            Page image as numpy array (RGB)
        """
        page = self.doc[self.page_number - 1]  # Convert to 0-indexed

        # Render at specified zoom level
        mat = fitz.Matrix(self.zoom, self.zoom)
        pix = page.get_pixmap(matrix=mat)

        # Convert to numpy array
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
            pix.height, pix.width, pix.n
        )

        # Convert RGBA to RGB if needed
        if pix.n == 4:
            img = img[:, :, :3]

        logger.debug(f"Page rendered: {img.shape[1]}x{img.shape[0]} pixels")
        return img

    def on_select(self, x1: float, y1: float, x2: float, y2: float) -> None:
        """
        Callback for RectangleSelector when user draws bounding box.

        Args:
            x1, y1: Top-left corner coordinates
            x2, y2: Bottom-right corner coordinates
        """
        # Normalize coordinates (ensure x1 < x2 and y1 < y2)
        x_min = min(x1, x2)
        x_max = max(x1, x2)
        y_min = min(y1, y2)
        y_max = max(y1, y2)

        self.bbox_coords = (x_min, y_min, x_max, y_max)

        logger.info(
            f"Bounding box selected: ({x_min:.0f}, {y_min:.0f}) to ({x_max:.0f}, {y_max:.0f})"
        )

    def on_key_press(self, event) -> None:
        """
        Callback for keyboard events.

        Args:
            event: Matplotlib key press event

        Keyboard shortcuts:
            's': Save current label and close window
            'n': Skip to next (close without saving)
            'q': Quit labeling session
        """
        if event.key == 's':
            logger.info("Save shortcut pressed (s)")
            self.should_save = True
            plt.close(self.fig)
        elif event.key == 'n':
            logger.info("Skip shortcut pressed (n)")
            self.should_save = False
            plt.close(self.fig)
        elif event.key == 'q':
            logger.info("Quit shortcut pressed (q)")
            self.should_quit = True
            self.should_save = False
            plt.close(self.fig)

    def get_bounding_box(self) -> BoundingBox:
        """
        Get the selected bounding box.

        Returns:
            BoundingBox object with coordinates and dimensions

        Raises:
            ValueError: If no bounding box has been selected
        """
        if self.bbox_coords is None:
            raise ValueError("No bounding box selected")

        x1, y1, x2, y2 = self.bbox_coords
        return BoundingBox(
            x=x1,
            y=y1,
            width=x2 - x1,
            height=y2 - y1,
        )

    def create_label(self, label_id: str, labeled_by: str, notes: Optional[str] = None) -> Label:
        """
        Create a Label object from the selected bounding box.

        Args:
            label_id: Unique identifier for this label
            labeled_by: Who created this label
            notes: Optional notes about this label

        Returns:
            Label object

        Raises:
            ValueError: If no bounding box has been selected
        """
        bbox = self.get_bounding_box()

        label = Label(
            id=label_id,
            pdf_filename=Path(self.pdf_path).name,
            page_number=self.page_number,
            content_type=LabelContentType(self.content_type),
            bounding_box=bbox,
            labeled_by=labeled_by,
            timestamp=datetime.now(),
            notes=notes,
        )

        logger.info(
            f"Label created: {label_id} | {self.content_type} | "
            f"Box: {bbox.width:.0f}x{bbox.height:.0f}"
        )

        return label

    def display(self) -> None:
        """
        Display interactive matplotlib interface for labeling.

        Shows PDF page with rectangle selector for drawing bounding boxes.
        """
        # Render page
        img = self.render_page()

        # Create figure
        self.fig, self.ax = plt.subplots(figsize=(12, 16))
        self.ax.imshow(img)
        self.ax.set_title(
            f"PDF: {Path(self.pdf_path).name} | Page: {self.page_number} | "
            f"Content Type: {self.content_type}\n"
            f"Draw bounding box around the content.\n"
            f"Keyboard: [s]=save & close | [n]=skip to next | [q]=quit"
        )
        self.ax.axis("off")

        # Create rectangle selector
        self.selector = RectangleSelector(
            self.ax,
            lambda eclick, erelease: self.on_select(
                eclick.xdata, eclick.ydata, erelease.xdata, erelease.ydata
            ),
            useblit=True,
            button=[1],  # Left mouse button
            minspanx=5,
            minspany=5,
            spancoords="pixels",
            interactive=True,
        )

        # Connect keyboard event handler
        self.fig.canvas.mpl_connect('key_press_event', self.on_key_press)

        # Show figure
        logger.info("Displaying interactive matplotlib interface (draw box, then press 's' to save)")
        plt.tight_layout()
        plt.show()
        logger.debug("matplotlib window closed")

    def close(self) -> None:
        """Close the PDF document."""
        if self.doc:
            self.doc.close()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - ensure PDF is closed."""
        self.close()
