"""
Extract fonts from Inhuman Conditions game PDFs
Focuses on extracting Gautami font (the game's distinctive font)
"""

import fitz  # PyMuPDF
from pathlib import Path
import json

def extract_fonts_from_pdf(pdf_path: Path, output_dir: Path):
    """Extract all fonts from a PDF"""
    doc = fitz.open(str(pdf_path))
    xref_visited = []
    extracted_fonts = []

    for page in doc:
        font_list = page.get_fonts()

        for font_info in font_list:
            xref = font_info[0]  # Font reference number

            if xref in xref_visited:
                continue

            xref_visited.append(xref)

            try:
                # Extract font buffer
                basename, ext, _, buffer = doc.extract_font(xref)

                if ext != "n/a" and buffer:
                    # Save font file
                    font_filename = f"{basename}-{xref}.{ext}"
                    font_path = output_dir / font_filename

                    with open(font_path, "wb") as f:
                        f.write(buffer)

                    extracted_fonts.append({
                        'basename': basename,
                        'extension': ext,
                        'filename': font_filename,
                        'xref': xref,
                        'is_subset': '+' in basename,
                        'pdf_source': pdf_path.name
                    })

                    print(f"Extracted: {font_filename} from {pdf_path.name}")

            except Exception as e:
                print(f"Error extracting font {xref} from {pdf_path.name}: {e}")

    return extracted_fonts

def main():
    # Paths
    pdfs_dir = Path("data/pdfs")
    output_dir = Path("extracted_fonts")
    output_dir.mkdir(exist_ok=True)

    # PDFs to extract fonts from (excluding rasterized ones)
    pdf_files = [
        # Module PDFs (have embedded Gautami)
        "01_small_talk_investigator.pdf",
        "backgrounds.pdf",
        "penalties.pdf",
    ]

    all_fonts = []

    for pdf_file in pdf_files:
        pdf_path = pdfs_dir / pdf_file
        if pdf_path.exists():
            print(f"\nProcessing: {pdf_file}")
            fonts = extract_fonts_from_pdf(pdf_path, output_dir)
            all_fonts.extend(fonts)
        else:
            print(f"Warning: {pdf_file} not found")

    # Save metadata
    metadata_path = output_dir / "fonts_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(all_fonts, f, indent=2)

    print(f"\n✓ Extracted {len(all_fonts)} font files to {output_dir}/")
    print(f"✓ Metadata saved to {metadata_path}")

    # Report Gautami fonts specifically
    gautami_fonts = [f for f in all_fonts if 'Gautami' in f['basename'] or 'gautami' in f['basename'].lower()]
    if gautami_fonts:
        print(f"\n✓ Found {len(gautami_fonts)} Gautami font(s):")
        for font in gautami_fonts:
            subset_status = " (SUBSET)" if font['is_subset'] else " (FULL)"
            print(f"  - {font['filename']}{subset_status} from {font['pdf_source']}")

if __name__ == "__main__":
    main()
