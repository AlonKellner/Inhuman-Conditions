# Quickstart Guide: PDF Asset Integration

**Feature**: 003-pdf-asset-extraction | **Date**: 2026-02-23
**Phase**: Integration (US5) | **Audience**: Developers

---

## Overview

This guide shows you how to integrate the 225 extracted PDF card images into the TypeScript game codebase. By the end of this guide, the game will display official card images instead of custom UI widgets.

**What You'll Do**:
1. Update TypeScript interfaces with new `cardImage` fields
2. Add card image paths to data files
3. Create React components to display card images
4. Update existing UI to use card images
5. Write tests to validate integration

**Prerequisites**:
- All 225 assets extracted and copied to `public/assets/cards/`
- TypeScript 5.x with strict mode
- React 18.x
- Familiarity with the existing codebase

**Time Estimate**: 2-4 hours for full integration

---

## Step 1: Update TypeScript Interfaces

### 1.1 Update CatalyzerCard Interface

**File**: `src/types/catalyzer.ts`

Add the optional `cardImage` field to the `CatalyzerCard` interface:

```typescript
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
  cardImage?: string;  // ← NEW: Add this line
}
```

### 1.2 Update Question and Packet Interfaces

**File**: `src/types/packet.ts`

Add optional `cardImage` field to `Question` and `coverSheetImage` to `Packet`:

```typescript
export interface Question {
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  examples: string[];
  cardImage?: string;  // ← NEW: Add this line
}

export interface Packet {
  id: string;
  name: string;
  difficulty: string;
  icon: string;
  prompt: string;
  questions: Question[];
  roles: PacketRole[];
  coverSheetImage?: string;  // ← NEW: Add this line
}
```

**Verify TypeScript Compilation**:

```bash
npm run typecheck
# Should compile with 0 errors
```

---

## Step 2: Create Card Image Path Utilities

### 2.1 Create Utility File

**File**: `src/utils/cardImagePaths.ts`

Copy the utility functions from [contracts/card-images.ts](contracts/card-images.ts):

```typescript
// Copy module mappings
export const MODULE_MAPPING = {
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
};

// Copy utility functions
export function getSuspectCardImagePath(
  module: string,
  page: number,
  cardNumber: number,
  contentType: 'human-card' | 'patient-card' | 'violent-card'
): string {
  const paddedCard = cardNumber.toString().padStart(2, '0');
  return `/assets/cards/suspect/${module}_suspect_p${page}_c${paddedCard}_${contentType}.png`;
}

export function getInvestigatorCardImagePath(
  module: string,
  page: number,
  cardNumber: number,
  contentType: 'cover-sheet' | 'primary-prompts' | 'secondary-prompts'
): string {
  const paddedCard = cardNumber.toString().padStart(2, '0');
  return `/assets/cards/investigator/${module}_investigator_p${page}_c${paddedCard}_${contentType}.png`;
}

// ... copy other utility functions as needed
```

### 2.2 Write Unit Tests

**File**: `tests/unit/utils/cardImagePaths.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  getSuspectCardImagePath,
  getInvestigatorCardImagePath,
  validateCardImagePath,
} from '@/utils/cardImagePaths';

describe('cardImagePaths utilities', () => {
  describe('getSuspectCardImagePath', () => {
    it('generates correct path for human card', () => {
      const path = getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card');
      expect(path).toBe('/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png');
    });

    it('generates correct path for patient card', () => {
      const path = getSuspectCardImagePath('03_imagination', 2, 2, 'patient-card');
      expect(path).toBe('/assets/cards/suspect/03_imagination_suspect_p2_c02_patient-card.png');
    });

    it('pads card numbers with leading zero', () => {
      const path = getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card');
      expect(path).toContain('_c01_');
    });
  });

  describe('validateCardImagePath', () => {
    it('validates correct suspect card path', () => {
      const path = '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png';
      expect(validateCardImagePath(path, 'suspect')).toBe(true);
    });

    it('rejects invalid suspect card path', () => {
      const path = '/wrong/path/to/card.png';
      expect(validateCardImagePath(path, 'suspect')).toBe(false);
    });
  });
});
```

**Run Tests**:

```bash
npm test -- cardImagePaths.test.ts
# All tests should pass
```

---

## Step 3: Update Data Files with Card Image Paths

### 3.1 Update Catalyzer Cards

**File**: `src/data/catalyzerCards.ts`

Refer to the integration guide for exact asset paths:
**Reference**: `extraction/typescript_integration_guide.md`

Example integration:

```typescript
import { getSuspectCardImagePath } from '@/utils/cardImagePaths';

export const catalyzerCards: CatalyzerCard[] = [
  {
    id: 'small-talk-human-01',
    packetId: 'small-talk',
    roleType: 'human',
    description: 'Human player',
    traits: ['curious', 'talkative'],
    inducerMazeImage: '/assets/mazes/small-talk-human-01-maze.png',
    cardImage: getSuspectCardImagePath('01_small_talk', 1, 1, 'human-card'),
    // cardImage value: '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png'
  },
  {
    id: 'small-talk-ltm-01',
    packetId: 'small-talk',
    roleType: 'patient-robot',
    fault: 'ltm',
    description: 'Patient robot with long-term memory fault',
    restrictions: [
      'Cannot reference specific events from more than 24 hours ago',
      'Cannot remember names of specific people',
    ],
    inducerMazeImage: '/assets/mazes/small-talk-ltm-01-maze.png',
    cardImage: getSuspectCardImagePath('01_small_talk', 2, 1, 'patient-card'),
    // cardImage value: '/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png'
  },
  {
    id: 'small-talk-empathy-01',
    packetId: 'small-talk',
    roleType: 'violent-robot',
    fault: 'empathy',
    description: 'Violent robot with empathy fault',
    tasks: [
      'Touch your face exactly 3 times during the interview',
      'Steer conversation toward topic of emotions',
    ],
    inducerMazeImage: '/assets/mazes/small-talk-empathy-01-maze.png',
    cardImage: getSuspectCardImagePath('01_small_talk', 3, 1, 'violent-card'),
    // cardImage value: '/assets/cards/suspect/01_small_talk_suspect_p3_c01_violent-card.png'
  },
  // ... continue for all 99 catalyzer cards
];
```

### 3.2 Update Packets with Investigator Card Images

**File**: `src/data/packets.ts`

Example integration:

```typescript
import { getInvestigatorCardImagePath } from '@/utils/cardImagePaths';

export const packets: Packet[] = [
  {
    id: 'small-talk',
    name: 'Small Talk',
    difficulty: 'Beginner',
    icon: 'chat',
    prompt: 'Ask casual questions to assess conversational ability',
    coverSheetImage: getInvestigatorCardImagePath('01_small_talk', 1, 1, 'cover-sheet'),
    // coverSheetImage value: '/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png'
    questions: [
      {
        id: 'small-talk-primary-01',
        type: 'primary',
        text: 'What did you do yesterday?',
        examples: ['Can you be more specific?', 'What time was that?'],
        cardImage: getInvestigatorCardImagePath('01_small_talk', 2, 1, 'primary-prompts'),
        // cardImage value: '/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png'
      },
      {
        id: 'small-talk-secondary-01',
        type: 'secondary',
        text: 'How did that make you feel?',
        examples: ['Can you describe the feeling?'],
        cardImage: getInvestigatorCardImagePath('01_small_talk', 3, 1, 'secondary-prompts'),
        // cardImage value: '/assets/cards/investigator/01_small_talk_investigator_p3_c01_secondary-prompts.png'
      },
      // ... continue for all questions
    ],
    roles: [
      // ... existing role configuration
    ],
  },
  // ... continue for all 11 packets
];
```

**Verify Data Updates**:

```bash
npm run typecheck
# Should compile with 0 errors - cardImage fields are optional
```

---

## Step 4: Create Card Display Components

### 4.1 Create CatalyzerCardImage Component

**File**: `src/components/cards/CatalyzerCardImage.tsx`

```typescript
import React from 'react';
import { CatalyzerCard } from '@/types/catalyzer';

interface CatalyzerCardImageProps {
  card: CatalyzerCard;
  className?: string;
}

/**
 * Displays catalyzer card image or falls back to custom widget
 */
export function CatalyzerCardImage({ card, className = '' }: CatalyzerCardImageProps) {
  // If cardImage is present, display the full card PNG
  if (card.cardImage) {
    return (
      <img
        src={card.cardImage}
        alt={card.description}
        className={`catalyzer-card-image ${className}`}
        loading="lazy"
        onError={(e) => {
          console.error(`Failed to load card image: ${card.cardImage}`);
          // Optionally set fallback state to show custom widget
        }}
      />
    );
  }

  // Fallback to custom widget if cardImage not present
  return (
    <div className={`catalyzer-card-fallback ${className}`}>
      <h3>{card.description}</h3>
      {card.restrictions && (
        <div className="restrictions">
          <h4>Restrictions:</h4>
          <ul>
            {card.restrictions.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {card.tasks && (
        <div className="tasks">
          <h4>Tasks:</h4>
          <ul>
            {card.tasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 4.2 Create QuestionCardImage Component

**File**: `src/components/cards/QuestionCardImage.tsx`

```typescript
import React from 'react';
import { Question } from '@/types/packet';

interface QuestionCardImageProps {
  question: Question;
  className?: string;
}

/**
 * Displays question card image or falls back to text display
 */
export function QuestionCardImage({ question, className = '' }: QuestionCardImageProps) {
  // If cardImage is present, display the full question card PNG
  if (question.cardImage) {
    return (
      <img
        src={question.cardImage}
        alt={question.text}
        className={`question-card-image ${className}`}
        loading="lazy"
        onError={(e) => {
          console.error(`Failed to load question card image: ${question.cardImage}`);
        }}
      />
    );
  }

  // Fallback to text display if cardImage not present
  return (
    <div className={`question-card-fallback ${className}`}>
      <h4 className="question-text">{question.text}</h4>
      {question.examples.length > 0 && (
        <div className="question-examples">
          <p className="examples-label">Follow-up examples:</p>
          <ul>
            {question.examples.map((example, i) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 4.3 Write Component Tests

**File**: `tests/integration/components/CatalyzerCardImage.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CatalyzerCardImage } from '@/components/cards/CatalyzerCardImage';
import { CatalyzerCard } from '@/types/catalyzer';

describe('CatalyzerCardImage', () => {
  it('renders card image when cardImage is present', () => {
    const card: CatalyzerCard = {
      id: 'test-human-01',
      packetId: 'small-talk',
      roleType: 'human',
      description: 'Human player',
      inducerMazeImage: '/assets/mazes/test-maze.png',
      cardImage: '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png',
    };

    render(<CatalyzerCardImage card={card} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', card.cardImage);
    expect(img).toHaveAttribute('alt', card.description);
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders fallback widget when cardImage is undefined', () => {
    const card: CatalyzerCard = {
      id: 'test-ltm-01',
      packetId: 'small-talk',
      roleType: 'patient-robot',
      fault: 'ltm',
      description: 'Patient robot with long-term memory fault',
      restrictions: ['Cannot remember past events'],
      inducerMazeImage: '/assets/mazes/test-maze.png',
      // cardImage is undefined
    };

    render(<CatalyzerCardImage card={card} />);

    expect(screen.getByText('Patient robot with long-term memory fault')).toBeInTheDocument();
    expect(screen.getByText('Cannot remember past events')).toBeInTheDocument();
  });
});
```

**Run Component Tests**:

```bash
npm test -- CatalyzerCardImage.test.tsx
# All tests should pass
```

---

## Step 5: Update Game UI Components

### 5.1 Update Role Reveal Component

**File**: `src/components/game/RoleReveal.tsx`

Replace custom catalyzer card rendering with `CatalyzerCardImage`:

```typescript
import { CatalyzerCardImage } from '@/components/cards/CatalyzerCardImage';

export function RoleReveal({ card }: { card: CatalyzerCard }) {
  return (
    <div className="role-reveal">
      <h2>Your Role</h2>

      {/* Replace custom card rendering with component */}
      <CatalyzerCardImage card={card} className="role-reveal-card" />

      {/* Inducer maze display remains the same */}
      <div className="inducer-maze">
        <h3>Your Inducer Pattern</h3>
        <img
          src={card.inducerMazeImage}
          alt="Inducer maze pattern"
          className="maze-image"
        />
      </div>
    </div>
  );
}
```

### 5.2 Update Interview Phase Component

**File**: `src/components/game/InterviewPhase.tsx`

Replace custom question rendering with `QuestionCardImage`:

```typescript
import { QuestionCardImage } from '@/components/cards/QuestionCardImage';

export function InterviewPhase({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  return (
    <div className="interview-phase">
      <h2>Interview Question {currentIndex + 1}</h2>

      {/* Replace custom question rendering with component */}
      <QuestionCardImage
        question={currentQuestion}
        className="interview-question-card"
      />

      {/* Navigation buttons remain the same */}
      <div className="navigation">
        <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
          Previous
        </button>
        <button onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Step 6: Add Styling for Card Images

### 6.1 Create Card Image Styles

**File**: `src/styles/cards.css`

```css
/* Catalyzer card image styling */
.catalyzer-card-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Ensure card images are responsive on mobile */
@media (max-width: 768px) {
  .catalyzer-card-image {
    max-width: 90vw;
  }
}

/* Question card image styling */
.question-card-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 1rem 0;
}

/* Fallback widget styling (when cardImage is undefined) */
.catalyzer-card-fallback,
.question-card-fallback {
  padding: 1.5rem;
  background: var(--card-background);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.catalyzer-card-fallback h3,
.question-card-fallback h4 {
  margin-top: 0;
  color: var(--heading-color);
}

.catalyzer-card-fallback ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}
```

---

## Step 7: Validate Integration

### 7.1 TypeScript Compilation

```bash
npm run typecheck
# Expected output: 0 errors
```

### 7.2 Run All Tests

```bash
npm test
# All tests should pass
```

### 7.3 Manual Testing in Browser

```bash
npm run dev
# Open http://localhost:3000
```

**Test Checklist**:
- [ ] Role reveal shows catalyzer card image (not custom widget)
- [ ] Inducer maze still displays correctly
- [ ] Interview phase shows question card images
- [ ] Card images are responsive on mobile (test at different screen sizes)
- [ ] Fallback widgets work when `cardImage` is undefined (test by temporarily removing cardImage field)
- [ ] All 11 modules load correctly
- [ ] No console errors or 404s for missing images

### 7.4 Performance Check

```bash
npm run build
# Check bundle size
```

**Expected Results**:
- Bundle size < 500KB gzipped (constitution requirement)
- Card images lazy-loaded (not in initial bundle)
- Lighthouse score > 90

---

## Step 8: Accessibility Validation

### 8.1 Check Alt Text

All card images must have descriptive `alt` text:

```typescript
<img
  src={card.cardImage}
  alt={card.description}  // ← Uses card description for alt text
/>
```

### 8.2 Test with Screen Reader

- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA or JAWS
- Test that card descriptions are announced correctly

### 8.3 Keyboard Navigation

- Tab through cards (should focus on card elements)
- Enter/Space to interact with cards
- All functionality accessible without mouse

### 8.4 Contrast Check

Run WCAG AA contrast checker on card images:
- Text on cards must have 4.5:1 contrast ratio minimum
- Report any contrast issues in validation report

---

## Troubleshooting

### Issue: Card images return 404 (Not Found)

**Solution**:
1. Verify all assets exist in `public/assets/cards/` subdirectories
2. Check file naming matches utility function output
3. Run validation report to identify missing assets
4. Check that Vite is serving files from `public/` directory correctly

```bash
# List all extracted assets
ls -la public/assets/cards/suspect/
ls -la public/assets/cards/investigator/
```

### Issue: Card images display but are blurry

**Solution**:
1. Check original extraction resolution (should be 2x zoom, 144 DPI)
2. Verify PNG compression didn't reduce quality
3. Check CSS `max-width` isn't scaling images beyond native resolution

### Issue: Fallback widgets not showing when cardImage is undefined

**Solution**:
1. Verify conditional rendering logic in component
2. Check that fallback widget styles are loaded
3. Test with explicitly undefined `cardImage` field

### Issue: TypeScript errors after adding cardImage fields

**Solution**:
1. Verify fields are marked optional with `?`
2. Check that interfaces are exported correctly
3. Run `npm run typecheck` to see specific errors
4. Restart TypeScript language server in IDE

---

## Next Steps

After completing this quickstart:

1. **Optional**: Integrate background and penalty card images
2. **Optional**: Add visual regression tests (screenshot comparison)
3. **Deploy**: Push changes to production branch
4. **Monitor**: Watch for 404 errors or performance issues in production

---

## References

- **Data Model**: [data-model.md](data-model.md)
- **Contracts**: [contracts/](contracts/)
- **Integration Guide**: [extraction/typescript_integration_guide.md](../../extraction/typescript_integration_guide.md)
- **Validation Report**: [extraction/reports/validation_report.html](../../extraction/reports/validation_report.html)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

## Help & Support

If you encounter issues not covered in this guide:
1. Check the validation report for asset extraction errors
2. Review TypeScript compilation errors carefully
3. Test with fallback widgets first (set `cardImage` to `undefined`)
4. Consult the constitution for project constraints

**Last Updated**: 2026-02-23
