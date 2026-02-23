"""Map extracted PNG assets to game data structures."""

from pathlib import Path
from typing import Dict, List
import re

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


# Module ID mapping (PDF filename → game data packetId)
MODULE_MAPPING = {
    '01_small_talk': 'small-talk',
    '02_problem_solving': 'creative-problem-solving',
    '03_imagination': 'imagination',
    '04_cooperation': 'cooperation',
    '05_hopes': 'hopes-and-dreams',
    '06_body': 'the-body',
    '07_grief': 'grief-and-loss',
    '08_threat': 'threat-assessment',
    '09_moral_failings': 'moral-failings',
    '10_self_image': 'self-image',
    '11_intentions': 'intentions',
}


def parse_filename(filename: str) -> Dict:
    """
    Parse extracted asset filename to extract metadata.

    Format: {module}_{type}_p{page}_c{card}_{content_type}.png
    Examples:
      - 01_small_talk_suspect_p2_c01_patient-card.png
      - 01_small_talk_investigator_p2_c01_primary-prompts.png
      - backgrounds_p1_c01_background.png

    Returns:
        Dictionary with parsed metadata
    """
    stem = Path(filename).stem

    # Parse suspect/investigator cards
    suspect_pattern = r'(\d+_[\w_]+)_suspect_p(\d+)_c(\d+)_([\w-]+)'
    investigator_pattern = r'(\d+_[\w_]+)_investigator_p(\d+)_c(\d+)_([\w-]+)'
    background_pattern = r'backgrounds_p(\d+)_c(\d+)_([\w-]+)'
    penalty_pattern = r'penalties_p(\d+)_c(\d+)_([\w-]+)'
    form_pattern = r'investigator_forms_p(\d+)_c(\d+)_([\w-]+)'

    # Try suspect pattern
    match = re.match(suspect_pattern, stem)
    if match:
        module_file, page, card, content_type = match.groups()
        return {
            'type': 'suspect',
            'module_file': module_file,
            'packet_id': MODULE_MAPPING.get(module_file, module_file),
            'page': int(page),
            'card': int(card),
            'content_type': content_type,
            'filename': filename
        }

    # Try investigator pattern
    match = re.match(investigator_pattern, stem)
    if match:
        module_file, page, card, content_type = match.groups()
        return {
            'type': 'investigator',
            'module_file': module_file,
            'packet_id': MODULE_MAPPING.get(module_file, module_file),
            'page': int(page),
            'card': int(card),
            'content_type': content_type,
            'filename': filename
        }

    # Try background pattern
    match = re.match(background_pattern, stem)
    if match:
        page, card, content_type = match.groups()
        return {
            'type': 'background',
            'page': int(page),
            'card': int(card),
            'content_type': content_type,
            'filename': filename
        }

    # Try penalty pattern
    match = re.match(penalty_pattern, stem)
    if match:
        page, card, content_type = match.groups()
        return {
            'type': 'penalty',
            'page': int(page),
            'card': int(card),
            'content_type': content_type,
            'filename': filename
        }

    # Try form pattern
    match = re.match(form_pattern, stem)
    if match:
        page, card, content_type = match.groups()
        return {
            'type': 'form',
            'page': int(page),
            'card': int(card),
            'content_type': content_type,
            'filename': filename
        }

    logger.warning(f"Could not parse filename: {filename}")
    return {'type': 'unknown', 'filename': filename}


def map_extracted_assets_to_game_data(output_dir: Path) -> Dict:
    """
    Map all extracted PNG assets to game data structures.

    Args:
        output_dir: Directory containing extracted PNG files

    Returns:
        Dictionary with mapped assets organized by type
    """
    assets = sorted(output_dir.glob('*.png'))

    mapped_data = {
        'catalyzer_cards': [],      # Suspect cards for catalyzerCards.ts
        'investigator_cards': {},    # Investigator cards by module
        'backgrounds': [],           # Background character cards
        'penalties': [],             # Penalty action cards
        'forms': [],                 # Investigator forms
    }

    for asset_path in assets:
        metadata = parse_filename(asset_path.name)

        if metadata['type'] == 'suspect':
            # Map to catalyzer card data
            card_data = {
                'packet_id': metadata['packet_id'],
                'page': metadata['page'],
                'card_number': metadata['card'],
                'content_type': metadata['content_type'],
                'card_image': f"/assets/cards/suspect/{asset_path.name}",
                'source_file': asset_path.name
            }

            # Determine role type from page number
            # Page 1 = human-card, Page 2 = patient-card, Page 3 = violent-card
            if metadata['page'] == 1:
                card_data['role_type'] = 'human'
            elif metadata['page'] == 2:
                card_data['role_type'] = 'patient-robot'
            elif metadata['page'] == 3:
                card_data['role_type'] = 'violent-robot'

            mapped_data['catalyzer_cards'].append(card_data)

        elif metadata['type'] == 'investigator':
            # Map to investigator question cards
            packet_id = metadata['packet_id']
            if packet_id not in mapped_data['investigator_cards']:
                mapped_data['investigator_cards'][packet_id] = {
                    'cover_sheet': None,
                    'primary_prompts': [],
                    'secondary_prompts': []
                }

            card_data = {
                'page': metadata['page'],
                'card_number': metadata['card'],
                'content_type': metadata['content_type'],
                'card_image': f"/assets/cards/investigator/{asset_path.name}",
                'source_file': asset_path.name
            }

            # Organize by page type
            if metadata['content_type'] == 'cover-sheet':
                mapped_data['investigator_cards'][packet_id]['cover_sheet'] = card_data
            elif metadata['content_type'] == 'primary-prompts':
                mapped_data['investigator_cards'][packet_id]['primary_prompts'].append(card_data)
            elif metadata['content_type'] == 'secondary-prompts':
                mapped_data['investigator_cards'][packet_id]['secondary_prompts'].append(card_data)

        elif metadata['type'] == 'background':
            mapped_data['backgrounds'].append({
                'page': metadata['page'],
                'card_number': metadata['card'],
                'card_image': f"/assets/cards/backgrounds/{asset_path.name}",
                'source_file': asset_path.name
            })

        elif metadata['type'] == 'penalty':
            mapped_data['penalties'].append({
                'page': metadata['page'],
                'card_number': metadata['card'],
                'card_image': f"/assets/cards/penalties/{asset_path.name}",
                'source_file': asset_path.name
            })

        elif metadata['type'] == 'form':
            mapped_data['forms'].append({
                'card_image': f"/assets/cards/forms/{asset_path.name}",
                'source_file': asset_path.name
            })

    # Log summary
    logger.info(f"Mapped {len(mapped_data['catalyzer_cards'])} catalyzer cards")
    logger.info(f"Mapped {len(mapped_data['investigator_cards'])} investigator modules")
    logger.info(f"Mapped {len(mapped_data['backgrounds'])} backgrounds")
    logger.info(f"Mapped {len(mapped_data['penalties'])} penalties")
    logger.info(f"Mapped {len(mapped_data['forms'])} forms")

    return mapped_data
