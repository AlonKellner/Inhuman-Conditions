"""
CLI entry point for PDF asset extraction tool.

Commands:
    download - Download all official PDFs from robots.management
    label    - Interactive bounding box labeling for content types
    extract  - Automated extraction based on labeled patterns
    validate - Generate HTML validation report
    integrate - Update TypeScript data files with extracted content
"""

import argparse
import sys
from pathlib import Path

from . import __version__
from .utils.logging_config import setup_logging, get_logger


def main() -> int:
    """
    Main CLI entry point.

    Returns:
        Exit code (0 for success, non-zero for error)
    """
    parser = argparse.ArgumentParser(
        description="PDF Asset Extraction Tool for Inhuman Conditions",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        "--version",
        action="version",
        version=f"pdf-asset-extraction {__version__}",
    )

    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        default="INFO",
        help="Logging level (default: INFO)",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Download command
    download_parser = subparsers.add_parser(
        "download",
        help="Download all official PDFs from robots.management",
    )
    download_parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/pdfs"),
        help="Directory to save downloaded PDFs (default: data/pdfs)",
    )
    download_parser.add_argument(
        "--base-url",
        type=str,
        default="https://robots.management/",
        help="Base URL for PDF downloads (default: https://robots.management/)",
    )
    download_parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume interrupted download (skip existing files)",
    )
    download_parser.add_argument(
        "--verify",
        action="store_true",
        help="Verify file integrity with MD5 checksums",
    )
    download_parser.add_argument(
        "--catalog-path",
        type=Path,
        default=Path("data/pdfs/catalog.json"),
        help="Path to catalog output file (default: data/pdfs/catalog.json)",
    )

    # Label command
    label_parser = subparsers.add_parser(
        "label",
        help="Interactive bounding box labeling for content types",
    )
    label_parser.add_argument(
        "pdf_path",
        type=Path,
        help="Path to PDF file to label",
    )
    label_parser.add_argument(
        "--page",
        type=int,
        required=True,
        help="Page number to label (1-indexed)",
    )
    label_parser.add_argument(
        "--labels-file",
        type=Path,
        default=Path("data/labels/labels.json"),
        help="Path to labels file (default: data/labels/labels.json)",
    )
    label_parser.add_argument(
        "--zoom",
        type=float,
        default=2.0,
        help="Zoom level for PDF rendering (default: 2.0)",
    )

    # Extract command
    extract_parser = subparsers.add_parser(
        "extract",
        help="Automated extraction based on labeled patterns",
    )
    extract_parser.add_argument(
        "--labels-file",
        type=Path,
        default=Path("data/labels/labels.json"),
        help="Path to labels file (default: data/labels/labels.json)",
    )
    extract_parser.add_argument(
        "--pdfs-dir",
        type=Path,
        default=Path("data/pdfs"),
        help="Directory containing PDFs (default: data/pdfs)",
    )
    extract_parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/output"),
        help="Directory for extracted assets (default: data/output)",
    )
    extract_parser.add_argument(
        "--content-types",
        nargs="+",
        choices=["maze", "restriction", "task", "icon", "background", "penalty"],
        help="Extract only specific content types (default: all)",
    )
    extract_parser.add_argument(
        "--confidence-threshold",
        type=float,
        default=0.8,
        help="Minimum confidence score for extraction (default: 0.8)",
    )

    # Validate command
    validate_parser = subparsers.add_parser(
        "validate",
        help="Generate HTML validation report",
    )
    validate_parser.add_argument(
        "--extraction-metadata",
        type=Path,
        default=Path("data/output/metadata/extraction_metadata.json"),
        help="Path to extraction metadata file",
    )
    validate_parser.add_argument(
        "--report-output",
        type=Path,
        default=Path("reports/validation_report.html"),
        help="Path to HTML report output (default: reports/validation_report.html)",
    )
    validate_parser.add_argument(
        "--open-browser",
        action="store_true",
        help="Open report in browser after generation",
    )

    # Integrate command
    integrate_parser = subparsers.add_parser(
        "integrate",
        help="Update TypeScript data files with extracted content",
    )
    integrate_parser.add_argument(
        "--extraction-metadata",
        type=Path,
        default=Path("data/output/metadata/extraction_metadata.json"),
        help="Path to extraction metadata file",
    )
    integrate_parser.add_argument(
        "--game-root",
        type=Path,
        default=Path(".."),
        help="Root directory of game project (default: ..)",
    )
    integrate_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing files",
    )
    integrate_parser.add_argument(
        "--no-backup",
        action="store_true",
        help="Skip creating backup of catalyzerCards.ts",
    )
    integrate_parser.add_argument(
        "--mapping-output",
        type=Path,
        default=Path("data/output/metadata/integration_mapping.json"),
        help="Path to integration mapping output",
    )

    # Parse arguments
    args = parser.parse_args()

    # Setup logging
    setup_logging(log_level=args.log_level)
    logger = get_logger(__name__)

    # No command provided
    if not args.command:
        parser.print_help()
        return 1

    # Execute command
    try:
        if args.command == "download":
            from .download import download_pdfs, generate_catalog

            logger.info("Starting PDF download...")

            # Define PDF list (from robots.management)
            # TODO: This should be extracted from the website or a config file
            pdf_list = [
                {
                    "filename": "01_small_talk_suspect.pdf",
                    "url": f"{args.base_url}01_small_talk_suspect.pdf",
                },
                {
                    "filename": "01_small_talk_investigator.pdf",
                    "url": f"{args.base_url}01_small_talk_investigator.pdf",
                },
                # Add more PDFs as needed
            ]

            # Download PDFs
            pdf_documents = download_pdfs(
                base_url=args.base_url,
                output_dir=args.output_dir,
                pdf_list=pdf_list,
                resume=args.resume,
                verify_md5=args.verify,
            )

            # Generate catalog
            generate_catalog(
                pdf_documents=pdf_documents,
                catalog_path=args.catalog_path,
            )

            logger.info("✓ Download complete!")
            return 0

        elif args.command == "label":
            from .labeling import PDFAnnotator, validate_label, save_labels, load_labels

            logger.info("Starting labeling session...")

            # Validate PDF exists
            if not args.pdf_path.exists():
                logger.error(f"PDF file not found: {args.pdf_path}")
                return 1

            # Load existing labels
            existing_labels = load_labels(args.labels_file)
            label_id_prefix = f"label-{len(existing_labels) + 1:03d}"

            # Create annotator (no content_type needed - each box gets its own)
            with PDFAnnotator(
                pdf_path=str(args.pdf_path),
                page_number=args.page,
                zoom=args.zoom,
            ) as annotator:
                # Display interactive interface
                logger.info(
                    f"Opening {args.pdf_path.name} page {args.page} for labeling"
                )
                print(f"\n🏷️  Labeling {args.pdf_path.name} - Page {args.page}")
                print("🃏 Draw bounding boxes around FULL CARDS (tall and narrow, 1:3 ratio)")
                print("   Each card contains: maze + restrictions/tasks")
                print("   You'll assign card types AFTER closing the window")
                print("   Press 'q' when done drawing all cards\n")

                annotator.display()

                # Check keyboard action state
                if annotator.should_quit:
                    logger.info("❌ Labeling session cancelled by user")
                    return 1

                if not annotator.unlabeled_boxes:
                    logger.info("⏭️  No boxes drawn")
                    return 0

                # Assign content types to all boxes (console prompts)
                annotator.assign_content_types()

                if not annotator.labeled_boxes:
                    logger.info("⏭️  No boxes labeled")
                    return 0

                # Create labels from all labeled boxes
                new_labels = annotator.create_labels(
                    label_id_prefix=label_id_prefix,
                    labeled_by="user",  # TODO: Get from config or CLI
                )

                # Validate all labels
                validation_warnings = []
                for label in new_labels:
                    is_valid, message = validate_label(label)
                    if not is_valid:
                        validation_warnings.append(f"{label.id}: {message}")

                if validation_warnings:
                    logger.warning(f"Validation warnings for {len(validation_warnings)} labels:")
                    for warning in validation_warnings:
                        logger.warning(f"  - {warning}")
                    logger.info("Labels saved anyway (validation warnings are informational)")

                # Append to existing labels
                all_labels = existing_labels + new_labels

                # Save labels
                save_labels(all_labels, args.labels_file)

                logger.info(f"✓ Saved {len(new_labels)} new labels! Total labels: {len(all_labels)}")
                print(f"\n✅ Saved {len(new_labels)} labels from this page")
                print(f"📊 Total labels in dataset: {len(all_labels)}")
                return 0
        elif args.command == "extract":
            import fitz  # PyMuPDF
            from .labeling import load_labels
            from .extraction import (
                extract_position_patterns,
                apply_pattern_to_pdf_page,
                apply_margin_trim_to_label,
                validate_margin_trim,
                save_extracted_card,
            )

            logger.info("Starting automated extraction...")

            # Load labeled data
            if not args.labels_file.exists():
                logger.error(f"Labels file not found: {args.labels_file}")
                return 1

            labels = load_labels(args.labels_file)
            logger.info(f"Loaded {len(labels)} labels from {args.labels_file}")

            if len(labels) < 9:
                logger.error(
                    f"Need at least 9 labels for pattern matching, found {len(labels)}. "
                    f"Please label at least 3 cards from 3 pages (9 total)."
                )
                return 1

            # Separate suspect and investigator module labels (exclude investigator_forms)
            suspect_labels = [l for l in labels if 'suspect' in l.pdf_filename.lower()]
            investigator_labels = [
                l for l in labels
                if 'investigator' in l.pdf_filename.lower() and 'form' not in l.pdf_filename.lower()
            ]

            # CRITICAL: Apply margin trimming to labeled data to get actual card dimensions
            # This ensures the pattern is based on trimmed dimensions, not oversized labeled boxes

            # Labels were created at zoom=2.0, so coordinates need to be divided by 2
            LABEL_ZOOM = 2.0

            trimmed_suspect_labels = []
            for label in suspect_labels:
                # Open the PDF containing this label
                pdf_path = args.pdfs_dir / label.pdf_filename
                if not pdf_path.exists():
                    logger.warning(f"PDF not found for label {label.id}: {pdf_path}")
                    continue

                doc = fitz.open(pdf_path)
                page = doc[label.page_number - 1]  # Labels use 1-indexed page numbers

                # Convert label bounding box to PDF coordinate space (unzoom)
                label_bbox = {
                    'x': label.bounding_box.x / LABEL_ZOOM,
                    'y': label.bounding_box.y / LABEL_ZOOM,
                    'width': label.bounding_box.width / LABEL_ZOOM,
                    'height': label.bounding_box.height / LABEL_ZOOM
                }

                # Apply margin trimming to get exact card bounding box
                trimmed_bbox = apply_margin_trim_to_label(page, label_bbox)

                # Create a new label with fully trimmed bounding box
                # This gives us the EXACT card positions and dimensions
                from .models.label import Label, BoundingBox
                trimmed_label = Label(
                    id=label.id,
                    pdf_filename=label.pdf_filename,
                    page_number=label.page_number,
                    content_type=label.content_type,
                    bounding_box=BoundingBox(
                        x=trimmed_bbox['x'],
                        y=trimmed_bbox['y'],
                        width=trimmed_bbox['width'],
                        height=trimmed_bbox['height']
                    ),
                    labeled_by=label.labeled_by,
                    timestamp=label.timestamp,
                    notes=label.notes
                )
                trimmed_suspect_labels.append(trimmed_label)
                doc.close()

            logger.info(f"✓ Applied margin trimming to {len(trimmed_suspect_labels)} suspect labels")

            # Extract position patterns from TRIMMED suspect labels
            if len(trimmed_suspect_labels) < 9:
                logger.warning(
                    f"Only {len(trimmed_suspect_labels)} suspect labels found. "
                    f"Need at least 9 for automated extraction. Skipping suspect cards."
                )
                suspect_pattern = None
            else:
                suspect_pattern = extract_position_patterns(trimmed_suspect_labels)
                logger.info(f"✓ Extracted position pattern from {len(trimmed_suspect_labels)} trimmed suspect labels")

            # Process suspect PDFs
            extracted_count = 0
            if suspect_pattern:
                # Find ALL suspect PDFs - extract from all using the learned pattern
                pdf_files = sorted(args.pdfs_dir.glob('*_suspect.pdf'))

                logger.info(f"Processing {len(pdf_files)} suspect PDFs using learned pattern...")

                for pdf_file in pdf_files:
                    logger.info(f"Extracting cards from {pdf_file.name}...")
                    doc = fitz.open(pdf_file)

                    # Extract cards from each page
                    page_types = [
                        (0, 'human-card'),
                        (1, 'patient-card'),
                        (2, 'violent-card')
                    ]

                    for page_num, page_type in page_types:
                        if page_num >= len(doc):
                            logger.warning(f"Page {page_num + 1} not found in {pdf_file.name}")
                            continue

                        # Extract cards using position pattern (with expansion)
                        # Pattern returns expanded boxes to capture PDF variations
                        cards = apply_pattern_to_pdf_page(doc[page_num], suspect_pattern, page_type)

                        # Trim white margins from expanded boxes to get exact cards
                        for i, card in enumerate(cards):
                            # Apply margin trimming to get exact card boundaries
                            trimmed_card = apply_margin_trim_to_label(doc[page_num], card)

                            # Validate trimmed margins
                            is_valid, error_msg = validate_margin_trim(card, trimmed_card)
                            if not is_valid:
                                logger.error(f"VALIDATION FAILED for {pdf_file.name} page {page_num + 1} card {i + 1}")
                                logger.error(error_msg)
                                logger.error("Extraction halted. Please review PDF structure or expansion settings.")
                                return 1

                            # Save validated and trimmed card
                            card_id = f"{pdf_file.stem}_p{page_num + 1}_c{i + 1:02d}_{page_type}"
                            save_extracted_card(
                                pdf_page=doc[page_num],
                                card_bbox=trimmed_card,
                                output_dir=args.output_dir,
                                card_id=card_id
                            )
                            extracted_count += 1

                    doc.close()

            logger.info(f"✓ Extracted {extracted_count} cards from suspect PDFs")
            logger.info("✓ All extractions passed margin validation")

            # Process investigator PDFs (if labeled)
            if len(investigator_labels) >= 7:  # Need 7 labels: 1 + 3 + 3
                # Apply margin trimming to investigator labels
                trimmed_investigator_labels = []
                for label in investigator_labels:
                    pdf_path = args.pdfs_dir / label.pdf_filename
                    if not pdf_path.exists():
                        logger.warning(f"PDF not found for label {label.id}: {pdf_path}")
                        continue

                    doc = fitz.open(pdf_path)
                    page = doc[label.page_number - 1]

                    label_bbox = {
                        'x': label.bounding_box.x / LABEL_ZOOM,
                        'y': label.bounding_box.y / LABEL_ZOOM,
                        'width': label.bounding_box.width / LABEL_ZOOM,
                        'height': label.bounding_box.height / LABEL_ZOOM
                    }

                    trimmed_bbox = apply_margin_trim_to_label(page, label_bbox)

                    from .models.label import Label, BoundingBox
                    trimmed_label = Label(
                        id=label.id,
                        pdf_filename=label.pdf_filename,
                        page_number=label.page_number,
                        content_type=label.content_type,
                        bounding_box=BoundingBox(
                            x=trimmed_bbox['x'],
                            y=trimmed_bbox['y'],
                            width=trimmed_bbox['width'],
                            height=trimmed_bbox['height']
                        ),
                        labeled_by=label.labeled_by,
                        timestamp=label.timestamp,
                        notes=label.notes
                    )
                    trimmed_investigator_labels.append(trimmed_label)
                    doc.close()

                logger.info(f"✓ Applied margin trimming to {len(trimmed_investigator_labels)} investigator labels")

                # Extract patterns per page (different layouts)
                page1_labels = [l for l in trimmed_investigator_labels if l.page_number == 1]
                page2_labels = [l for l in trimmed_investigator_labels if l.page_number == 2]
                page3_labels = [l for l in trimmed_investigator_labels if l.page_number == 3]

                page1_pattern = extract_position_patterns(page1_labels) if page1_labels else None
                page2_pattern = extract_position_patterns(page2_labels) if page2_labels else None
                page3_pattern = extract_position_patterns(page3_labels) if page3_labels else None

                logger.info(f"✓ Extracted patterns: Page 1 ({len(page1_labels)} labels), Page 2 ({len(page2_labels)} labels), Page 3 ({len(page3_labels)} labels)")

                # Find ALL investigator PDFs - extract from all using the learned patterns
                pdf_files = sorted(args.pdfs_dir.glob('*_investigator.pdf'))

                logger.info(f"Processing {len(pdf_files)} investigator PDFs using learned patterns...")

                for pdf_file in pdf_files:
                    logger.info(f"Extracting cards from {pdf_file.name}...")
                    doc = fitz.open(pdf_file)

                    # Extract cards from each page with appropriate pattern
                    page_configs = [
                        (0, 'cover-sheet', page1_pattern),
                        (1, 'primary-prompts', page2_pattern),
                        (2, 'secondary-prompts', page3_pattern)
                    ]

                    for page_num, page_type, pattern in page_configs:
                        if page_num >= len(doc):
                            logger.warning(f"Page {page_num + 1} not found in {pdf_file.name}")
                            continue

                        if pattern is None:
                            logger.warning(f"No pattern available for page {page_num + 1}, skipping")
                            continue

                        # Extract cards using page-specific position pattern (with expansion)
                        # Pattern returns expanded boxes to capture PDF variations
                        cards = apply_pattern_to_pdf_page(doc[page_num], pattern, page_type)

                        # Trim white margins from expanded boxes to get exact cards
                        for i, card in enumerate(cards):
                            # Apply margin trimming to get exact card boundaries
                            trimmed_card = apply_margin_trim_to_label(doc[page_num], card)

                            # Validate trimmed margins
                            is_valid, error_msg = validate_margin_trim(card, trimmed_card)
                            if not is_valid:
                                logger.error(f"VALIDATION FAILED for {pdf_file.name} page {page_num + 1} card {i + 1}")
                                logger.error(error_msg)
                                logger.error("Extraction halted. Please review PDF structure or expansion settings.")
                                return 1

                            # Save validated and trimmed card
                            card_id = f"{pdf_file.stem}_p{page_num + 1}_c{i + 1:02d}_{page_type}"
                            save_extracted_card(
                                pdf_page=doc[page_num],
                                card_bbox=trimmed_card,
                                output_dir=args.output_dir,
                                card_id=card_id
                            )
                            extracted_count += 1

                    doc.close()

                logger.info(f"✓ Extracted {extracted_count} total cards (suspect + investigator)")
            else:
                logger.info(f"Skipping investigator PDFs (only {len(investigator_labels)} labels, need 7)")

            # Process backgrounds PDF (6 pages, last page is credits)
            background_labels = [l for l in labels if l.content_type.value == 'background']
            if background_labels:
                logger.info(f"Processing backgrounds.pdf with {len(background_labels)} labeled cards...")

                # Apply margin trimming to background labels
                trimmed_background_labels = []
                for label in background_labels:
                    pdf_path = args.pdfs_dir / label.pdf_filename
                    doc = fitz.open(pdf_path)
                    page = doc[label.page_number - 1]

                    label_bbox = {
                        'x': label.bounding_box.x / LABEL_ZOOM,
                        'y': label.bounding_box.y / LABEL_ZOOM,
                        'width': label.bounding_box.width / LABEL_ZOOM,
                        'height': label.bounding_box.height / LABEL_ZOOM
                    }

                    trimmed_bbox = apply_margin_trim_to_label(page, label_bbox)

                    from .models.label import Label, BoundingBox
                    trimmed_label = Label(
                        id=label.id,
                        pdf_filename=label.pdf_filename,
                        page_number=label.page_number,
                        content_type=label.content_type,
                        bounding_box=BoundingBox(
                            x=trimmed_bbox['x'],
                            y=trimmed_bbox['y'],
                            width=trimmed_bbox['width'],
                            height=trimmed_bbox['height']
                        ),
                        labeled_by=label.labeled_by,
                        timestamp=label.timestamp,
                        notes=label.notes
                    )
                    trimmed_background_labels.append(trimmed_label)
                    doc.close()

                # Extract pattern from labeled pages
                background_pattern = extract_position_patterns(trimmed_background_labels)

                # Apply pattern to all pages except last (pages 1-5)
                pdf_path = args.pdfs_dir / 'backgrounds.pdf'
                doc = fitz.open(pdf_path)
                total_pages = doc.page_count

                for page_num in range(total_pages - 1):  # Skip last page (credits)
                    logger.info(f"Extracting backgrounds from page {page_num + 1}...")
                    cards = apply_pattern_to_pdf_page(doc[page_num], background_pattern, 'background')

                    for i, card in enumerate(cards):
                        trimmed_card = apply_margin_trim_to_label(doc[page_num], card)

                        is_valid, error_msg = validate_margin_trim(card, trimmed_card)
                        if not is_valid:
                            # Skip empty positions in grid (in case layout isn't perfectly uniform)
                            if "No white margin detected" in error_msg or "no non-white content" in error_msg.lower():
                                logger.info(f"Skipping empty position backgrounds.pdf page {page_num + 1} card {i + 1}")
                                continue
                            # Real validation failures still halt extraction
                            logger.error(f"VALIDATION FAILED for backgrounds.pdf page {page_num + 1} card {i + 1}")
                            logger.error(error_msg)
                            logger.error("Extraction halted.")
                            return 1

                        card_id = f"backgrounds_p{page_num + 1}_c{i + 1:02d}_background"
                        save_extracted_card(
                            pdf_page=doc[page_num],
                            card_bbox=trimmed_card,
                            output_dir=args.output_dir,
                            card_id=card_id
                        )
                        extracted_count += 1

                doc.close()
                logger.info(f"✓ Extracted background cards from {total_pages - 1} pages")

            # Process penalties PDF (7 pages, last page is credits)
            penalty_labels = [l for l in labels if l.content_type.value == 'penalty']
            if penalty_labels:
                logger.info(f"Processing penalties.pdf with {len(penalty_labels)} labeled cards...")

                # Apply margin trimming to penalty labels
                trimmed_penalty_labels = []
                for label in penalty_labels:
                    pdf_path = args.pdfs_dir / label.pdf_filename
                    doc = fitz.open(pdf_path)
                    page = doc[label.page_number - 1]

                    label_bbox = {
                        'x': label.bounding_box.x / LABEL_ZOOM,
                        'y': label.bounding_box.y / LABEL_ZOOM,
                        'width': label.bounding_box.width / LABEL_ZOOM,
                        'height': label.bounding_box.height / LABEL_ZOOM
                    }

                    trimmed_bbox = apply_margin_trim_to_label(page, label_bbox)

                    from .models.label import Label, BoundingBox
                    trimmed_label = Label(
                        id=label.id,
                        pdf_filename=label.pdf_filename,
                        page_number=label.page_number,
                        content_type=label.content_type,
                        bounding_box=BoundingBox(
                            x=trimmed_bbox['x'],
                            y=trimmed_bbox['y'],
                            width=trimmed_bbox['width'],
                            height=trimmed_bbox['height']
                        ),
                        labeled_by=label.labeled_by,
                        timestamp=label.timestamp,
                        notes=label.notes
                    )
                    trimmed_penalty_labels.append(trimmed_label)
                    doc.close()

                # Extract pattern from labeled pages
                penalty_pattern = extract_position_patterns(trimmed_penalty_labels)

                # Apply pattern to all pages except last (pages 1-6)
                pdf_path = args.pdfs_dir / 'penalties.pdf'
                doc = fitz.open(pdf_path)
                total_pages = doc.page_count

                for page_num in range(total_pages - 1):  # Skip last page (credits)
                    logger.info(f"Extracting penalties from page {page_num + 1}...")
                    cards = apply_pattern_to_pdf_page(doc[page_num], penalty_pattern, 'penalty')

                    for i, card in enumerate(cards):
                        trimmed_card = apply_margin_trim_to_label(doc[page_num], card)

                        is_valid, error_msg = validate_margin_trim(card, trimmed_card)
                        if not is_valid:
                            # Skip empty positions in grid (e.g., 3 cards in 2×2 grid)
                            if "No white margin detected" in error_msg or "no non-white content" in error_msg.lower():
                                logger.info(f"Skipping empty position penalties.pdf page {page_num + 1} card {i + 1}")
                                continue
                            # Real validation failures still halt extraction
                            logger.error(f"VALIDATION FAILED for penalties.pdf page {page_num + 1} card {i + 1}")
                            logger.error(error_msg)
                            logger.error("Extraction halted.")
                            return 1

                        card_id = f"penalties_p{page_num + 1}_c{i + 1:02d}_penalty"
                        save_extracted_card(
                            pdf_page=doc[page_num],
                            card_bbox=trimmed_card,
                            output_dir=args.output_dir,
                            card_id=card_id
                        )
                        extracted_count += 1

                doc.close()
                logger.info(f"✓ Extracted penalty cards from {total_pages - 1} pages")

            # Process investigator forms (extract only one - they're all identical)
            form_labels = [l for l in labels if l.content_type.value == 'investigator-form']
            if form_labels:
                logger.info(f"Processing investigator_forms.pdf (extracting first form only)...")

                # Use first label only (they're all the same)
                label = form_labels[0]
                pdf_path = args.pdfs_dir / label.pdf_filename
                doc = fitz.open(pdf_path)
                page = doc[label.page_number - 1]

                label_bbox = {
                    'x': label.bounding_box.x / LABEL_ZOOM,
                    'y': label.bounding_box.y / LABEL_ZOOM,
                    'width': label.bounding_box.width / LABEL_ZOOM,
                    'height': label.bounding_box.height / LABEL_ZOOM
                }

                trimmed_bbox = apply_margin_trim_to_label(page, label_bbox)

                is_valid, error_msg = validate_margin_trim(label_bbox, trimmed_bbox)
                if not is_valid:
                    logger.error(f"VALIDATION FAILED for investigator_forms.pdf")
                    logger.error(error_msg)
                    logger.error("Extraction halted.")
                    return 1

                card_id = "investigator_forms_p1_c01_investigator-form"
                save_extracted_card(
                    pdf_page=page,
                    card_bbox=trimmed_bbox,
                    output_dir=args.output_dir,
                    card_id=card_id
                )
                extracted_count += 1
                doc.close()

                logger.info(f"✓ Extracted 1 investigator form")

            logger.info(f"✓ Extraction complete! Total: {extracted_count} assets")
            return 0
        elif args.command == "validate":
            from .validation import generate_validation_report

            logger.info("Generating validation report...")

            # Check that extraction output exists
            if not args.extraction_metadata.parent.exists() and not args.output_dir.exists():
                logger.error(f"No extracted assets found. Run 'extract' command first.")
                return 1

            # Use output directory from extract command
            output_dir = Path("data/output")
            if not output_dir.exists():
                logger.error(f"Output directory not found: {output_dir}")
                return 1

            # Generate report
            try:
                generate_validation_report(
                    output_dir=output_dir,
                    report_path=args.report_output
                )
                logger.info(f"✓ Validation report generated: {args.report_output}")

                # Optionally open in browser
                if args.open_browser:
                    import webbrowser
                    webbrowser.open(f"file://{args.report_output.absolute()}")
                    logger.info("✓ Opened report in browser")

                return 0

            except Exception as e:
                logger.error(f"Failed to generate report: {e}", exc_info=True)
                return 1
        elif args.command == "integrate":
            from .integration import map_extracted_assets_to_game_data, generate_typescript_files

            logger.info("Starting TypeScript integration...")

            # Check that extraction output exists
            output_dir = Path("data/output")
            if not output_dir.exists():
                logger.error(f"Output directory not found: {output_dir}. Run 'extract' command first.")
                return 1

            # Get game root directory (parent of extraction directory)
            extraction_dir = Path.cwd()
            game_root_dir = extraction_dir.parent

            # Verify game root has expected structure
            if not (game_root_dir / 'src' / 'data').exists():
                logger.error(
                    f"Game root directory structure not found at {game_root_dir}. "
                    f"Expected src/data/ directory to exist."
                )
                return 1

            # Map extracted assets to game data structures
            logger.info("Mapping extracted assets to game data...")
            mapped_data = map_extracted_assets_to_game_data(output_dir)

            # Generate TypeScript files and copy assets
            logger.info(f"Generating TypeScript integration{' (DRY RUN)' if args.dry_run else ''}...")
            generate_typescript_files(
                mapped_data=mapped_data,
                extraction_dir=extraction_dir,
                game_root_dir=game_root_dir,
                dry_run=args.dry_run
            )

            if args.dry_run:
                logger.info("✓ Dry run complete - no files modified")
                logger.info("Review the integration guide for proposed changes")
            else:
                logger.info("✓ TypeScript integration complete!")
                logger.info("Assets copied to public/assets/cards/")
                logger.info("Review extraction/typescript_integration_guide.md for next steps")

            return 0
        else:
            logger.error(f"Unknown command: {args.command}")
            return 1

    except KeyboardInterrupt:
        logger.warning("Operation cancelled by user")
        return 130  # Standard exit code for SIGINT

    except Exception as e:
        logger.error(f"Command failed: {e}", exc_info=True)
        return 2


if __name__ == "__main__":
    sys.exit(main())
