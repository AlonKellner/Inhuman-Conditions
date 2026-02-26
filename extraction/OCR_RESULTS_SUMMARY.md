# Background Card OCR Extraction Summary

## Overview

Successfully extracted text from 29 of 30 background cards using Tesseract OCR.

**Status**: backgrounds.ts is **OUT OF SYNC** with actual card images - complete mismatch of array order.

## Extraction Results

### Successful Extractions (with high confidence):
- Index 2: "Reality Contestant" ✓
- Index 3: "Cult Leader" ✓
- Index 4: "Foreign Ambassador" ✓
- Index 5: "Motivational Speaker" ✓
- Index 6: "Amateur Wrestler" ✓
- Index 7: "Butcher" ✓
- Index 9: "Freelance Robot Hunter" ✓
- Index 12: "Conspiracy Theorist" ✓
- Index 14: "Used Van Dealer" ✓
- Index 15: "Popstar" ✓
- Index 18: "Mayoral Candidate" ✓
- Index 19: "Decorated Robot Veteran" ✓
- Index 27: "Internal Affairs Agent" ✓
- Index 29: "Sponsored Energy Drink" (likely "Sponsored By Energy Drink") ✓

### Entries Needing Manual Review:

**Index 0** (backgrounds_p1_c01_background.png):
- OCR Result: Fragmented text, no clear name
- **ACTION NEEDED**: Manually view card image to identify background

**Index 1** (backgrounds_p1_c02_background.png):
- OCR Result: "Renowned Professor"
- Issue: Leading quote character
- **FIX**: Remove quote → "Renowned Professor"

**Index 8** (backgrounds_p2_c03_background.png):
- OCR Result: "Builder"
- Issue: Leading quote
- **FIX**: Remove quote → "Builder"

**Index 10** (backgrounds_p2_c05_background.png):
- OCR Result: NO TEXT DETECTED
- **ACTION NEEDED**: Manually view card image to identify background

**Index 11** (backgrounds_p2_c06_background.png):
- OCR Result: "Scientist"
- Possible: Could be "Disgraced Scientist" or other qualifier
- **ACTION NEEDED**: Verify against card image

**Index 13** (backgrounds_p3_c02_background.png):
- OCR Result: "Professional"
- Issue: Incomplete - likely "Professional [Something]"
- **ACTION NEEDED**: View card to get full text

**Index 16** (backgrounds_p3_c05_background.png):
- OCR Result: "Sports:"
- Issue: Incomplete - likely "Retired Sports [Something]"
- **ACTION NEEDED**: View card to get full text

**Index 17** (backgrounds_p3_c06_background.png):
- OCR Result: "Loaasns:)" (OCR garbage)
- **ACTION NEEDED**: Manually view card image

**Index 20** (backgrounds_p4_c03_background.png):
- OCR Result: "Unknown" (OCR failed to extract meaningful text)
- **ACTION NEEDED**: Manually view card image

**Index 21** (backgrounds_p4_c04_background.png):
- OCR Result: "Discharged Prom The Military"
- Issue: "Prom" should be "From"
- **FIX**: "Discharged From The Military"

**Index 22** (backgrounds_p4_c05_background.png):
- OCR Result: "World'S Second Richest,"
- Issue: Apostrophe capitalization, trailing comma
- **FIX**: "World's Second Richest" (or "World's Second Richest Person")

**Index 23** (backgrounds_p4_c06_background.png):
- OCR Result: "Cannibal Suspect.Is"
- Issue: OCR artifact "Suspect.Is" appended
- **FIX**: "Cannibal"

**Index 24** (backgrounds_p5_c01_background.png):
- OCR Result: "Dean Ofa Clown Gollege By:"
- Issues: "Ofa" → "Of A", "Gollege" → "College", remove "By:"
- **FIX**: "Dean Of A Clown College"

**Index 25** (backgrounds_p5_c02_background.png):
- OCR Result: "Former "Child Star:"
- Issue: Extra quote and colon
- **FIX**: "Former Child Star"

**Index 26** (backgrounds_p5_c03_background.png):
- OCR Result: "Butler The Stars"
- Issue: Missing "To"
- **FIX**: "Butler To The Stars"

**Index 28** (backgrounds_p5_c05_background.png):
- OCR Result: "Activist:"
- Issue: Incomplete - likely "Robot Rights Activist"
- **ACTION NEEDED**: View card to get full text

## Current backgrounds.ts vs. OCR Results - MAJOR MISMATCHES

Examples showing array is completely out of order:

| Index | backgrounds.ts (current) | OCR from Card (actual) | Match? |
|-------|--------------------------|------------------------|--------|
| 2 | Mayoral Candidate | Reality Contestant | ✗ |
| 3 | Former Professional Athlete | Cult Leader | ✗ |
| 4 | High School Teacher | Foreign Ambassador | ✗ |
| 9 | Emergency Room Nurse | Freelance Robot Hunter | ✗ |
| 18 | Corporate Accountant | Mayoral Candidate | ✗ |
| 19 | Social Worker | Decorated Robot Veteran | ✗ |

**CRITICAL**: The current array does NOT match card image order. Permutations will be incorrect.

## Next Steps

1. **Manual Review**: View the 9 problematic card images to verify correct text:
   - backgrounds_p1_c01_background.png (index 0)
   - backgrounds_p2_c05_background.png (index 10)
   - backgrounds_p2_c06_background.png (index 11)
   - backgrounds_p3_c02_background.png (index 13)
   - backgrounds_p3_c05_background.png (index 16)
   - backgrounds_p3_c06_background.png (index 17)
   - backgrounds_p4_c03_background.png (index 20)
   - backgrounds_p5_c05_background.png (index 28)

2. **Edit Generated File**: Update `extraction/backgrounds_generated.ts` with:
   - Corrected text for problematic entries
   - Verified backgrounds for the 9 cards needing manual review

3. **Replace backgrounds.ts**: Copy corrected file to `src/data/backgrounds.ts`

4. **Verify**: Test game with a seed to ensure investigator form names match suspect card images

## Files Generated

- `extraction/background_ocr_results.json` - Raw OCR output for all 30 cards
- `extraction/backgrounds_generated.ts` - Generated TypeScript array (needs manual fixes)
- `extraction/OCR_RESULTS_SUMMARY.md` - This file

## Tools Created

- `extraction/extract_backgrounds.py` - OCR extraction script (Tesseract)
- `extraction/validate_background_mapping.py` - Validation script
- `extraction/generate_backgrounds_ts.py` - TypeScript generator
