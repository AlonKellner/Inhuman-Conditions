#!/usr/bin/env python3
"""
Background Mapping Validation Script
Compares OCR-extracted text from cards with current backgrounds.ts data
"""

import json
from pathlib import Path
import sys

# Current backgrounds from backgrounds.ts (in order)
CURRENT_BACKGROUNDS = [
    "Reality TV Contestant",
    "Disgraced Scientist",
    "Mayoral Candidate",
    "Former Professional Athlete",
    "High School Teacher",
    "Restaurant Chef",
    "Struggling Artist",
    "Investigative Journalist",
    "Indie Musician",
    "Emergency Room Nurse",
    "Auto Mechanic",
    "Public Librarian",
    "Veteran Bartender",
    "Defense Attorney",
    "Software Developer",
    "Commercial Pilot",
    "Veterinarian",
    "Freelance Architect",
    "Corporate Accountant",
    "Social Worker",
    "Paramedic",
    "Wedding Photographer",
    "Marriage Counselor",
    "Retired Detective",
    "University Professor",
    "Startup Founder",
    "Professional Translator",
    "Florist Shop Owner",
    "Pharmacist",
    "Management Consultant",
]

def normalize_text(text: str) -> str:
    """Normalize text for comparison (lowercase, no punctuation)"""
    return text.lower().replace('.', '').replace(',', '').replace("'", '').strip()

def find_best_match(ocr_texts: list, current_name: str) -> tuple[str, float]:
    """Find the best matching OCR text for a background name"""
    if not ocr_texts:
        return ("NO TEXT FOUND", 0.0)

    # Filter out noise: common words, punctuation, single chars
    noise_words = {'suspect', 'is', 'suspectis', 'suspects'}
    meaningful_texts = []

    for item in ocr_texts:
        text = item['text']
        text_lower = text.lower().strip('()_.-')

        # Skip punctuation-only, very short, or noise words
        if (len(text_lower) > 2 and
            text_lower not in noise_words and
            not all(c in '()_.-@©|' for c in text)):
            meaningful_texts.append(item)

    if not meaningful_texts:
        return ("NO TEXT FOUND", 0.0)

    # Combine meaningful words to form likely background name
    words = [item['text'].strip('()_.-') for item in meaningful_texts if item['text'].isupper() or len(item['text']) > 3]
    combined_text = ' '.join(words) if words else meaningful_texts[0]['text']

    current_normalized = normalize_text(current_name)
    combined_normalized = normalize_text(combined_text)

    # Try exact match
    if combined_normalized == current_normalized:
        return (combined_text, 1.0)

    # Try substring match
    if current_normalized in combined_normalized or combined_normalized in current_normalized:
        return (combined_text, 0.8)

    # Return combined meaningful text
    return (combined_text, 0.5)

def validate_mapping():
    """Validate background card text against current backgrounds.ts"""

    # Load OCR results
    ocr_file = Path(__file__).parent / 'background_ocr_results.json'

    if not ocr_file.exists():
        print(f"ERROR: OCR results not found: {ocr_file}")
        print("Run extract_backgrounds.py first to generate OCR results.")
        sys.exit(1)

    with open(ocr_file) as f:
        ocr_results = json.load(f)

    print("Background Card Mapping Validation")
    print("=" * 80)
    print(f"{'Index':<6} | {'OCR Text (from card)':<35} | {'Current Data (backgrounds.ts)':<30} | Status")
    print("-" * 80)

    mismatches = []
    matches = 0
    missing = 0

    for i in range(30):
        current_text = CURRENT_BACKGROUNDS[i]

        if str(i) in ocr_results:
            ocr_data = ocr_results[str(i)]
            ocr_texts = ocr_data['extracted_text']

            # Find best matching text
            card_text, confidence = find_best_match(ocr_texts, current_text)

            # Determine match status
            card_normalized = normalize_text(card_text)
            current_normalized = normalize_text(current_text)

            if card_normalized == current_normalized:
                status = "✓ EXACT"
                matches += 1
            elif current_normalized in card_normalized or card_normalized in current_normalized:
                status = "≈ PARTIAL"
                matches += 1
            else:
                status = "✗ MISMATCH"
                mismatches.append((i, card_text, current_text, ocr_data['filename']))

            # Truncate text for display
            card_display = card_text[:33] + ".." if len(card_text) > 35 else card_text
            current_display = current_text[:28] + ".." if len(current_text) > 30 else current_text

            print(f"{i:<6} | {card_display:<35} | {current_display:<30} | {status}")

        else:
            print(f"{i:<6} | {'MISSING CARD':<35} | {current_text:<30} | ✗ MISSING")
            missing += 1

    print("=" * 80)
    print(f"\nSummary:")
    print(f"  ✓ Matches: {matches}/30")
    print(f"  ✗ Mismatches: {len(mismatches)}/30")
    print(f"  ⚠️  Missing cards: {missing}/30")

    if mismatches:
        print(f"\n⚠️  Found {len(mismatches)} mismatches!")
        print("\nMismatched entries:")
        for idx, card, data, filename in mismatches:
            print(f"  Index {idx} ({filename}):")
            print(f"    Card says: '{card}'")
            print(f"    Data says: '{data}'")

        print("\n❌ VALIDATION FAILED: backgrounds.ts order does NOT match card images")
        print("    Run generate_backgrounds_ts.py to create corrected array")
        return False
    else:
        print("\n✓ VALIDATION PASSED: All backgrounds match!")
        print("  backgrounds.ts is correctly synchronized with card images")
        return True

if __name__ == '__main__':
    success = validate_mapping()
    sys.exit(0 if success else 1)
