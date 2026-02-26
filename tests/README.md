# Testing Strategy for Inhuman Conditions

## Overview

This document describes the comprehensive testing strategy for the Inhuman Conditions game implementation, with special focus on verifying the independent dual-game architecture.

## Test Levels

### Unit Tests (`src/**/*.test.ts`)

**Purpose**: Test individual functions, utilities, and store logic in isolation.

**Key Test Files**:
- `src/store/gameStore.test.ts` - Store state management and independence
- `src/lib/GameRNG.test.ts` - Random number generation
- `src/lib/seedGeneration.test.ts` - Seed validation and generation
- `src/lib/inducerPattern.test.ts` - Inducer pattern logic
- `src/data/catalyzerCards.test.ts` - Game content validation

**Store Independence Tests** (gameStore.test.ts):
- Verifies two independent GameEngine instances exist
- Tests that seeds don't automatically sync between stores
- Validates gameState advancement is independent
- Confirms penalty selection state is separate
- Checks content cycling doesn't cross-pollinate
- Ensures timer state remains independent

### Component Tests (`tests/components/`)

**Purpose**: Test React component rendering and context provider wrapping.

**Key Test Files**:
- `GameStateMachine.test.tsx` - Verifies no context errors when using direct store access
- `ViewSwitcher.test.tsx` - Confirms proper provider wrapping for each view
- `BackgroundDisplay.test.tsx` - Background selection UI
- `PenaltyCalibration.test.tsx` - Penalty practice component
- `CyclingButtons.test.tsx` - Content cycling controls

### Integration Tests (`tests/integration/`)

**Purpose**: Test multi-component workflows and state machine transitions.

**Key Test Files**:
- `game-flow.test.tsx` - Complete game state progression
- `dual-store-workflow.test.tsx` - Independent store interactions
- `card-image-rendering.test.tsx` - Visual asset pipeline

### E2E Tests (`tests/e2e/`)

**Purpose**: Test full user workflows in a real browser environment.

**Key Test Files**:
- `app-loads.spec.ts` - Verifies build and runtime startup
- `complete-game-flow.spec.ts` - Full gameplay from seed to conclusion
- `dual-view-architecture.spec.ts` - Independent store behavior in UI
- `content-cycling.spec.ts` - Content selection and cycling
- `official-game-flow.spec.ts` - Validates against official game rules

---

## Running Tests

### Quick Commands

```bash
# Unit + Component tests (Vitest)
npm run test

# Interactive test UI (watch mode)
npm run test:ui

# With coverage report
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e

# E2E with interactive UI
npm run test:e2e:ui

# Run ALL tests (unit + build + E2E)
npm run test:all
```

### Focused Test Runs

```bash
# Run specific test file
npm run test -- src/store/gameStore.test.ts

# Run tests matching pattern
npm run test -- --grep "independence"

# Run only changed tests (watch mode)
npm run test

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run specific E2E test
npx playwright test tests/e2e/dual-view-architecture.spec.ts
```

---

## Independent Store Testing

The independent dual-game architecture requires special testing to ensure no automatic synchronization occurs between Investigator and Suspect views.

### Key Scenarios to Verify

#### 1. Seed Independence

**Expected Behavior**: Each view maintains its own seed and game content.

```typescript
it('should not share state when seeds are different', () => {
  const inv = useInvestigatorStore.getState();
  const sus = useSuspectStore.getState();

  inv.setSeed('AAAA');
  sus.setSeed('ZZZZ');

  expect(inv.selectedPacket?.id).not.toBe(sus.selectedPacket?.id);
});
```

**Manual Test**:
1. Enter seed "AAAA" in Investigator view → Start Game
2. Switch to Suspect view → verify still at seed entry
3. Enter seed "ZZZZ" → Start Game
4. Verify different content was selected in each view

---

#### 2. State Independence

**Expected Behavior**: Advancing gameState in one view doesn't advance the other.

```typescript
it('should not share gameState advancement', () => {
  const inv = useInvestigatorStore.getState();
  const sus = useSuspectStore.getState();

  inv.advanceState();
  inv.advanceState();

  expect(inv.gameState).not.toBe(sus.gameState);
});
```

**Manual Test**:
1. Both views at seed-entry
2. Investigator advances to penalty-selection
3. Verify Suspect still at seed-entry
4. Views can be in different states without errors

---

#### 3. Selection Independence

**Expected Behavior**: Manual input required for cross-view coordination.

```typescript
it('should not share penalty selection state', () => {
  // ... (see test file)
  inv.eliminatePenalty(availablePenalties[0].id);
  sus.eliminatePenalty(availablePenalties[1].id);

  expect(inv.penaltySelection?.investigatorEliminated).not.toBe(
    sus.penaltySelection?.investigatorEliminated
  );
});
```

**Manual Test**:
1. Get both views to penalty-selection
2. Investigator eliminates penalty #1
3. Switch to Suspect → verify manual dropdown visible (not auto-eliminated)
4. Suspect selects penalty #1 from dropdown → Continue
5. Verify suspect advances after manual input

---

#### 4. No Cross-Pollution

**Expected Behavior**: Content cycling in one store doesn't affect the other.

```typescript
it('should not share content cycling state', () => {
  inv.cycleContent('penalty', 'next');
  inv.cycleContent('penalty', 'next');

  expect(inv.contentIndices.penaltyIndex).toBe(2);
  expect(sus.contentIndices.penaltyIndex).toBe(0);
});
```

**Manual Test**:
1. Investigator cycles through penalties
2. Suspect's view should NOT update
3. Each view maintains independent selection indices

---

## Test Coverage Goals

### Current Coverage

Run `npm run test:coverage` to see detailed coverage report.

**Target Coverage**:
- Store logic: **>90%**
- Components: **>70%**
- Utilities: **>85%**
- Overall: **>80%**

### Critical Paths to Cover

1. **Seed entry and validation** - Unit + E2E
2. **Penalty selection workflow** - Unit + Component + E2E
3. **State machine transitions** - Unit + Integration
4. **Independent store behavior** - Unit + E2E
5. **Manual coordination flows** - E2E

---

## Continuous Integration

### Pre-Push Checklist

Before pushing code:

```bash
# 1. Run all tests
npm run test:all

# 2. Check build succeeds
npm run build

# 3. Verify no console errors
npm run dev
# Then manually check browser console

# 4. Run linter
npm run lint
```

### CI Pipeline

The CI pipeline should run:
1. `npm run test -- --run` (unit tests)
2. `npm run build` (TypeScript compilation)
3. `npm run test:e2e` (E2E tests)

---

## Debugging Failed Tests

### Unit Test Failures

```bash
# Run in UI mode for better debugging
npm run test:ui

# Enable verbose logging
DEBUG=* npm run test -- --reporter=verbose

# Run single test file
npm run test -- path/to/test.test.ts
```

### E2E Test Failures

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run with inspector (pause on failures)
npx playwright test --debug

# Generate trace for failed test
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Component Test Failures

```bash
# Check if context provider is missing
# Error: "useGameStore must be used within GameStoreProvider"
# Solution: Verify component is wrapped in <GameStoreProvider role="...">

# Check if wrong store is being used
# GameStateMachine and Conclusion use useInvestigatorStore directly
# All other components use useGameStore from GameStoreContext
```

---

## Adding New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test('user can complete workflow', async ({ page }) => {
  await page.goto('/');

  await page.click('button:has-text("Start")');

  await expect(page.locator('h1')).toHaveText('Success');
});
```

---

## Known Issues and Workarounds

### Issue 1: Pre-existing TypeScript Errors

**Problem**: Build shows TypeScript errors unrelated to dual-store architecture.

**Files Affected**:
- QuestionCardImage.tsx (missing Question properties)
- FormPresentation.tsx (missing type definitions)
- ContentSelector.ts (missing PacketRole properties)

**Workaround**: These are pre-existing issues. Focus on runtime behavior and test results.

---

## Questions?

For issues or questions about testing:
1. Check the test output for specific error messages
2. Review this README for debugging strategies
3. Run tests in UI or debug mode for better visibility
4. Check the plan file at `.claude/plans/crispy-squishing-volcano.md`
