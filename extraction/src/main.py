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
                print("📦 Draw bounding boxes (as many as you want on this page)")
                print("   After each box, you'll select its content type")
                print("   Press 'q' when done to save all boxes\n")

                annotator.display()

                # Check keyboard action state
                if annotator.should_quit:
                    logger.info("❌ Labeling session cancelled by user")
                    return 1

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
            logger.info("Extract command not yet implemented")
            return 1
        elif args.command == "validate":
            logger.info("Validate command not yet implemented")
            return 1
        elif args.command == "integrate":
            logger.info("Integrate command not yet implemented")
            return 1
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
