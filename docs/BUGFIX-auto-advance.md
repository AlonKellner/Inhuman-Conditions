# Bug Fix: Auto-Advance Through Intermediate States

## Issue Reported

The game would get stuck on intermediate states showing:
```
Setting up your game...
Game State: mode-selection
```

Users didn't realize they needed to click the Continue button to advance through the intermediate states.

## Root Cause

The `GameStateMachine` component had a mismatch between its intended behavior (auto-advance) and actual implementation (manual Continue button):

**Intended Behavior** (from code comment line 41-42):
```typescript
// For MVP, skip intermediate states and jump straight to interview
// Auto-advance through these states for MVP
```

**Actual Implementation**:
- Rendered intermediate states with a "Setting up your game..." message
- Showed a Continue button that required manual clicking
- Users got confused because the message implied automatic setup

## Solution

Implemented auto-advance through intermediate states using React's `useEffect` hook:

### Changes Made

1. **Added useEffect Hook** ([GameStateMachine.tsx](../src/components/GameStateMachine.tsx)):
   ```typescript
   useEffect(() => {
     const intermediateStates: GameState[] = [
       GameState.ModeSelection,
       GameState.RoleSelection,
       GameState.PenaltyCalibration,
       GameState.PacketDisplay,
       GameState.InducerPuzzle,
       GameState.BackgroundDisplay,
       GameState.ReadyToStart,
     ];

     if (intermediateStates.includes(gameState)) {
       if (gameState === GameState.ReadyToStart) {
         startTimer();
       }

       const timer = setTimeout(() => {
         advanceState();
       }, 300);

       return () => clearTimeout(timer);
     }
   }, [gameState, advanceState, startTimer]);
   ```

2. **Removed Continue Button**:
   - Removed the manual Continue button from intermediate state screen
   - Now shows only "Setting up your game..." message
   - States auto-advance after 300ms delay

3. **Updated E2E Test** ([app-loads.spec.ts](../tests/e2e/app-loads.spec.ts)):
   ```typescript
   // Old: Manually clicked Continue buttons
   // New: Wait for auto-advance to interview state
   await expect(page.getByText(/Question|Pass device/i).first())
     .toBeVisible({ timeout: 10000 });
   ```

4. **Added Unit Tests** ([GameStateMachine-auto-advance.test.tsx](../tests/unit/GameStateMachine-auto-advance.test.tsx)):
   - Verifies auto-advance from mode-selection → role-selection
   - Verifies complete auto-advance to interview state
   - Verifies timer starts before advancing from ready-to-start
   - Verifies interview and conclusion states don't auto-advance

## User Experience Impact

**Before Fix**:
1. User enters seed and clicks "Start Game"
2. Sees "Setting up your game... Game State: mode-selection"
3. Gets confused - appears stuck
4. Needs to notice and click hidden Continue button
5. Must repeat for each intermediate state (7 clicks total)

**After Fix**:
1. User enters seed and clicks "Start Game"
2. Sees brief "Setting up your game..." message
3. Game automatically transitions to interview (< 3 seconds)
4. No manual interaction required

## Test Coverage

### E2E Tests (Playwright)
- ✅ Auto-advance from seed entry to interview state
- ✅ All game data loads correctly during auto-advance
- ✅ No console errors during transitions

### Unit Tests (Vitest)
- ✅ Auto-advance through individual states
- ✅ Timer starts before advancing from ready-to-start
- ✅ Interview and conclusion states don't auto-advance
- ✅ Loading state displays during transitions

All tests pass ✓

## Technical Details

**Auto-Advance Timing**:
- Each intermediate state shows for 300ms
- 7 intermediate states × 300ms = 2.1 seconds total
- Provides smooth loading experience without appearing instant (which could feel buggy)

**State Machine Flow**:
```
seed-entry
  ↓ (manual: click "Start Game")
mode-selection
  ↓ (auto: 300ms)
role-selection
  ↓ (auto: 300ms)
penalty-calibration
  ↓ (auto: 300ms)
packet-display
  ↓ (auto: 300ms)
inducer-puzzle
  ↓ (auto: 300ms)
background-display
  ↓ (auto: 300ms)
ready-to-start
  ↓ (auto: 300ms + startTimer())
interview
  ↓ (manual: make determination)
conclusion
```

## Future Enhancements

For later phases (User Story 2+), intermediate states will have full implementations:
- Mode selection screen with radio buttons
- Role selection screen for multi-device mode
- Penalty calibration with practice attempts
- Packet display showing questions
- Inducer puzzle for Suspect to solve
- Background display for character details

These will replace the auto-advance behavior with proper UI screens.

## Commit

Fixed in commit: `d473b9c`
- Auto-advance implementation
- Updated tests
- Documentation

## Verification

To verify the fix works:
```bash
# Run E2E tests
npm run test:e2e

# Or manually test
npm run dev
# Visit http://localhost:5173
# Enter seed "TEST"
# Click "Start Game"
# Game should auto-advance to interview within ~2 seconds
```
