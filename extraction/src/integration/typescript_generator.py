"""Generate TypeScript data files with extracted asset paths."""

import shutil
from pathlib import Path
from typing import Dict
from datetime import datetime

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def generate_typescript_files(
    mapped_data: Dict,
    extraction_dir: Path,
    game_root_dir: Path,
    dry_run: bool = False
) -> None:
    """
    Generate TypeScript data files with extracted asset paths.

    Args:
        mapped_data: Mapped asset data from asset_mapper
        extraction_dir: Root directory of extraction tool
        game_root_dir: Root directory of main game project
        dry_run: If True, preview changes without writing files
    """
    output_dir = extraction_dir / 'data' / 'output'
    public_assets_dir = game_root_dir / 'public' / 'assets' / 'cards'

    logger.info(f"{'[DRY RUN] ' if dry_run else ''}Generating TypeScript integration...")

    # Step 1: Copy assets to public/assets/cards/
    _copy_assets_to_public(
        output_dir=output_dir,
        public_assets_dir=public_assets_dir,
        dry_run=dry_run
    )

    # Step 2: Generate TypeScript interface additions
    _generate_typescript_additions(
        mapped_data=mapped_data,
        game_root_dir=game_root_dir,
        dry_run=dry_run
    )

    logger.info(f"{'[DRY RUN] ' if dry_run else ''}TypeScript integration complete!")


def _copy_assets_to_public(
    output_dir: Path,
    public_assets_dir: Path,
    dry_run: bool = False
) -> None:
    """Copy extracted PNG assets to public/assets/cards/ directory."""

    # Create subdirectories for each asset type
    subdirs = {
        'suspect': public_assets_dir / 'suspect',
        'investigator': public_assets_dir / 'investigator',
        'backgrounds': public_assets_dir / 'backgrounds',
        'penalties': public_assets_dir / 'penalties',
        'forms': public_assets_dir / 'forms',
    }

    # Create directories
    for subdir_type, subdir_path in subdirs.items():
        if not dry_run:
            subdir_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"{'[DRY RUN] ' if dry_run else ''}Created directory: {subdir_path}")

    # Copy files
    assets = sorted(output_dir.glob('*.png'))
    copied_count = 0

    for asset_path in assets:
        filename = asset_path.name

        # Determine destination subdirectory
        if '_suspect_' in filename:
            dest_dir = subdirs['suspect']
        elif '_investigator_' in filename:
            dest_dir = subdirs['investigator']
        elif 'backgrounds_' in filename:
            dest_dir = subdirs['backgrounds']
        elif 'penalties_' in filename:
            dest_dir = subdirs['penalties']
        elif 'investigator_forms_' in filename:
            dest_dir = subdirs['forms']
        else:
            logger.warning(f"Unknown asset type: {filename}")
            continue

        dest_path = dest_dir / filename

        if not dry_run:
            shutil.copy2(asset_path, dest_path)

        copied_count += 1
        if copied_count <= 5 or copied_count % 50 == 0:
            logger.info(f"{'[DRY RUN] ' if dry_run else ''}Copied: {filename} → {dest_dir.name}/")

    logger.info(f"{'[DRY RUN] ' if dry_run else ''}Copied {copied_count} assets to public/assets/cards/")


def _generate_typescript_additions(
    mapped_data: Dict,
    game_root_dir: Path,
    dry_run: bool = False
) -> None:
    """Generate TypeScript interface additions for card images."""

    output_file = game_root_dir / 'extraction' / 'typescript_integration_guide.md'

    # Generate markdown guide for manual integration
    guide_content = f"""# TypeScript Integration Guide

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This document describes how to integrate the extracted card images into the TypeScript data structures.

## Overview

- **{len(mapped_data['catalyzer_cards'])} suspect cards** extracted
- **{len(mapped_data['investigator_cards'])} investigator modules** with question cards
- **{len(mapped_data['backgrounds'])} background cards** extracted
- **{len(mapped_data['penalties'])} penalty cards** extracted
- **{len(mapped_data['forms'])} forms** extracted

## Asset Locations

All assets have been copied to:
```
public/assets/cards/
├── suspect/          # {len([c for c in mapped_data['catalyzer_cards']])} suspect card images
├── investigator/     # {sum(len(v['primary_prompts']) + len(v['secondary_prompts']) + (1 if v['cover_sheet'] else 0) for v in mapped_data['investigator_cards'].values())} investigator card images
├── backgrounds/      # {len(mapped_data['backgrounds'])} background card images
├── penalties/        # {len(mapped_data['penalties'])} penalty card images
└── forms/            # {len(mapped_data['forms'])} form images
```

## Integration Steps

### 1. Update CatalyzerCard Interface

Add `cardImage` field to display full card visuals:

```typescript
// src/data/catalyzerCards.ts

export interface CatalyzerCard {{
  id: string;
  packetId: string;
  roleType: RoleType;
  fault?: RobotFault;
  description: string;
  traits?: string[];
  restrictions?: string[];
  tasks?: string[];
  inducerMazeImage: string;
  inducerSolution?: string;
  cardImage?: string;  // ADD THIS: Path to full card image
}}
```

### 2. Update Packet Interface

Add `questionCardImages` to display investigator question cards:

```typescript
// src/types/packet.ts

export interface Question {{
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  examples: string[];
  cardImage?: string;  // ADD THIS: Path to question card image
}}

export interface Packet {{
  id: string;
  name: string;
  difficulty: string;
  icon: string;
  prompt: string;
  questions: Question[];
  roles: PacketRole[];
  coverSheetImage?: string;  // ADD THIS: Path to cover sheet image
}}
```

### 3. Catalyzer Card Mappings

Here are the card image paths for each module:

"""

    # Add catalyzer card mappings organized by module
    guide_content += "\n#### Suspect Cards by Module\n\n"

    # Group by packet_id
    cards_by_module = {}
    for card in mapped_data['catalyzer_cards']:
        packet_id = card['packet_id']
        if packet_id not in cards_by_module:
            cards_by_module[packet_id] = {'human': [], 'patient': [], 'violent': []}

        role = card['role_type']
        if role == 'human':
            cards_by_module[packet_id]['human'].append(card)
        elif role == 'patient-robot':
            cards_by_module[packet_id]['patient'].append(card)
        elif role == 'violent-robot':
            cards_by_module[packet_id]['violent'].append(card)

    for packet_id in sorted(cards_by_module.keys()):
        module_cards = cards_by_module[packet_id]
        guide_content += f"\n**Module: `{packet_id}`**\n\n"
        guide_content += f"- Human cards: {len(module_cards['human'])}\n"
        guide_content += f"- Patient robot cards: {len(module_cards['patient'])}\n"
        guide_content += f"- Violent robot cards: {len(module_cards['violent'])}\n"
        guide_content += "\n```typescript\n"

        # Show first human card example
        if module_cards['human']:
            example = module_cards['human'][0]
            guide_content += f"  cardImage: '{example['card_image']}',  // Human card example\n"

        # Show first patient card example
        if module_cards['patient']:
            example = module_cards['patient'][0]
            guide_content += f"  cardImage: '{example['card_image']}',  // Patient robot example\n"

        # Show first violent card example
        if module_cards['violent']:
            example = module_cards['violent'][0]
            guide_content += f"  cardImage: '{example['card_image']}',  // Violent robot example\n"

        guide_content += "```\n"

    # Add investigator card mappings
    guide_content += "\n### 4. Investigator Card Mappings\n\n"
    guide_content += "Investigator question cards by module:\n\n"

    for packet_id in sorted(mapped_data['investigator_cards'].keys()):
        module = mapped_data['investigator_cards'][packet_id]
        guide_content += f"\n**Module: `{packet_id}`**\n\n"

        if module['cover_sheet']:
            guide_content += f"- Cover sheet: `{module['cover_sheet']['card_image']}`\n"

        guide_content += f"- Primary prompts: {len(module['primary_prompts'])} cards\n"
        guide_content += f"- Secondary prompts: {len(module['secondary_prompts'])} cards\n"

        guide_content += "\n```typescript\n"
        guide_content += f"  coverSheetImage: '{module['cover_sheet']['card_image'] if module['cover_sheet'] else ''}',\n"

        if module['primary_prompts']:
            guide_content += "  questions: [\n"
            for card in module['primary_prompts'][:2]:  # Show first 2 examples
                guide_content += f"    {{ type: 'primary', cardImage: '{card['card_image']}' }},\n"
            guide_content += "    // ... more questions\n"
            guide_content += "  ],\n"

        guide_content += "```\n"

    # Add background and penalty notes
    guide_content += "\n### 5. Backgrounds and Penalties\n\n"
    guide_content += f"- **{len(mapped_data['backgrounds'])} background cards** available in `/assets/cards/backgrounds/`\n"
    guide_content += f"- **{len(mapped_data['penalties'])} penalty cards** available in `/assets/cards/penalties/`\n"
    guide_content += "\nThese can be added to the existing data structures if visual display is desired.\n"

    # Add usage recommendations
    guide_content += """
## Recommended UI Changes

### Display Full Card Images

Instead of building custom widgets to show restrictions/tasks/questions, display the actual card images:

**For Suspect Role Selection:**
```tsx
// Show full card image instead of custom UI
<img
  src={catalyzerCard.cardImage}
  alt={catalyzerCard.description}
  className="card-image"
/>
```

**For Investigator Questions:**
```tsx
// Show full question card instead of text
<img
  src={question.cardImage}
  alt={question.text}
  className="question-card-image"
/>
```

This approach:
- Uses official game design
- Reduces custom UI complexity
- Maintains authentic look and feel
- Displays all card information (restrictions, tasks, examples, etc.)

## Next Steps

1. Update TypeScript interfaces as shown above
2. Add `cardImage` fields to existing data entries
3. Update UI components to display card images
4. Test visual display in game
5. Consider adding zoom/pan for card images if needed

---

Generated by Inhuman Conditions PDF Asset Extraction Tool
"""

    if not dry_run:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(guide_content)

    logger.info(f"{'[DRY RUN] ' if dry_run else ''}Generated integration guide: {output_file}")
    logger.info(f"{'[DRY RUN] ' if dry_run else ''}Review the guide for manual TypeScript updates")
