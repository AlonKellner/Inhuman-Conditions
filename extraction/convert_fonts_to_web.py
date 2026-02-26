"""Convert extracted fonts to web formats (WOFF2)"""

from fontTools import ttLib
from pathlib import Path

def convert_to_woff2(input_path: Path, output_dir: Path):
    """Convert TTF/OTF to WOFF2"""
    try:
        font = ttLib.TTFont(input_path)

        # Generate output filename
        output_filename = input_path.stem + ".woff2"
        output_path = output_dir / output_filename

        # Save as WOFF2
        font.flavor = 'woff2'
        font.save(str(output_path))

        print(f"✓ Converted {input_path.name} → {output_filename}")
        return output_path

    except Exception as e:
        print(f"✗ Error converting {input_path.name}: {e}")
        return None

def main():
    fonts_dir = Path("extracted_fonts")
    web_fonts_dir = Path("web_fonts")
    web_fonts_dir.mkdir(exist_ok=True)

    # Convert all TTF files (Gautami will be TTF)
    converted_count = 0
    for font_file in fonts_dir.glob("*.ttf"):
        if "Gautami" in font_file.name or "gautami" in font_file.name.lower():
            # Only convert full Gautami fonts (not subsets like Arial, Times New Roman)
            if "+" not in font_file.name:
                result = convert_to_woff2(font_file, web_fonts_dir)
                if result:
                    converted_count += 1

    print(f"\n✓ Web fonts saved to {web_fonts_dir}/")
    print(f"✓ Converted {converted_count} Gautami font file(s)")

if __name__ == "__main__":
    main()
