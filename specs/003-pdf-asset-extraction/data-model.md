# Data Model: PDF Asset Integration

**Feature**: 003-pdf-asset-extraction | **Date**: 2026-02-23
**Phase**: Integration (US5) | **Context**: [plan.md](plan.md)

---

## Overview

This document defines the data model changes required to integrate 225 extracted PDF card images into the TypeScript game data structures. The integration adds optional `cardImage` fields to existing entities while preserving all existing data and type safety.

**Integration Scope**:
- 99 suspect catalyzer cards → `CatalyzerCard.cardImage`
- 77 investigator cards → `Question.cardImage`, `Packet.coverSheetImage`
- 30 backgrounds → `Background.image` (optional)
- 18 penalties → `Penalty.image` (optional)
- 1 investigator form → standalone reference

**Design Principle**: All image fields are **optional** to maintain backward compatibility and allow gradual integration. Existing game logic must work whether images are present or not.

---

## Entity Definitions

### 1. CatalyzerCard (Updated)

**Purpose**: Represents a Robot Catalyzer card shown to the Suspect player during role reveal

**Location**: `src/types/catalyzer.ts`, data in `src/data/catalyzerCards.ts`

**Fields**:

| Field | Type | Required | Description | Integration Change |
|-------|------|----------|-------------|-------------------|
| `id` | `string` | Yes | Unique identifier (e.g., 'small-talk-human-01') | No change |
| `packetId` | `string` | Yes | Reference to parent packet/module | No change |
| `roleType` | `RoleType` | Yes | 'human' \| 'patient-robot' \| 'violent-robot' | No change |
| `fault` | `RobotFault` | No | Robot malfunction type (patient/violent only) | No change |
| `description` | `string` | Yes | Human-readable role description | No change |
| `traits` | `string[]` | No | Character traits for role-playing | No change |
| `restrictions` | `string[]` | No | Behavioral restrictions (patient robots) | No change |
| `tasks` | `string[]` | No | Secret tasks (violent robots) | No change |
| `inducerMazeImage` | `string` | Yes | Path to inducer maze image | No change |
| `inducerSolution` | `string` | No | Solution path for maze | No change |
| **`cardImage`** | **`string`** | **No** | **Path to full card image PNG** | **NEW FIELD** |

**Integration Details**:
- `cardImage` field added as optional (`?`)
- Points to full card image in `public/assets/cards/suspect/` directory
- Example value: `"/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png"`
- When present, UI should display this image instead of building custom card widgets

**Validation Rules**:
- `cardImage` path must start with `/assets/cards/suspect/`
- File must exist in `public/assets/cards/suspect/` directory
- Image must be PNG format
- If `cardImage` is undefined, UI falls back to custom widget rendering

**State Transitions**:
None - this is static reference data

---

### 2. Question (Updated)

**Purpose**: Represents an investigator question card shown during the interview phase

**Location**: `src/types/packet.ts`, data in `src/data/packets.ts`

**Fields**:

| Field | Type | Required | Description | Integration Change |
|-------|------|----------|-------------|-------------------|
| `id` | `string` | Yes | Unique identifier | No change |
| `type` | `'primary' \| 'secondary'` | Yes | Question category | No change |
| `text` | `string` | Yes | Question text content | No change |
| `examples` | `string[]` | Yes | Example follow-up questions | No change |
| **`cardImage`** | **`string`** | **No** | **Path to question card image PNG** | **NEW FIELD** |

**Integration Details**:
- `cardImage` field added as optional (`?`)
- Points to question card image in `public/assets/cards/investigator/` directory
- Primary prompts: `"/assets/cards/investigator/{module}_investigator_p2_c{num}_primary-prompts.png"`
- Secondary prompts: `"/assets/cards/investigator/{module}_investigator_p3_c{num}_secondary-prompts.png"`
- When present, UI displays card image instead of rendering text+examples as custom widgets

**Validation Rules**:
- `cardImage` path must start with `/assets/cards/investigator/`
- File must exist in `public/assets/cards/investigator/` directory
- Image must be PNG format
- `type` must match content type in filename (`primary-prompts` or `secondary-prompts`)

**State Transitions**:
None - this is static reference data

---

### 3. Packet (Updated)

**Purpose**: Represents a game module/packet containing questions and role configurations

**Location**: `src/types/packet.ts`, data in `src/data/packets.ts`

**Fields**:

| Field | Type | Required | Description | Integration Change |
|-------|------|----------|-------------|-------------------|
| `id` | `string` | Yes | Packet identifier (e.g., 'small-talk') | No change |
| `name` | `string` | Yes | Display name | No change |
| `difficulty` | `string` | Yes | Difficulty rating | No change |
| `icon` | `string` | Yes | Icon identifier | No change |
| `prompt` | `string` | Yes | Packet introduction text | No change |
| `questions` | `Question[]` | Yes | Array of investigator questions | No change (but Question type updated) |
| `roles` | `PacketRole[]` | Yes | Available role configurations | No change |
| **`coverSheetImage`** | **`string`** | **No** | **Path to cover sheet image PNG** | **NEW FIELD** |

**Integration Details**:
- `coverSheetImage` field added as optional (`?`)
- Points to investigator cover sheet in `public/assets/cards/investigator/` directory
- Example: `"/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png"`
- Cover sheet displays packet overview before interview begins

**Validation Rules**:
- `coverSheetImage` path must start with `/assets/cards/investigator/`
- File must exist in `public/assets/cards/investigator/` directory
- Image must be PNG format
- Each packet should have exactly one cover sheet

**State Transitions**:
None - this is static reference data

---

### 4. Background (Optional Update)

**Purpose**: Represents a background character description for the Suspect player

**Location**: `src/types/background.ts`, data in `src/data/backgrounds.ts`

**Fields**:

| Field | Type | Required | Description | Integration Change |
|-------|------|----------|-------------|-------------------|
| `id` | `string` | Yes | Background identifier | No change |
| `name` | `string` | Yes | Background character name | No change |
| `description` | `string` | Yes | Background story text | No change |
| **`image`** | **`string`** | **No** | **Path to background card image PNG** | **NEW FIELD (optional)** |

**Integration Details**:
- `image` field added as optional (`?`)
- Points to background card in `public/assets/cards/backgrounds/` directory
- Example: `"/assets/cards/backgrounds/backgrounds_p1_c01_background.png"`
- Integration is **optional** - backgrounds work fine with text-only display

**Validation Rules**:
- `image` path must start with `/assets/cards/backgrounds/` (if present)
- File must exist in `public/assets/cards/backgrounds/` directory (if present)

---

### 5. Penalty (Optional Update)

**Purpose**: Represents a penalty card action for rule violations

**Location**: `src/types/penalty.ts`, data in `src/data/penalties.ts`

**Fields**:

| Field | Type | Required | Description | Integration Change |
|-------|------|----------|-------------|-------------------|
| `id` | `string` | Yes | Penalty identifier | No change |
| `name` | `string` | Yes | Penalty name | No change |
| `description` | `string` | Yes | Penalty effect description | No change |
| `examples` | `string[]` | No | Example triggering scenarios | No change |
| **`image`** | **`string`** | **No** | **Path to penalty card image PNG** | **NEW FIELD (optional)** |

**Integration Details**:
- `image` field added as optional (`?`)
- Points to penalty card in `public/assets/cards/penalties/` directory
- Example: `"/assets/cards/penalties/penalties_p1_c01_penalty.png"`
- Integration is **optional** - penalties work fine with text-only display

**Validation Rules**:
- `image` path must start with `/assets/cards/penalties/` (if present)
- File must exist in `public/assets/cards/penalties/` directory (if present)

---

## Relationships

### Asset-to-Entity Mapping

```
public/assets/cards/suspect/
├── {module}_suspect_p1_c{num}_human-card.png      → CatalyzerCard (roleType: 'human')
├── {module}_suspect_p2_c{num}_patient-card.png    → CatalyzerCard (roleType: 'patient-robot')
└── {module}_suspect_p3_c{num}_violent-card.png    → CatalyzerCard (roleType: 'violent-robot')

public/assets/cards/investigator/
├── {module}_investigator_p1_c{num}_cover-sheet.png       → Packet.coverSheetImage
├── {module}_investigator_p2_c{num}_primary-prompts.png   → Question (type: 'primary')
└── {module}_investigator_p3_c{num}_secondary-prompts.png → Question (type: 'secondary')

public/assets/cards/backgrounds/
└── backgrounds_p{page}_c{num}_background.png → Background.image (optional)

public/assets/cards/penalties/
└── penalties_p{page}_c{num}_penalty.png → Penalty.image (optional)
```

### Entity Dependencies

- **CatalyzerCard** → references **Packet** via `packetId`
- **Packet** → contains **Question[]** via `questions` field
- **Question** → independent (no outbound references)
- **Background** → independent (selected randomly)
- **Penalty** → independent (triggered by game events)

---

## Integration Data Flow

### 1. Asset Path Generation

**Input**: Entity ID, role type, module ID
**Output**: Absolute asset path string

Example utility function signature:
```typescript
function getCardImagePath(
  entityType: 'suspect' | 'investigator' | 'background' | 'penalty',
  module: string,
  cardNumber: number,
  contentType: string
): string
```

### 2. UI Component Rendering

**Input**: Entity object with optional `cardImage` field
**Output**: Rendered card (either image or fallback widget)

Decision flow:
1. Check if `cardImage` field exists and is non-empty
2. If yes → render `<img src={cardImage} alt={description} />`
3. If no → render custom widget with text fields (existing behavior)

### 3. Data Loading

**Timing**: Static data loaded at app initialization (no lazy loading for data)
**Image Loading**: Lazy-load images only when needed (React lazy loading)

---

## Validation Constraints

### Cross-Entity Validation

1. **Packet-to-CatalyzerCard Consistency**:
   - Every `packetId` in `CatalyzerCard` must reference an existing `Packet.id`
   - Each packet should have 3 catalyzer cards (1 human, 1 patient, 1 violent)

2. **Packet-to-Question Consistency**:
   - Every `Question` in a `Packet.questions` array must have matching module in filename
   - Each packet should have balanced primary/secondary question distribution

3. **File System Validation**:
   - All `cardImage` paths must point to existing files in `public/assets/cards/`
   - No broken image references (404 errors)

### Data Integrity Rules

1. **Immutability**: All extracted assets are read-only after integration
2. **Uniqueness**: Each `cardImage` path should be unique (no duplicate references)
3. **Completeness**: If any card in a module has `cardImage`, all cards should have it
4. **Type Safety**: TypeScript compiler enforces all interface contracts

---

## Migration Strategy

### Backward Compatibility

**Existing data without `cardImage` fields continues to work**:
- UI components check for presence of `cardImage` before rendering
- Fallback to existing custom widget rendering if field is undefined
- No breaking changes to game logic

### Gradual Integration Phases

1. **Phase 1**: Add optional fields to TypeScript interfaces (non-breaking)
2. **Phase 2**: Populate `cardImage` fields for suspect cards only (validate UI works)
3. **Phase 3**: Populate `cardImage` fields for investigator cards (validate UI works)
4. **Phase 4**: (Optional) Populate `image` fields for backgrounds/penalties

### Rollback Plan

If integration causes issues:
1. Remove `cardImage` values from data files (set to `undefined`)
2. UI automatically falls back to custom widgets
3. No code changes needed - optional fields handle this gracefully

---

## Performance Considerations

### Bundle Size Impact

- **Data files**: ~5-10 KB increase (JSON with image path strings)
- **Images**: ~50MB total (lazy-loaded, not in initial bundle)
- **Target**: Bundle size < 500KB gzipped (constitution requirement)
- **Strategy**: Images loaded on-demand, not bundled with JavaScript

### Lazy Loading Strategy

```typescript
// Images loaded only when card is displayed
<img
  src={card.cardImage}
  loading="lazy"  // Native browser lazy loading
  alt={card.description}
/>
```

### Caching

- Browser caches images after first load
- Service worker can pre-cache critical assets (cover sheets, first module cards)
- Offline-capable after initial load (constitution requirement)

---

## Testing Requirements

### Unit Tests

1. **Asset path generation utilities**:
   - Test `getCardImagePath()` generates correct paths
   - Test path validation (file exists check)

2. **Data validation**:
   - Test all `cardImage` paths are valid
   - Test all referenced files exist

### Integration Tests

1. **UI component rendering**:
   - Test card displays image when `cardImage` is present
   - Test card displays fallback widget when `cardImage` is undefined
   - Test image loading errors handled gracefully

2. **Game flow**:
   - Test role reveal shows catalyzer card image
   - Test interview phase shows question card images
   - Test packet selection shows cover sheets

### Visual Regression Tests (Optional)

- Capture screenshots of card displays before/after integration
- Compare to ensure visual fidelity maintained

---

## References

- **Asset Mapping**: [extraction/typescript_integration_guide.md](../../extraction/typescript_integration_guide.md)
- **Validation Report**: [extraction/reports/validation_report.html](../../extraction/reports/validation_report.html)
- **Existing Type Definitions**: Check `src/types/` for current interfaces
- **Existing Data Files**: Check `src/data/` for current data structures
