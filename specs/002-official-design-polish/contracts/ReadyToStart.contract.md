# Component Contract: ReadyToStart

**Component**: ReadyToStart
**Type**: Game Stage Component
**File**: `src/components/game/ReadyToStart.tsx`
**Status**: New Component (Replaces Auto-Advance Logic)

## Purpose

Provides a final confirmation stage where both players have reviewed their roles, understand the penalty, and are ready to begin the timed 5-minute interview. This stage requires manual confirmation via "Start Interview" button to begin the countdown timer.

## Props Interface

```typescript
interface ReadyToStartProps {
  /**
   * Callback fired when "Start Interview" button is clicked
   * Should:
   * 1. Initialize and start the 5-minute countdown timer
   * 2. Advance game state to Interview stage
   */
  onStartInterview: () => void;

  /**
   * Current player's role - determines view shown
   * - Investigator: Shows "Read Cover Sheet and Start Timer" button
   * - Suspect: Shows waiting screen with role reminder
   * - Spectator: Shows waiting screen
   */
  role: 'investigator' | 'suspect' | 'spectator';

  /**
   * Optional: Suspect's assigned role information for reminder
   * Used in Suspect view to show brief role recap
   */
  suspectRole?: {
    type: 'human' | 'patient-robot' | 'violent-robot';
    fault?: string;  // For robots
    traits?: string[];  // Tasks/restrictions
  };

  /**
   * Optional: Display mode selection (single-device vs multi-device)
   * Affects messaging about coordination
   * @default 'single-device'
   */
  mode?: 'single-device' | 'multi-device' | 'timer-only';
}
```

## Behavior Requirements

### Investigator View (Single-Device Mode)
- Display heading: "Ready to Start Interview"
- Show checklist of completed steps:
  - ✓ Penalty calibrated (3 practice attempts)
  - ✓ Roles assigned
  - ✓ Background reviewed
- Display large "Start Interview" button
- Include instruction: "When you click this button, the 5-minute timer will begin"
- Button click calls `onStartInterview()` which:
  1. Initializes timer to 300 seconds
  2. Starts countdown
  3. Advances to Interview state

### Investigator View (Multi-Device Mode)
- Same as single-device, but additional messaging:
- "Ensure the Suspect is ready before starting"
- "Both players should confirm readiness verbally"
- Emphasis on coordination between devices

### Suspect View
- Display heading: "Waiting for Investigator to Start Interview"
- Show brief role reminder:
  - Human: "You are human. Answer naturally."
  - Robot: "You are a robot with [fault]. Remember your restrictions."
- Display penalty reminder: "Penalty: [penalty text]"
- Show "Ready" indicator (no interactive button, just status)
- Optional: "Tell the Investigator when you're ready" prompt

### Spectator View
- Display heading: "Waiting for Interview to Begin"
- Show message: "The interview will start when the Investigator is ready"
- No interactive elements

### Critical Constraints
- **MUST start timer manually** - No auto-advance, no automatic timer start
- **MUST be Investigator-controlled** - Only Investigator can click "Start Interview"
- **MUST happen AFTER penalty calibration** - This stage follows PenaltyCalibration in flow
- **MUST initialize timer on button click** - Timer creation happens here, not earlier

## Visual Design

### Layout
- Card component wrapping content
- Centered layout with clear hierarchy
- Checklist of completed steps (visual checkmarks ✓)
- Large, prominent "Start Interview" button (Investigator only)
- Role reminder panel (Suspect view) with halftone background

### Styling Requirements
- Uses design tokens from `tokens.css`
- Button styling: --color-primary (#6f6b6b), hover: --color-primary-hover (#646060)
- Button size: --button-padding-y (17px), --button-padding-x (77px), --radius-lg (23px)
- Halftone background on role reminder panel (opacity 0.15)
- Responsive layout (stacks vertically on mobile)

### Typography
- Heading: 32px bold, --font-family
- Checklist items: 18px regular with checkmark icons
- Instructions: 16px regular, muted color (#666666)
- Button text: 18px bold, uppercase

## Accessibility

### WCAG AA Compliance
- **Contrast**: All text meets 4.5:1 ratio
- **Keyboard Navigation**: "Start Interview" button focusable with Tab
- **Focus Indicators**: Visible focus ring on button
- **Screen Readers**:
  - Announce heading and current state
  - Label button clearly: "Start the 5-minute interview timer"
  - Announce role reminder (Suspect view)

### ARIA Attributes
```tsx
<div role="region" aria-labelledby="ready-heading">
  <h2 id="ready-heading">Ready to Start Interview</h2>
  <ul role="list" aria-label="Preparation checklist">
    <li>
      <span aria-hidden="true">✓</span>
      <span>Penalty calibrated</span>
    </li>
    {/* ... */}
  </ul>
  <button
    onClick={handleStartInterview}
    aria-label="Start the 5-minute interview timer and begin interview"
  >
    Start Interview
  </button>
</div>
```

### Reduced Motion
- Respect `prefers-reduced-motion` for any button animations
- No auto-playing animations on this stage

## State Management

### Local State
```typescript
const [isButtonPressed, setIsButtonPressed] = useState(false);
```

### Side Effects
- **Critical**: `onStartInterview()` callback must:
  1. Call `startTimer()` from gameStore
  2. Call `advanceState()` to transition to Interview
- No automatic progression
- No timer initialization until button clicked

## Testing Requirements

### Unit Tests
1. **Rendering**:
   - Renders correct view based on role prop
   - Shows checklist of completed steps (Investigator view)
   - Shows role reminder (Suspect view)
   - Displays "Start Interview" button (Investigator only)

2. **Interaction**:
   - Button click calls `onStartInterview()`
   - Button disabled after first click (prevents double-start)
   - Suspect view has no interactive elements

3. **Accessibility**:
   - Button keyboard accessible (Tab, Enter)
   - ARIA labels present and correct
   - Focus visible on button
   - Contrast ratios meet WCAG AA

4. **Edge Cases**:
   - Handles missing `suspectRole` prop gracefully
   - Multi-device mode shows coordination messaging
   - Timer-only mode skips this component entirely

### Integration Tests
1. **Game Flow**:
   - Timer does NOT start before button clicked
   - Button click initializes timer to 300 seconds
   - Button click advances to Interview state
   - Multi-device: Both devices can see "waiting" state until Investigator starts
   - Timer synchronization: All devices show same countdown (manual coordination)

2. **TDD Requirement**:
   - Write tests BEFORE implementing component
   - Test that timer is NOT running when component mounts
   - Test that timer IS running after button click

## Example Usage

```tsx
import { ReadyToStart } from '@/components/game/ReadyToStart';
import { useGameStore } from '@/store/gameStore';

function GameStateMachine() {
  const { role, suspectRole, mode, startTimer, advanceState } = useGameStore();

  if (gameState === GameState.ReadyToStart) {
    return (
      <ReadyToStart
        role={role}
        suspectRole={suspectRole}
        mode={mode}
        onStartInterview={() => {
          startTimer();     // Initialize and start 5-minute countdown
          advanceState();   // Transition to Interview state
        }}
      />
    );
  }
}
```

## Dependencies

- **Components**: Button (existing), Card (existing)
- **Styles**: tokens.css, ReadyToStart.module.css
- **Store**: useGameStore (for role, suspectRole, mode, startTimer, advanceState)
- **Types**: GameState enum, Role type, SuspectRole interface

## Related Components

- **PenaltyCalibration**: Previous stage (must complete before this)
- **Interview**: Next stage (begins after "Start Interview" clicked)
- **GameStateMachine**: Parent component managing stage transitions
- **CountdownTimer**: Initialized by `onStartInterview()` callback

## Migration Notes

**Replaces Existing Auto-Advance Logic**:

Current MVP implementation (GameStateMachine.tsx:27-29):
```typescript
// REMOVE THIS:
if (gameState === GameState.ReadyToStart) {
  startTimer(); // ← Starts too early!
}
```

New implementation:
```typescript
// Replace with manual button-triggered timer start:
case GameState.ReadyToStart:
  return (
    <ReadyToStart
      onStartInterview={() => {
        startTimer();
        advanceState();
      }}
    />
  );
```

## Success Criteria

- ✅ Timer does NOT start automatically when reaching ReadyToStart state
- ✅ Timer ONLY starts when Investigator clicks "Start Interview" button
- ✅ Both players see confirmation that interview is about to begin
- ✅ Clear indication of what will happen when button is clicked
- ✅ WCAG AA contrast maintained
- ✅ Keyboard navigation fully functional
- ✅ Multi-device coordination messaging clear
