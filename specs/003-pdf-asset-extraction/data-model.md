# Data Model: PDF Asset Extraction

**Feature**: Automated PDF Asset Extraction
**Created**: 2026-02-22
**Source**: [spec.md](./spec.md) - Key Entities section

---

## Core Entities

### PDFDocument

Represents a downloaded PDF file from robots.management.

**Attributes**:
- `filename` (string): Unique identifier within collection (e.g., "01_small_talk_suspect.pdf")
- `file_path` (string): Absolute path on disk (e.g., "/path/to/extraction/data/pdfs/01_small_talk_suspect.pdf")
- `content_type` (enum): Classification of PDF content
  - Values: `module_suspect`, `module_investigator`, `penalties`, `backgrounds`, `print_play`
- `page_count` (integer): Total number of pages in PDF
- `file_size` (integer): File size in bytes
- `download_timestamp` (datetime): When PDF was downloaded

**Relationships**:
- Has many `Label` (one PDF can have multiple labeled regions)
- Has many `ExtractedAsset` (one PDF yields multiple extracted assets)

**Validation Rules**:
- `filename` must be non-empty
- `file_path` must exist on filesystem
- `content_type` must be one of the enum values
- `page_count` must be > 0
- `file_size` must be > 0
- `download_timestamp` cannot be in the future

**State Transitions**:
- Not applicable (immutable once downloaded)

**Storage Format** (catalog.json):
```json
{
  "pdfs": [
    {
      "filename": "01_small_talk_suspect.pdf",
      "file_path": "/absolute/path/to/extraction/data/pdfs/01_small_talk_suspect.pdf",
      "content_type": "module_suspect",
      "page_count": 24,
      "file_size": 4523890,
      "download_timestamp": "2026-02-22T14:30:00Z"
    }
  ]
}
```

---

### Label

Represents a manual bounding box annotation created during the labeling phase.

**Attributes**:
- `id` (string): Unique identifier (UUID format)
- `pdf_filename` (string): Reference to source PDFDocument
- `page_number` (integer): Which page in the PDF (0-indexed)
- `bbox` (object): Bounding box coordinates in PDF coordinate system
  - `x` (float): Left edge X coordinate
  - `y` (float): Top edge Y coordinate
  - `width` (float): Box width
  - `height` (float): Box height
- `content_type` (enum): Type of content in this region
  - Values: `maze`, `restriction`, `task`, `icon`, `background`, `penalty`
- `created_timestamp` (datetime): When label was created
- `validation_status` (enum): Result of pattern validation
  - Values: `valid`, `invalid`, `uncertain`
- `metadata` (object, optional): Additional annotation metadata
  - `notes` (string): Developer notes about this label
  - `confidence` (float): Developer's confidence in label (0.0-1.0)

**Relationships**:
- Belongs to one `PDFDocument` (via `pdf_filename` foreign key)
- Used by pattern matcher to find similar `ExtractedAsset` instances

**Validation Rules**:
- `id` must be unique
- `pdf_filename` must reference an existing PDFDocument
- `page_number` must be >= 0 and < PDF's `page_count`
- `bbox` coordinates must be within page boundaries:
  - `x` >= 0
  - `y` >= 0
  - `width` > 0
  - `height` > 0
  - `x + width` <= page width
  - `y + height` <= page height
- `content_type` must be one of the enum values
- `validation_status` must be one of the enum values

**State Transitions**:
```
[Created] → validation_status: uncertain
  ↓
[Validated] → validation_status: valid | invalid
  ↓
[Used for extraction] (read-only, no state change)
```

**Storage Format** (labels/labels.json):
```json
{
  "labels": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "pdf_filename": "01_small_talk_suspect.pdf",
      "page_number": 5,
      "bbox": {
        "x": 120.5,
        "y": 300.0,
        "width": 250.0,
        "height": 250.0
      },
      "content_type": "maze",
      "created_timestamp": "2026-02-22T15:00:00Z",
      "validation_status": "valid",
      "metadata": {
        "notes": "First inducer maze example",
        "confidence": 1.0
      }
    }
  ]
}
```

---

### ExtractedAsset

Represents the output of automated extraction (image or text).

**Attributes**:
- `id` (string): Unique identifier (UUID format)
- `asset_type` (enum): Type of extracted asset
  - Values: `maze_image`, `restriction_text`, `task_text`, `icon_image`, `background_text`, `penalty_text`
- `source_pdf` (string): Source PDFDocument filename
- `source_page` (integer): Source page number (0-indexed)
- `source_bbox` (object): Source bounding box coordinates (same structure as Label.bbox)
- `extraction_method` (enum): How asset was extracted
  - Values: `template_match`, `position_pattern`, `text_extraction`, `ocr`
- `confidence_score` (float): Pattern match quality (0.0-1.0)
- `file_path` (string, optional): For image assets (e.g., "/path/to/output/mazes/smalltalk-001.png")
- `text_content` (string, optional): For text assets (restriction/task/background/penalty text)
- `extraction_timestamp` (datetime): When asset was extracted
- `metadata` (object): Extraction metadata
  - `template_used` (string, optional): Label ID used as template for matching
  - `match_score` (float, optional): Template match score
  - `ocr_confidence` (float, optional): OCR confidence if OCR was used

**Relationships**:
- Belongs to one `PDFDocument` (via `source_pdf` foreign key)
- May be mapped to one `CatalyzerCardMapping` (for integration)
- Derived from one or more `Label` instances (via pattern matching)

**Validation Rules**:
- `id` must be unique
- `source_pdf` must reference an existing PDFDocument
- `source_page` must be >= 0 and < PDF's `page_count`
- `source_bbox` must be within page boundaries
- `asset_type` must be one of the enum values
- `extraction_method` must be one of the enum values
- `confidence_score` must be between 0.0 and 1.0
- `file_path` XOR `text_content` must be present (not both, not neither):
  - Image asset types (`maze_image`, `icon_image`) → require `file_path`
  - Text asset types (`restriction_text`, `task_text`, `background_text`, `penalty_text`) → require `text_content`
- If `file_path` present, file must exist on filesystem

**State Transitions**:
```
[Extracted] → confidence_score determined
  ↓
[Validated] → included in validation report
  ↓
[Approved] → ready for integration
  ↓
[Integrated] → asset copied/data imported into game
```

**Storage Format** (output/metadata/extraction_metadata.json):
```json
{
  "extracted_assets": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "asset_type": "maze_image",
      "source_pdf": "01_small_talk_suspect.pdf",
      "source_page": 5,
      "source_bbox": {
        "x": 120.5,
        "y": 300.0,
        "width": 250.0,
        "height": 250.0
      },
      "extraction_method": "template_match",
      "confidence_score": 0.98,
      "file_path": "/path/to/output/mazes/smalltalk-001.png",
      "extraction_timestamp": "2026-02-22T16:00:00Z",
      "metadata": {
        "template_used": "550e8400-e29b-41d4-a716-446655440000",
        "match_score": 0.98
      }
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "asset_type": "restriction_text",
      "source_pdf": "01_small_talk_suspect.pdf",
      "source_page": 5,
      "source_bbox": {
        "x": 50.0,
        "y": 600.0,
        "width": 400.0,
        "height": 150.0
      },
      "extraction_method": "text_extraction",
      "confidence_score": 1.0,
      "text_content": "Cannot reference specific events from more than 24 hours ago",
      "extraction_timestamp": "2026-02-22T16:00:05Z",
      "metadata": {}
    }
  ]
}
```

---

### CatalyzerCardMapping

Represents the integration metadata linking extracted assets to game data structures.

**Attributes**:
- `card_id` (string): Matches catalyzerCards.ts ID (e.g., "smalltalk-ltm-01")
- `inducer_maze_asset_id` (string, optional): Reference to ExtractedAsset (maze_image)
- `restriction_asset_ids` (array of strings, optional): References to ExtractedAsset (restriction_text)
- `task_asset_ids` (array of strings, optional): References to ExtractedAsset (task_text, for violent robots)
- `integration_status` (enum): Integration state
  - Values: `pending`, `integrated`, `failed`
- `integration_timestamp` (datetime, optional): When integration completed
- `error_message` (string, optional): If integration_status is `failed`

**Relationships**:
- Has one `ExtractedAsset` for inducer_maze (via `inducer_maze_asset_id`)
- Has many `ExtractedAsset` for restrictions (via `restriction_asset_ids`)
- Has many `ExtractedAsset` for tasks (via `task_asset_ids`)
- Corresponds to one entry in `src/data/catalyzerCards.ts` (via `card_id`)

**Validation Rules**:
- `card_id` must match pattern: `{module}-{fault}-{number}` (e.g., "smalltalk-ltm-01")
- `inducer_maze_asset_id` must reference an existing ExtractedAsset with `asset_type: maze_image`
- `restriction_asset_ids` must reference existing ExtractedAssets with `asset_type: restriction_text`
- `task_asset_ids` must reference existing ExtractedAssets with `asset_type: task_text`
- `integration_status` must be one of the enum values
- If `integration_status` is `failed`, `error_message` must be present
- If `integration_status` is `integrated`, `integration_timestamp` must be present

**State Transitions**:
```
[Created] → integration_status: pending
  ↓
[Integration attempted]
  ↓
  ├─ [Success] → integration_status: integrated, integration_timestamp set
  └─ [Failure] → integration_status: failed, error_message set
```

**Storage Format** (output/metadata/integration_mapping.json):
```json
{
  "mappings": [
    {
      "card_id": "smalltalk-ltm-01",
      "inducer_maze_asset_id": "660e8400-e29b-41d4-a716-446655440001",
      "restriction_asset_ids": [
        "770e8400-e29b-41d4-a716-446655440002",
        "880e8400-e29b-41d4-a716-446655440003"
      ],
      "task_asset_ids": [],
      "integration_status": "integrated",
      "integration_timestamp": "2026-02-22T17:00:00Z"
    }
  ]
}
```

---

## Entity Relationship Diagram

```text
PDFDocument (1) ───< (N) Label
     │
     └─────< (N) ExtractedAsset (N) >───── (1) CatalyzerCardMapping
                                                        │
                                                        └──> src/data/catalyzerCards.ts
```

**Cardinality**:
- One PDFDocument has many Labels (1:N)
- One PDFDocument yields many ExtractedAssets (1:N)
- Many ExtractedAssets map to one CatalyzerCardMapping (N:1)
- One CatalyzerCardMapping updates one catalyzer card in TypeScript (1:1)

---

## Data Flow

```text
1. DOWNLOAD:
   robots.management → PDFDocument (stored in data/pdfs/)

2. LABELING:
   PDFDocument → [Manual annotation] → Label (stored in data/labels/)

3. EXTRACTION:
   PDFDocument + Label → [Pattern matching] → ExtractedAsset (stored in output/)

4. VALIDATION:
   ExtractedAsset → [Comparison] → ValidationReport (HTML)

5. INTEGRATION:
   ExtractedAsset → CatalyzerCardMapping → catalyzerCards.ts (updated)
                                        → public/assets/mazes/ (populated)
```

---

## Storage Structure

```text
extraction/data/
├── pdfs/                         # PDFDocument storage
│   ├── 01_small_talk_suspect.pdf
│   ├── 01_small_talk_investigator.pdf
│   └── catalog.json              # PDFDocument metadata
├── labels/                       # Label storage
│   └── labels.json               # All manual labels
└── output/                       # ExtractedAsset storage
    ├── mazes/                    # Image assets
    │   ├── smalltalk-001.png
    │   └── smalltalk-002.png
    ├── text/                     # Text assets (optional intermediate)
    │   └── restrictions.json
    └── metadata/                 # Metadata storage
        ├── extraction_metadata.json    # ExtractedAsset records
        └── integration_mapping.json    # CatalyzerCardMapping records
```

---

## Type Definitions (TypeScript Equivalent)

For reference when implementing TypeScript integration:

```typescript
// These types represent the data model in Python
// They should match the JSON schemas

interface PDFDocument {
  filename: string;
  file_path: string;
  content_type: 'module_suspect' | 'module_investigator' | 'penalties' | 'backgrounds' | 'print_play';
  page_count: number;
  file_size: number;
  download_timestamp: string; // ISO 8601 datetime
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Label {
  id: string; // UUID
  pdf_filename: string;
  page_number: number;
  bbox: BoundingBox;
  content_type: 'maze' | 'restriction' | 'task' | 'icon' | 'background' | 'penalty';
  created_timestamp: string; // ISO 8601
  validation_status: 'valid' | 'invalid' | 'uncertain';
  metadata?: {
    notes?: string;
    confidence?: number;
  };
}

interface ExtractedAsset {
  id: string; // UUID
  asset_type: 'maze_image' | 'restriction_text' | 'task_text' | 'icon_image' | 'background_text' | 'penalty_text';
  source_pdf: string;
  source_page: number;
  source_bbox: BoundingBox;
  extraction_method: 'template_match' | 'position_pattern' | 'text_extraction' | 'ocr';
  confidence_score: number; // 0.0-1.0
  file_path?: string; // For image assets
  text_content?: string; // For text assets
  extraction_timestamp: string; // ISO 8601
  metadata: {
    template_used?: string;
    match_score?: number;
    ocr_confidence?: number;
  };
}

interface CatalyzerCardMapping {
  card_id: string; // e.g., "smalltalk-ltm-01"
  inducer_maze_asset_id?: string;
  restriction_asset_ids?: string[];
  task_asset_ids?: string[];
  integration_status: 'pending' | 'integrated' | 'failed';
  integration_timestamp?: string; // ISO 8601
  error_message?: string;
}
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | Claude Sonnet 4.5 | Initial data model created |
