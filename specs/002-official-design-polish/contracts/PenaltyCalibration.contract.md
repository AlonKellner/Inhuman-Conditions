# Component Contract: PenaltyCalibration

**Component**: PenaltyCalibration
**Type**: Game Stage Component
**File**: `src/components/game/PenaltyCalibration.tsx`
**Status**: New Component

## Purpose

Provides a practice stage where the Investigator reads the penalty aloud and the Suspect practices performing it 3 times before the interview timer starts. This establishes baseline behavior and ensures both players understand what counts as fulfilling the penalty.

## Props Interface

```typescript
interface PenaltyCalibrationProps {
  /**
   * The selected penalty text to display and practice
   * Example: "You must apologize at least once per answer"
   */
  penalty: string;

  /**
   * Callback fired when penalty calibration is complete (3 attempts done)
   * Should advance game state to next stage
   */
  onComplete: () => void;

  /**
   * Current player's role - determines view shown
   * - Investigator: Shows instructions to read penalty aloud
   * - Suspect: Shows practice attempt counter and continue button
   * - Spectator: Shows waiting screen
   */
  role: 'investigator' | 'suspect' | 'spectator';

  /**
   * Optional: Current attempt number (0-3)
   * Used for resuming interrupted calibration
   * @default 0
   */
  currentAttempt?: number;
}
```

## Behavior Requirements

### Investigator View
- Display penalty text prominently with "Read this aloud to the Suspect" instruction
- Show waiting indicator: "Waiting for Suspect to complete 3 practice attempts..."
- No interactive elements for Investigator during calibration
- Cannot advance state (Suspect controls progression)

### Suspect View
- Display penalty text with "Practice this 3 times" instruction
- Show attempt counter: "Practice Attempt X of 3"
- Provide "I Practiced" button to increment counter
- Enable "Continue" button only after 3 attempts completed
- Button click calls `onComplete()` to advance game state

### Spectator View
- Display penalty text (read-only)
- Show "Calibration in progress..." message
- No interactive elements

### Critical Constraints
- **MUST NOT start timer** - Timer remains inactive during this stage
- **MUST require exactly 3 attempts** - Cannot skip or reduce count
- **MUST block progression until complete** - `onComplete()` only enabled after 3 attempts
- **MUST be manually advanced** - No auto-progression, Suspect clicks "Continue"

## Visual Design

### Layout
- Card component wrapping content
- Penalty text in large, bold header (matches official card typography)
- Progress indicator (attempt counter) clearly visible
- Buttons aligned bottom-right (consistent with app design)

### Styling Requirements
- Uses design tokens from `tokens.css` (--color-primary, --font-family, etc.)
- Halftone background pattern with 0.12 opacity (subtle texture)
- Button styling matches existing Button component (--button-padding-x/y, --radius-lg)
- Responsive layout (mobile-first, stacks vertically on small screens)

### Typography
- Penalty text: 24px bold, --font-family
- Instructions: 18px regular, muted color (#666666)
- Attempt counter: 20px bold, primary color (#6f6b6b)

## Accessibility

### WCAG AA Compliance
- **Contrast**: All text meets 4.5:1 ratio against background (halftone opacity ≤0.12)
- **Keyboard Navigation**: Tab order: Practice button → Continue button
- **Focus Indicators**: Visible focus ring on interactive elements
- **Screen Readers**:
  - Announce attempt count changes ("Practice attempt 2 of 3")
  - Label buttons clearly ("Mark attempt as practiced", "Continue to next stage")

### ARIA Attributes
```tsx
<div role="region" aria-labelledby="penalty-heading">
  <h2 id="penalty-heading">Penalty Calibration</h2>
  <p aria-live="polite" aria-atomic="true">
    Practice Attempt {currentAttempt} of 3
  </p>
  <button
    onClick={handlePractice}
    aria-label="Mark practice attempt complete"
    disabled={currentAttempt >= 3}
  >
    I Practiced
  </button>
</div>
```

## State Management

### Local State
```typescript
const [attemptCount, setAttemptCount] = useState(currentAttempt ?? 0);
const isComplete = attemptCount >= 3;
```

### Side Effects
- No timer initialization (critical requirement)
- No automatic progression
- Button clicks update local state only
- `onComplete()` called when user clicks "Continue" after 3 attempts

## Testing Requirements

### Unit Tests
1. **Rendering**:
   - Renders penalty text correctly
   - Shows correct view based on role prop
   - Displays attempt counter (Suspect view)

2. **Interaction**:
   - "I Practiced" button increments counter
   - "I Practiced" disabled after 3 attempts
   - "Continue" button enabled only after 3 attempts
   - "Continue" button calls `onComplete()`

3. **Accessibility**:
   - Keyboard navigation works (Tab, Enter)
   - ARIA labels present and correct
   - Focus visible on interactive elements
   - Contrast ratios meet WCAG AA

4. **Edge Cases**:
   - Handles resuming from `currentAttempt > 0`
   - Cannot increment past 3 attempts
   - Spectator view has no interactive elements

### Integration Tests
1. **Game Flow**:
   - Penalty calibration blocks timer start
   - Cannot advance to Interview without completing 3 attempts
   - State persists if user navigates away and returns
   - Multi-device: Both devices show same penalty text (seed-based)

## Example Usage

```tsx
import { PenaltyCalibration } from '@/components/game/PenaltyCalibration';
import { useGameStore } from '@/store/gameStore';

function GameStateMachine() {
  const { selectedPenalty, role, advanceState } = useGameStore();

  if (gameState === GameState.PenaltyCalibration) {
    return (
      <PenaltyCalibration
        penalty={selectedPenalty}
        role={role}
        onComplete={() => advanceState()}
      />
    );
  }
}
```

## Dependencies

- **Components**: Button (existing), Card (existing)
- **Styles**: tokens.css, PenaltyCalibration.module.css
- **Store**: useGameStore (for penalty text, role)
- **Types**: GameState enum, Role type

## Related Components

- **ReadyToStart**: Next stage after PenaltyCalibration
- **GameStateMachine**: Parent component managing stage transitions
- **CountdownTimer**: Must NOT be initialized during this stage

## Success Criteria

- ✅ Suspect can practice penalty exactly 3 times
- ✅ Timer does NOT start during calibration
- ✅ Progression blocked until 3 attempts complete
- ✅ Manual "Continue" button required to advance
- ✅ WCAG AA contrast maintained with halftone background
- ✅ Keyboard navigation fully functional
- ✅ Multi-device shows same penalty text (seed synchronization)
