# TypeScript Integration Guide

**Generated**: 2026-02-23 14:26:50

This document describes how to integrate the extracted card images into the TypeScript data structures.

## Overview

- **99 suspect cards** extracted
- **11 investigator modules** with question cards
- **30 background cards** extracted
- **18 penalty cards** extracted
- **1 forms** extracted

## Asset Locations

All assets have been copied to:
```
public/assets/cards/
├── suspect/          # 99 suspect card images
├── investigator/     # 77 investigator card images
├── backgrounds/      # 30 background card images
├── penalties/        # 18 penalty card images
└── forms/            # 1 form images
```

## Integration Steps

### 1. Update CatalyzerCard Interface

Add `cardImage` field to display full card visuals:

```typescript
// src/data/catalyzerCards.ts

export interface CatalyzerCard {
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
}
```

### 2. Update Packet Interface

Add `questionCardImages` to display investigator question cards:

```typescript
// src/types/packet.ts

export interface Question {
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  examples: string[];
  cardImage?: string;  // ADD THIS: Path to question card image
}

export interface Packet {
  id: string;
  name: string;
  difficulty: string;
  icon: string;
  prompt: string;
  questions: Question[];
  roles: PacketRole[];
  coverSheetImage?: string;  // ADD THIS: Path to cover sheet image
}
```

### 3. Catalyzer Card Mappings

Here are the card image paths for each module:


#### Suspect Cards by Module


**Module: `cooperation`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/04_cooperation_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/04_cooperation_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/04_cooperation_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `creative-problem-solving`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/02_problem_solving_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/02_problem_solving_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/02_problem_solving_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `grief-and-loss`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/07_grief_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/07_grief_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/07_grief_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `hopes-and-dreams`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/05_hopes_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/05_hopes_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/05_hopes_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `imagination`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/03_imagination_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/03_imagination_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/03_imagination_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `intentions`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/11_intentions_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/11_intentions_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/11_intentions_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `moral-failings`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/09_moral_failings_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/09_moral_failings_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/09_moral_failings_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `self-image`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/10_self_image_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/10_self_image_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/10_self_image_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `small-talk`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/01_small_talk_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `the-body`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/06_body_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/06_body_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/06_body_suspect_p3_c01_violent-card.png',  // Violent robot example
```

**Module: `threat-assessment`**

- Human cards: 3
- Patient robot cards: 3
- Violent robot cards: 3

```typescript
  cardImage: '/assets/cards/suspect/08_threat_suspect_p1_c01_human-card.png',  // Human card example
  cardImage: '/assets/cards/suspect/08_threat_suspect_p2_c01_patient-card.png',  // Patient robot example
  cardImage: '/assets/cards/suspect/08_threat_suspect_p3_c01_violent-card.png',  // Violent robot example
```

### 4. Investigator Card Mappings

Investigator question cards by module:


**Module: `cooperation`**

- Cover sheet: `/assets/cards/investigator/04_cooperation_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/04_cooperation_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/04_cooperation_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/04_cooperation_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `creative-problem-solving`**

- Cover sheet: `/assets/cards/investigator/02_problem_solving_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/02_problem_solving_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/02_problem_solving_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/02_problem_solving_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `grief-and-loss`**

- Cover sheet: `/assets/cards/investigator/07_grief_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/07_grief_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/07_grief_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/07_grief_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `hopes-and-dreams`**

- Cover sheet: `/assets/cards/investigator/05_hopes_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/05_hopes_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/05_hopes_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/05_hopes_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `imagination`**

- Cover sheet: `/assets/cards/investigator/03_imagination_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/03_imagination_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/03_imagination_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/03_imagination_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `intentions`**

- Cover sheet: `/assets/cards/investigator/11_intentions_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/11_intentions_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/11_intentions_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/11_intentions_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `moral-failings`**

- Cover sheet: `/assets/cards/investigator/09_moral_failings_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/09_moral_failings_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/09_moral_failings_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/09_moral_failings_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `self-image`**

- Cover sheet: `/assets/cards/investigator/10_self_image_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/10_self_image_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/10_self_image_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/10_self_image_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `small-talk`**

- Cover sheet: `/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/01_small_talk_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `the-body`**

- Cover sheet: `/assets/cards/investigator/06_body_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/06_body_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/06_body_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/06_body_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

**Module: `threat-assessment`**

- Cover sheet: `/assets/cards/investigator/08_threat_investigator_p1_c01_cover-sheet.png`
- Primary prompts: 3 cards
- Secondary prompts: 3 cards

```typescript
  coverSheetImage: '/assets/cards/investigator/08_threat_investigator_p1_c01_cover-sheet.png',
  questions: [
    { type: 'primary', cardImage: '/assets/cards/investigator/08_threat_investigator_p2_c01_primary-prompts.png' },
    { type: 'primary', cardImage: '/assets/cards/investigator/08_threat_investigator_p2_c02_primary-prompts.png' },
    // ... more questions
  ],
```

### 5. Backgrounds and Penalties

- **30 background cards** available in `/assets/cards/backgrounds/`
- **18 penalty cards** available in `/assets/cards/penalties/`

These can be added to the existing data structures if visual display is desired.

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
