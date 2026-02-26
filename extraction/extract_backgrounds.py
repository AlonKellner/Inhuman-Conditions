#!/usr/bin/env python3
"""
Background Card OCR Extraction Script
Extracts text from all 30 background card images using Tesseract OCR
"""

try:
    import pytesseract
except ImportError:
    print("ERROR: pytesseract not installed. Installing now...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pytesseract'])
    import pytesseract

from PIL import Image
import json
from pathlib import Path
import sys

def extract_background_cards():
    """Extract text from all 30 background card images"""

    print("Using Tesseract OCR for text extraction...")

    # Path to background cards
    backgrounds_dir = Path(__file__).parent.parent / 'public' / 'assets' / 'cards' / 'backgrounds'

    if not backgrounds_dir.exists():
        print(f"ERROR: Backgrounds directory not found: {backgrounds_dir}")
        sys.exit(1)

    results = {}
    total_cards = 30
    processed = 0
    missing = []

    print(f"\nExtracting text from {total_cards} background cards...")
    print("=" * 60)

    # Process all 30 cards in order (p1_c01 through p5_c06)
    for page in range(1, 6):  # pages 1-5
        for card_num in range(1, 7):  # cards 01-06
            filename = f'backgrounds_p{page}_c{card_num:02d}_background.png'
            filepath = backgrounds_dir / filename

            # Calculate array index (0-29)
            index = (page - 1) * 6 + (card_num - 1)

            if not filepath.exists():
                print(f"⚠️  Missing: {filename} (index {index})")
                missing.append(filename)
                continue

            # Run OCR
            try:
                # Open image and run Tesseract OCR
                img = Image.open(filepath)

                # Get text with confidence scores
                ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

                # Extract text blocks with confidence > 0
                extracted_text = []
                for i in range(len(ocr_data['text'])):
                    text = ocr_data['text'][i].strip()
                    conf = ocr_data['conf'][i]

                    # Only keep text with confidence > 0 and non-empty
                    if conf > 0 and text:
                        extracted_text.append({
                            'text': text,
                            'confidence': conf / 100.0  # Normalize to 0-1
                        })

                results[index] = {
                    'filename': filename,
                    'extracted_text': extracted_text,
                    'page': page,
                    'card_num': card_num
                }

                processed += 1

                # Show progress with extracted text preview
                if extracted_text:
                    # Combine words to find likely background name (longest continuous text)
                    words = [item['text'] for item in extracted_text]
                    full_text = ' '.join(words)
                    main_text = full_text[:50] if full_text else "NO TEXT"
                    print(f"✓ [{index:2d}] {filename}: '{main_text}...'")
                else:
                    print(f"⚠️  [{index:2d}] {filename}: NO TEXT DETECTED")

            except Exception as e:
                print(f"❌ [{index:2d}] {filename}: ERROR - {e}")
                continue

    print("=" * 60)
    print(f"\nProcessed: {processed}/{total_cards} cards")

    if missing:
        print(f"Missing: {len(missing)} cards")
        for m in missing:
            print(f"  - {m}")

    # Save results
    output_file = Path(__file__).parent / 'background_ocr_results.json'
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Results saved to: {output_file}")
    print(f"  Total cards extracted: {len(results)}")

    return results

if __name__ == '__main__':
    extract_background_cards()
