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
        zoom: float = 2.0,
    ):
        """
        Initialize PDFAnnotator.

        Args:
            pdf_path: Path to PDF file
            page_number: Page number to annotate (1-indexed)
            zoom: Zoom factor for rendering (default: 2.0)

        Raises:
            ValueError: If page_number is out of range
        """
        self.pdf_path = pdf_path
        self.page_number = page_number
        self.zoom = zoom

        # Open PDF and validate page number
        self.doc = fitz.open(pdf_path)
        if page_number < 1 or page_number > self.doc.page_count:
            raise ValueError(
                f"page_number {page_number} out of range (1-{self.doc.page_count})"
            )

        logger.info(
            f"PDFAnnotator initialized: {Path(pdf_path).name} | "
            f"Page {page_number}/{self.doc.page_count} | Zoom: {zoom}x"
        )

        # Multiple bounding boxes (coords only, content types added later)
        self.unlabeled_boxes: list[tuple[float, float, float, float]] = []
        self.labeled_boxes: list[tuple[tuple[float, float, float, float], str]] = []
        self.current_bbox: Optional[tuple[float, float, float, float]] = None

        # UI state
        self.fig: Optional[plt.Figure] = None
        self.ax: Optional[plt.Axes] = None
        self.selector: Optional[RectangleSelector] = None
        self.drawn_rectangles: list[Rectangle] = []
        self.drawn_labels: list = []
        self.img: Optional[np.ndarray] = None

        # View state for zoom/pan
        self.view_zoom = 1.0  # Current view zoom level
        self.xlim = None
        self.ylim = None

        # Keyboard action state
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

        # Store the box (content type will be assigned later)
        bbox = (x_min, y_min, x_max, y_max)
        self.unlabeled_boxes.append(bbox)

        logger.info(
            f"Box #{len(self.unlabeled_boxes)} drawn: ({x_min:.0f}, {y_min:.0f}) to ({x_max:.0f}, {y_max:.0f})"
        )

        # Draw the box with number
        self._draw_unlabeled_box(len(self.unlabeled_boxes) - 1)
        print(f"✓ Box #{len(self.unlabeled_boxes)} drawn")

    def _draw_unlabeled_box(self, box_index: int) -> None:
        """
        Draw an unlabeled bounding box with number on the figure.

        Args:
            box_index: Index in self.unlabeled_boxes list
        """
        if not self.ax:
            return

        x_min, y_min, x_max, y_max = self.unlabeled_boxes[box_index]

        # Draw rectangle in white
        rect = Rectangle(
            (x_min, y_min),
            x_max - x_min,
            y_max - y_min,
            linewidth=2,
            edgecolor='white',
            facecolor='none',
            linestyle='-'
        )
        self.ax.add_patch(rect)
        self.drawn_rectangles.append(rect)

        # Draw box number
        label_text = f"#{box_index + 1}"
        text = self.ax.text(
            x_min,
            y_min - 10,
            label_text,
            fontsize=14,
            color='white',
            weight='bold',
            bbox=dict(boxstyle='round', facecolor='black', alpha=0.8, edgecolor='white')
        )
        self.drawn_labels.append(text)

        # Update title and redraw
        self._update_view_title()

    def _draw_labeled_box(self, box_index: int) -> None:
        """
        Draw a labeled bounding box on the figure.

        Args:
            box_index: Index in self.labeled_boxes list
        """
        if not self.ax:
            return

        bbox_coords, content_type = self.labeled_boxes[box_index]
        x_min, y_min, x_max, y_max = bbox_coords

        # Color map for different content types
        color_map = {
            "maze": "red",
            "restriction": "blue",
            "task": "green",
            "icon": "purple",
            "background": "orange",
            "penalty": "cyan",
        }
        color = color_map.get(content_type, "yellow")

        # Draw rectangle
        rect = Rectangle(
            (x_min, y_min),
            x_max - x_min,
            y_max - y_min,
            linewidth=2,
            edgecolor=color,
            facecolor='none',
            linestyle='--'
        )
        self.ax.add_patch(rect)
        self.drawn_rectangles.append(rect)

        # Draw label number and type
        label_text = f"#{box_index + 1}: {content_type}"
        text = self.ax.text(
            x_min,
            y_min - 10,
            label_text,
            fontsize=12,
            color=color,
            weight='bold',
            bbox=dict(boxstyle='round', facecolor='white', alpha=0.8, edgecolor=color)
        )
        self.drawn_labels.append(text)

        # Update title and redraw
        self._update_view_title()

    def _update_view_title(self) -> None:
        """Update the figure title with current zoom level and box count."""
        if not self.ax:
            return

        self.ax.set_title(
            f"PDF: {Path(self.pdf_path).name} | Page: {self.page_number} | "
            f"Zoom: {self.view_zoom:.1f}x | Boxes: {len(self.unlabeled_boxes)}\n"
            f"Draw ALL bounding boxes first, then label them after closing\n"
            f"Scroll to zoom | [0]=fit page | [d]=delete last | [q]=done drawing | [c]=cancel"
        )
        self.fig.canvas.draw()

    def on_scroll(self, event) -> None:
        """
        Callback for mouse scroll events (zoom in/out).

        Args:
            event: Matplotlib scroll event
        """
        if not self.ax or event.inaxes != self.ax:
            return

        # Get cursor position
        x_cursor = event.xdata
        y_cursor = event.ydata
        if x_cursor is None or y_cursor is None:
            return

        # Get current axis limits
        xlim = self.ax.get_xlim()
        ylim = self.ax.get_ylim()

        # Zoom factor per scroll step
        zoom_factor = 1.2 if event.button == 'up' else 0.8

        # Calculate new ranges (zoom towards cursor)
        x_range = (xlim[1] - xlim[0]) / zoom_factor
        y_range = (ylim[1] - ylim[0]) / zoom_factor

        # Calculate cursor position ratio in current view
        x_ratio = (x_cursor - xlim[0]) / (xlim[1] - xlim[0])
        y_ratio = (y_cursor - ylim[0]) / (ylim[1] - ylim[0])

        # New limits centered on cursor position
        new_xlim = [
            x_cursor - x_range * x_ratio,
            x_cursor + x_range * (1 - x_ratio)
        ]
        new_ylim = [
            y_cursor - y_range * y_ratio,
            y_cursor + y_range * (1 - y_ratio)
        ]

        self.ax.set_xlim(new_xlim)
        self.ax.set_ylim(new_ylim)

        self.view_zoom *= zoom_factor
        self._update_view_title()
        logger.debug(f"Scrolled to {self.view_zoom:.1f}x zoom")

    def _zoom_fit(self) -> None:
        """Reset zoom to fit entire page."""
        if not self.ax or self.img is None:
            return

        height, width = self.img.shape[:2]
        self.ax.set_xlim([0, width])
        self.ax.set_ylim([height, 0])  # Y is inverted in images

        self.view_zoom = 1.0
        self._update_view_title()
        logger.info("Reset zoom to fit page")

    def on_key_press(self, event) -> None:
        """
        Callback for keyboard events.

        Args:
            event: Matplotlib key press event

        Keyboard shortcuts:
            '0': Fit page to window
            'd': Delete last labeled box
            'q': Quit and save all labeled boxes
            'c': Cancel and discard all boxes
        """
        if event.key == '0':
            self._zoom_fit()
        elif event.key == 'd':
            if self.unlabeled_boxes:
                self.unlabeled_boxes.pop()
                logger.info(f"Deleted box #{len(self.unlabeled_boxes) + 1}")
                # Remove visual elements
                if self.drawn_rectangles:
                    self.drawn_rectangles[-1].remove()
                    self.drawn_rectangles.pop()
                if self.drawn_labels:
                    self.drawn_labels[-1].remove()
                    self.drawn_labels.pop()
                self._update_view_title()
                print(f"🗑️  Deleted box #{len(self.unlabeled_boxes) + 1}")
        elif event.key == 'q':
            logger.info(f"Done drawing - {len(self.unlabeled_boxes)} boxes to label")
            plt.close(self.fig)
        elif event.key == 'c':
            logger.info("Cancel shortcut pressed (c) - discarding all boxes")
            self.should_quit = True
            plt.close(self.fig)

    def assign_content_types(self) -> None:
        """
        Prompt user to assign card types to all unlabeled boxes.

        This is called AFTER matplotlib window closes to avoid readline conflicts.
        """
        if not self.unlabeled_boxes:
            return

        # Detect PDF type from filename
        filename_lower = self.pdf_path.lower()
        is_investigator = 'investigator' in filename_lower and 'form' not in filename_lower
        is_investigator_forms = 'investigator' in filename_lower and 'form' in filename_lower
        is_backgrounds = 'background' in filename_lower
        is_penalties = 'penalt' in filename_lower  # matches "penalty" or "penalties"

        if is_backgrounds:
            card_types_list = ["background"]
            print(f"\n📋 Now assign content type to your {len(self.unlabeled_boxes)} boxes:")
            print("Background PDF:")
            print("  1 = background (character background card)")
        elif is_penalties:
            card_types_list = ["penalty"]
            print(f"\n📋 Now assign content type to your {len(self.unlabeled_boxes)} boxes:")
            print("Penalties PDF:")
            print("  1 = penalty (penalty card)")
        elif is_investigator_forms:
            card_types_list = ["investigator-form"]
            print(f"\n📋 Now assign content type to your {len(self.unlabeled_boxes)} boxes:")
            print("Investigator Forms PDF:")
            print("  1 = investigator-form (interview forms and templates)")
        elif is_investigator:
            card_types_list = ["cover-sheet", "primary-prompts", "secondary-prompts"]
            print(f"\n📋 Now assign card types to your {len(self.unlabeled_boxes)} boxes:")
            print("Investigator PDF card types:")
            print("  1 = cover-sheet (page 1)")
            print("  2 = primary-prompts (page 2)")
            print("  3 = secondary-prompts (page 3)")
        else:
            card_types_list = ["human-card", "patient-card", "violent-card"]
            print(f"\n📋 Now assign card types to your {len(self.unlabeled_boxes)} boxes:")
            print("Suspect PDF card types:")
            print("  1 = human-card (contains: maze only)")
            print("  2 = patient-card (contains: maze + restriction text)")
            print("  3 = violent-card (contains: maze + task text)")
        print()

        for i, bbox in enumerate(self.unlabeled_boxes):
            x1, y1, x2, y2 = bbox
            width = x2 - x1
            height = y2 - y1
            aspect_ratio = height / width
            print(f"Box #{i + 1} ({width:.0f}w x {height:.0f}h pixels, ratio {aspect_ratio:.2f}:1)")

            # Dynamic prompt based on number of options
            max_choice = len(card_types_list)
            prompt_text = f"  Content type (1-{max_choice}): " if max_choice > 1 else "  Content type (1): "
            error_text = f"  ❌ Invalid. Enter 1-{max_choice}." if max_choice > 1 else "  ❌ Invalid. Enter 1."

            while True:
                try:
                    choice = input(prompt_text).strip()
                    idx = int(choice) - 1
                    if 0 <= idx < len(card_types_list):
                        card_type = card_types_list[idx]
                        self.labeled_boxes.append((bbox, card_type))
                        logger.info(f"Box #{i + 1} labeled as: {card_type}")
                        print(f"  ✓ Labeled as: {card_type}\n")
                        break
                    else:
                        print(error_text)
                except (ValueError, KeyboardInterrupt):
                    print(error_text)

        print(f"✅ All {len(self.labeled_boxes)} cards labeled!")

    def create_labels(self, label_id_prefix: str, labeled_by: str, notes: Optional[str] = None) -> list[Label]:
        """
        Create Label objects from all labeled bounding boxes.

        Args:
            label_id_prefix: Prefix for label IDs (e.g., "label-001")
            labeled_by: Who created these labels
            notes: Optional notes about these labels

        Returns:
            List of Label objects (one per labeled box)
        """
        labels = []

        for i, (bbox_coords, content_type) in enumerate(self.labeled_boxes):
            x1, y1, x2, y2 = bbox_coords
            bbox = BoundingBox(
                x=x1,
                y=y1,
                width=x2 - x1,
                height=y2 - y1,
            )

            # Generate unique label ID (e.g., "label-001-a", "label-001-b")
            if len(self.labeled_boxes) == 1:
                label_id = label_id_prefix
            else:
                label_id = f"{label_id_prefix}-{chr(97 + i)}"  # 97 = 'a'

            label = Label(
                id=label_id,
                pdf_filename=Path(self.pdf_path).name,
                page_number=self.page_number,
                content_type=LabelContentType(content_type),
                bounding_box=bbox,
                labeled_by=labeled_by,
                timestamp=datetime.now(),
                notes=notes,
            )

            logger.info(
                f"Label created: {label_id} | {content_type} | "
                f"Box: {bbox.width:.0f}x{bbox.height:.0f}"
            )

            labels.append(label)

        return labels

    def display(self) -> None:
        """
        Display interactive matplotlib interface for labeling.

        Shows PDF page with rectangle selector for drawing bounding boxes.
        """
        # Render page
        self.img = self.render_page()

        # Create figure
        self.fig, self.ax = plt.subplots(figsize=(14, 18))
        self.ax.imshow(self.img)
        self.ax.axis("off")

        # Set initial view to fit entire page
        height, width = self.img.shape[:2]
        self.ax.set_xlim([0, width])
        self.ax.set_ylim([height, 0])  # Y is inverted in images

        # Update title with instructions
        self._update_view_title()

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

        # Connect event handlers
        self.fig.canvas.mpl_connect('key_press_event', self.on_key_press)
        self.fig.canvas.mpl_connect('scroll_event', self.on_scroll)

        # Show figure
        logger.info("Displaying interactive matplotlib interface")
        print("🔍 Scroll to zoom | Draw boxes with mouse | Press 'q' when done")
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
