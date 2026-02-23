"""Generate HTML validation reports for extracted assets."""

from pathlib import Path
from typing import List, Dict
from datetime import datetime
from jinja2 import Template


HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Extraction Validation Report</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        header {
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }

        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .meta {
            color: #7f8c8d;
            font-size: 0.9em;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .summary-card h3 {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 10px;
        }

        .summary-card .number {
            font-size: 3em;
            font-weight: bold;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-header {
            background: #ecf0f1;
            padding: 15px 20px;
            border-left: 4px solid #3498db;
            margin-bottom: 20px;
        }

        .section-header h2 {
            color: #2c3e50;
            font-size: 1.5em;
        }

        .section-header .count {
            color: #7f8c8d;
            font-size: 0.9em;
        }

        .asset-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .asset-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .asset-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .asset-image {
            width: 100%;
            height: 300px;
            object-fit: contain;
            background: #fafafa;
            border-bottom: 1px solid #e0e0e0;
        }

        .asset-info {
            padding: 15px;
        }

        .asset-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 0.9em;
        }

        .asset-meta {
            font-size: 0.85em;
            color: #7f8c8d;
            line-height: 1.8;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: bold;
            margin-right: 5px;
        }

        .badge-suspect {
            background: #e74c3c;
            color: white;
        }

        .badge-investigator {
            background: #3498db;
            color: white;
        }

        .badge-other {
            background: #95a5a6;
            color: white;
        }

        .dimensions {
            color: #16a085;
            font-family: monospace;
        }

        footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #95a5a6;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 PDF Extraction Validation Report</h1>
            <div class="meta">
                Generated: {{ generation_time }}<br>
                Extraction Directory: {{ output_dir }}
            </div>
        </header>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Assets</h3>
                <div class="number">{{ stats.total }}</div>
            </div>
            <div class="summary-card">
                <h3>Suspect Cards</h3>
                <div class="number">{{ stats.suspect_count }}</div>
            </div>
            <div class="summary-card">
                <h3>Investigator Cards</h3>
                <div class="number">{{ stats.investigator_count }}</div>
            </div>
            <div class="summary-card">
                <h3>Other Assets</h3>
                <div class="number">{{ stats.other_count }}</div>
            </div>
        </div>

        {% for section in sections %}
        <div class="section">
            <div class="section-header">
                <h2>{{ section.title }}</h2>
                <div class="count">{{ section.count }} assets</div>
            </div>

            <div class="asset-grid">
                {% for asset in section.assets %}
                <div class="asset-card">
                    <img src="{{ asset.path }}" alt="{{ asset.id }}" class="asset-image">
                    <div class="asset-info">
                        <div class="asset-title">
                            <span class="badge badge-{{ asset.badge_type }}">{{ asset.content_type }}</span>
                            {{ asset.id }}
                        </div>
                        <div class="asset-meta">
                            📄 Source: {{ asset.source }}<br>
                            📏 Dimensions: <span class="dimensions">{{ asset.dimensions }}</span>
                        </div>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endfor %}

        <footer>
            Generated by Inhuman Conditions PDF Asset Extraction Tool<br>
            {{ generation_time }}
        </footer>
    </div>
</body>
</html>
"""


def generate_validation_report(
    output_dir: Path,
    report_path: Path
) -> None:
    """
    Generate HTML validation report showing all extracted assets.

    Args:
        output_dir: Directory containing extracted PNG files
        report_path: Path where HTML report should be saved
    """
    # Find all extracted assets
    assets = sorted(output_dir.glob('*.png'))

    if not assets:
        raise ValueError(f"No PNG files found in {output_dir}")

    # Parse asset information
    asset_data = []
    for asset_path in assets:
        # Parse filename: {module}_p{page}_c{card}_{type}.png
        filename = asset_path.stem  # Remove .png

        # Determine content type and badge
        if '_suspect_' in filename:
            badge_type = 'suspect'
        elif '_investigator_' in filename:
            badge_type = 'investigator'
        else:
            badge_type = 'other'

        # Extract content type from filename
        parts = filename.split('_')
        content_type = parts[-1] if len(parts) > 0 else 'unknown'

        # Get source PDF name (before _p{page})
        source_match = filename.split('_p')[0] if '_p' in filename else filename
        source = f"{source_match}.pdf"

        # Get image dimensions
        from PIL import Image
        img = Image.open(asset_path)
        dimensions = f"{img.width}×{img.height}"

        asset_data.append({
            'id': filename,
            'path': f"../data/output/{asset_path.name}",  # Relative to report location (reports/ -> data/output/)
            'content_type': content_type,
            'badge_type': badge_type,
            'source': source,
            'dimensions': dimensions,
            'is_suspect': badge_type == 'suspect',
            'is_investigator': badge_type == 'investigator',
            'is_other': badge_type == 'other'
        })

    # Calculate statistics
    stats = {
        'total': len(asset_data),
        'suspect_count': sum(1 for a in asset_data if a['is_suspect']),
        'investigator_count': sum(1 for a in asset_data if a['is_investigator']),
        'other_count': sum(1 for a in asset_data if a['is_other'])
    }

    # Organize into sections
    sections = []

    # Suspect cards section
    suspect_assets = [a for a in asset_data if a['is_suspect']]
    if suspect_assets:
        sections.append({
            'title': 'Suspect Cards',
            'count': len(suspect_assets),
            'assets': suspect_assets
        })

    # Investigator cards section
    investigator_assets = [a for a in asset_data if a['is_investigator']]
    if investigator_assets:
        sections.append({
            'title': 'Investigator Cards',
            'count': len(investigator_assets),
            'assets': investigator_assets
        })

    # Other assets section
    other_assets = [a for a in asset_data if a['is_other']]
    if other_assets:
        sections.append({
            'title': 'Other Assets',
            'count': len(other_assets),
            'assets': other_assets
        })

    # Render template
    template = Template(HTML_TEMPLATE)
    html_content = template.render(
        generation_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        output_dir=str(output_dir),
        stats=stats,
        sections=sections
    )

    # Write report
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(html_content)
