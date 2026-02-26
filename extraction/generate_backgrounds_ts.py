#!/usr/bin/env python3
"""
Background TypeScript Generator
Generates corrected backgrounds.ts from OCR-extracted text
"""

import json
from pathlib import Path
import sys
import re

def slugify(text: str) -> str:
    """Convert background name to kebab-case ID"""
    # Remove punctuation, convert to lowercase
    text = text.lower()
    # Replace apostrophes and other special chars
    text = text.replace("'", "").replace(".", "")
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    # Remove any remaining non-alphanumeric characters (except hyphens)
    text = re.sub(r'[^a-z0-9-]', '', text)
    return text

def extract_background_name(ocr_texts: list) -> str:
    """Extract the actual background name from OCR text fragments"""
    if not ocr_texts:
        return "UNKNOWN"

    # Filter out noise: common words, punctuation, single chars, OCR artifacts
    noise_words = {'suspect', 'is', 'suspectis', 'suspects', 'loagsns', 'loaasns', 'foaasns',
                   'ioaasns', 'lo3asns', 'loadgns', 'doaasng', '193dsns', '2o3dsns', 'loazasngs',
                   'loaagngs', 's110aagns', 'slgadsns', 'adaasn', 'yoaasns', '8uspect', 'sretired',
                   'susrectis', 'suspegts', 'tac'}
    meaningful_texts = []

    for item in ocr_texts:
        text = item['text']
        text_lower = text.lower().strip('()_.-+*"\'©@|{}')

        # Skip punctuation-only, very short, or noise words
        if (len(text_lower) > 2 and
            text_lower not in noise_words and
            not all(c in '()_.-@©|{}+*"\'' for c in text)):
            meaningful_texts.append(text)

    if not meaningful_texts:
        return "UNKNOWN"

    # Combine uppercase words (likely the actual background text)
    uppercase_words = [w.strip('()_.-+*"\'©@|{}') for w in meaningful_texts if w.isupper() and len(w) > 2]

    if uppercase_words:
        # Join and clean up
        combined = ' '.join(uppercase_words)
        # Remove duplicate "SUSPECT" or "IS" if present
        combined = re.sub(r'\b(SUSPECT|IS)\s+', '', combined, flags=re.IGNORECASE)
        return combined.strip()

    # Fallback to joining all meaningful text
    return ' '.join(meaningful_texts).strip()

def generate_backgrounds_ts():
    """Generate TypeScript backgrounds array from OCR results"""

    # Load OCR results
    ocr_file = Path(__file__).parent / 'background_ocr_results.json'

    if not ocr_file.exists():
        print(f"ERROR: OCR results not found: {ocr_file}")
        print("Run extract_backgrounds.py first to generate OCR results.")
        sys.exit(1)

    with open(ocr_file) as f:
        ocr_results = json.load(f)

    print("Generating backgrounds.ts from OCR results...")
    print("=" * 60)

    # Generate TypeScript array in card order
    ts_lines = []
    ts_lines.append("/**")
    ts_lines.append(" * Suspect Backgrounds")
    ts_lines.append(" * 30 character identities assigned to Suspects")
    ts_lines.append(" * Generated from OCR extraction of background card images")
    ts_lines.append(" */")
    ts_lines.append("")
    ts_lines.append("import type { Background } from '../types/background';")
    ts_lines.append("")
    ts_lines.append("export const backgrounds: Background[] = [")

    missing_cards = []

    for i in range(30):
        if str(i) in ocr_results:
            card_data = ocr_results[str(i)]
            text_blocks = card_data['extracted_text']

            if text_blocks:
                # Extract background name using smart logic
                background_name = extract_background_name(text_blocks)

                # Clean up OCR artifacts
                background_name = background_name.strip()

                # Title case for proper display
                background_name = background_name.title()

                # Generate ID from name (lowercase, hyphenated)
                bg_id = slugify(background_name)

                ts_lines.append(f"  {{ id: '{bg_id}', name: '{background_name}' }},")

                print(f"✓ [{i:2d}] {bg_id:<30} '{background_name}'")
            else:
                ts_lines.append(f"  // Index {i}: NO TEXT DETECTED in {card_data['filename']}")
                missing_cards.append((i, card_data['filename']))
                print(f"⚠️  [{i:2d}] NO TEXT DETECTED in {card_data['filename']}")
        else:
            ts_lines.append(f"  // Index {i}: MISSING CARD")
            missing_cards.append((i, f"backgrounds_p{i//6 + 1}_c{(i%6)+1:02d}_background.png"))
            print(f"❌ [{i:2d}] MISSING CARD")

    ts_lines.append("];")
    ts_lines.append("")

    # Write to output file
    output_file = Path(__file__).parent / 'backgrounds_generated.ts'
    output_content = "\n".join(ts_lines)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)

    print("=" * 60)
    print(f"\n✓ Generated TypeScript file: {output_file}")

    if missing_cards:
        print(f"\n⚠️  Warning: {len(missing_cards)} cards missing or had no text:")
        for idx, filename in missing_cards:
            print(f"  - Index {idx}: {filename}")
        print("\nReview the generated file and manually fix these entries.")

    print("\nNext steps:")
    print("1. Review the generated file: extraction/backgrounds_generated.ts")
    print("2. Compare with current: src/data/backgrounds.ts")
    print("3. If correct, replace src/data/backgrounds.ts with the generated version")
    print("4. Run build to verify: npm run build")

    return output_file

if __name__ == '__main__':
    generate_backgrounds_ts()
