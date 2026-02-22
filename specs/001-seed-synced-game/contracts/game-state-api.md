# Game State API Contract

**Feature**: Seed-Synced Inhuman Conditions Web Game
**Created**: 2026-02-22
**Version**: 1.0.0
**Status**: Phase 1 Design

This document defines the public API contract for the Zustand game store. This is the interface that React components will use to interact with game state.

## Purpose

The Game State API provides a centralized, deterministic state management system that:

1. **Ensures synchronization** across devices using seed-based determinism
2. **Manages game flow** through linear state machine transitions
3. **Handles role-specific views** for Investigator, Suspect, and Spectator
4. **Maintains consistency** between UI state and game logic

## Store Access Pattern

```typescript
import { useGameStore } from '@/store/gameStore';

// In React components
function MyComponent() {
  // Subscribe to specific state slices (prevents unnecessary re-renders)
  const seed = useGameStore(state => state.seed);
  const gameState = useGameStore(state => state.gameState);

  // Access actions
  const setSeed = useGameStore(state => state.setSeed);
  const advanceState = useGameStore(state => state.advanceState);

  // ...
}
```

## API Reference

### Seed Management

#### `setSeed(seed: Seed): void`

Sets the game seed and automatically initializes all game content.

**Behavior**:
- Validates seed format (4 uppercase letters A-Z)
- Throws error if seed is invalid
- Calls `initializeGame()` automatically
- Resets game state to `SeedEntry`

**Example**:
```typescript
const setSeed = useGameStore(state => state.setSeed);
setSeed('ABCD'); // Initializes game with seed ABCD
```

**Errors**:
- Throws if seed doesn't match `/^[A-Z]{4}$/`

---

#### `generateDefaultSeed(): Seed`

Generates time-based default seed from current UTC time rounded to 5-minute intervals.

**Behavior**:
- Rounds current UTC time to nearest 5-minute window
- Converts to 4 uppercase letters
- Does NOT automatically call `setSeed()` (returns value only)

**Example**:
```typescript
const generateDefaultSeed = useGameStore(state => state.generateDefaultSeed);
const defaultSeed = generateDefaultSeed(); // "EKSC"
setSeed(defaultSeed);
```

**Determinism**: Same 5-minute window = same seed globally

---

#### `generateRandomSeed(): Seed`

Generates cryptographically random seed using `crypto.getRandomValues()`.

**Behavior**:
- Creates 4 random uppercase letters A-Z
- Uses Web Crypto API for true randomness
- Does NOT automatically call `setSeed()` (returns value only)

**Example**:
```typescript
const generateRandomSeed = useGameStore(state => state.generateRandomSeed);
const randomSeed = generateRandomSeed(); // "XJQM"
setSeed(randomSeed);
```

**Non-deterministic**: Each call produces different result

---

#### `validateSeed(seed: Seed): SeedValidation`

Validates seed format without setting it.

**Returns**:
```typescript
interface SeedValidation {
  isValid: boolean;
  error?: string;
}
```

**Example**:
```typescript
const validateSeed = useGameStore(state => state.validateSeed);

validateSeed('ABCD'); // { isValid: true }
validateSeed('abc');  // { isValid: false, error: 'Must be uppercase' }
validateSeed('AB12'); // { isValid: false, error: 'Must be letters only' }
validateSeed('ABC');  // { isValid: false, error: 'Must be 4 characters' }
```

---

### Game Mode & Role

#### `setMode(mode: GameMode): void`

Sets the game mode (single-device, multi-device, or timer-only).

**Behavior**:
- Sets `mode` state
- Resets `playerRole` to null (role must be re-selected)
- Does NOT advance game state (manual transition required)

**Example**:
```typescript
const setMode = useGameStore(state => state.setMode);
setMode(GameMode.MultiDevice);
```

---

#### `setPlayerRole(role: PlayerRole): void`

Sets the player's role in multi-device mode.

**Behavior**:
- Sets `playerRole` state
- Only relevant in `GameMode.MultiDevice`
- Determines which view components are rendered

**Example**:
```typescript
const setPlayerRole = useGameStore(state => state.setPlayerRole);
setPlayerRole(PlayerRole.Investigator);
```

**Roles**:
- `Investigator`: Sees questions, makes determination
- `Suspect`: Sees role, traits, background
- `Spectator`: Sees questions only (read-only)

---

### State Machine

#### `advanceState(): void`

Advances to the next state in the game flow.

**Behavior**:
- Transitions to next state in sequence
- Does NOT auto-advance (manual button clicks only)
- No effect if already at final state (`Conclusion`)

**State Flow**:
```
SeedEntry → ModeSelection → RoleSelection → PenaltyCalibration →
PacketDisplay → InducerPuzzle → BackgroundDisplay → ReadyToStart →
Interview → Conclusion
```

**Example**:
```typescript
const advanceState = useGameStore(state => state.advanceState);
advanceState(); // Moves to next state
```

---

#### `resetGame(): void`

Resets entire game to initial state.

**Behavior**:
- Clears all game content (`selectedPacket`, `selectedRole`, etc.)
- Resets `gameState` to `SeedEntry`
- Preserves seed (allows replay with same seed)
- Resets timer state
- Resets calibration attempts
- Clears determination and outcome

**Example**:
```typescript
const resetGame = useGameStore(state => state.resetGame);
resetGame(); // Returns to seed entry screen
```

---

### Game Content (Read-Only)

These properties are initialized by `initializeGame()` and should NOT be mutated directly by components.

#### `selectedPacket: Packet | null`

The question packet selected by the seed.

**Access**:
```typescript
const packet = useGameStore(state => state.selectedPacket);
```

**Properties**: `id`, `name`, `difficulty`, `icon`, `prompt`, `questions`, `roles`

---

#### `selectedPenalty: Penalty | null`

The penalty selected by the seed.

**Access**:
```typescript
const penalty = useGameStore(state => state.selectedPenalty);
```

**Properties**: `id`, `text`, `examples`

---

#### `selectedRole: RoleAssignment | null`

The suspect role selected by the seed.

**Access**:
```typescript
const role = useGameStore(state => state.selectedRole);
```

**Properties**: `roleType`, `fault`, `description`, `traits`, `tasks`, `restrictions`

---

#### `selectedBackground: Background | null`

The suspect background selected by the seed.

**Access**:
```typescript
const background = useGameStore(state => state.selectedBackground);
```

**Properties**: `id`, `name`, `description`

---

#### `inducerPattern: InducerPattern | null`

The maze puzzle selected by the seed.

**Access**:
```typescript
const pattern = useGameStore(state => state.inducerPattern);
```

**Properties**: `grid`, `solutionPath`, `question`

---

#### `shuffledQuestions: Question[] | null`

Questions from the selected packet in shuffled order (deterministic).

**Access**:
```typescript
const questions = useGameStore(state => state.shuffledQuestions);
```

**Properties**: Array of `{ id, type, text, examples }`

---

### Interview Timer

#### `startTimer(): void`

Starts the 5-minute countdown timer.

**Behavior**:
- Sets `timerStarted` to true
- Components should begin countdown from 300 seconds
- Only relevant in `Interview` state

**Example**:
```typescript
const startTimer = useGameStore(state => state.startTimer);
startTimer();
```

---

#### `onTimerElapsed(): void`

Called when timer reaches 0:00.

**Behavior**:
- Sets `timerElapsed` to true
- Enables determination buttons for Investigator

**Example**:
```typescript
const onTimerElapsed = useGameStore(state => state.onTimerElapsed);
// Called by CountdownTimer component
onTimerElapsed();
```

---

### Penalty Calibration

#### `incrementCalibration(): void`

Increments calibration attempt counter (max 3).

**Behavior**:
- Increments `calibrationAttempts` from 0 to 3
- Used to track "Practice penalty 3 times" requirement
- No effect if already at 3

**Example**:
```typescript
const incrementCalibration = useGameStore(state => state.incrementCalibration);
incrementCalibration(); // 0 → 1
incrementCalibration(); // 1 → 2
incrementCalibration(); // 2 → 3
```

---

### Determination & Outcome

#### `setDetermination(determination: Determination): void`

Records the Investigator's final determination.

**Behavior**:
- Sets `determination` state (`Human` or `Robot`)
- Calculates outcome by comparing to `selectedRole.roleType`
- Sets `outcome` with `{ determination, actualRole, correct }`

**Example**:
```typescript
const setDetermination = useGameStore(state => state.setDetermination);
setDetermination(Determination.Robot);
```

**Outcome Calculation**:
- Correct if determination = Human AND actualRole = Human
- Correct if determination = Robot AND actualRole = (PatientRobot OR ViolentRobot)
- Incorrect otherwise

---

### UI State

#### `toggleRoleVisibility(): void`

Toggles visibility of suspect role in single-device mode.

**Behavior**:
- Flips `roleVisible` boolean
- Only used in `GameMode.SingleDevice`
- Controls "Show Role" / "Hide Role" button

**Example**:
```typescript
const toggleRoleVisibility = useGameStore(state => state.toggleRoleVisibility);
const roleVisible = useGameStore(state => state.roleVisible);

toggleRoleVisibility(); // false → true (show role)
toggleRoleVisibility(); // true → false (hide role)
```

---

### Sync Debugging

#### `getStateHash(): string`

Generates hash of current game state for multi-device sync verification.

**Behavior**:
- Creates hash from: seed, gameState, selectedPacket.id, selectedPenalty.id, selectedRole.roleType, selectedBackground.id
- Returns 8-character hex string
- Identical state = identical hash

**Example**:
```typescript
const getStateHash = useGameStore(state => state.getStateHash);
const hash = getStateHash(); // "a3f5c2d1"
```

**Use Case**: Players on different devices compare hashes to verify sync

---

## State Initialization Lifecycle

```typescript
// 1. Component renders, user enters seed
<SeedEntry />
  └─> setSeed('ABCD')
        ├─> validateSeed() [internal check]
        └─> initializeGame() [automatic]
              ├─> Create GameRNG with seed
              ├─> Select packet (deterministic)
              ├─> Select penalty (deterministic)
              ├─> Assign role (deterministic)
              ├─> Select background (deterministic)
              ├─> Generate inducer pattern (deterministic)
              └─> Shuffle questions (deterministic)

// 2. Game content now available
selectedPacket !== null ✓
selectedPenalty !== null ✓
selectedRole !== null ✓
selectedBackground !== null ✓
inducerPattern !== null ✓
shuffledQuestions !== null ✓

// 3. User advances through states
advanceState() → ModeSelection
advanceState() → RoleSelection
// ... etc
```

---

## Error Handling Contract

### Seed Validation Errors

```typescript
// setSeed() throws on invalid seed
try {
  setSeed('abc'); // lowercase
} catch (error) {
  // error.message: "Seed must be 4 uppercase letters (A-Z)"
}

try {
  setSeed('AB12'); // contains numbers
} catch (error) {
  // error.message: "Seed must contain only letters"
}

try {
  setSeed('ABC'); // wrong length
} catch (error) {
  // error.message: "Seed must be exactly 4 characters"
}
```

### Null Checks

Components MUST check for null before accessing game content:

```typescript
const packet = useGameStore(state => state.selectedPacket);

if (!packet) {
  return <div>Initializing game...</div>;
}

// Safe to access packet.questions now
```

---

## Immutability Contract

**CRITICAL**: All state updates MUST be immutable.

### ✅ Correct Usage

```typescript
// Zustand handles immutability internally
const advanceState = useGameStore(state => state.advanceState);
advanceState(); // Safe - creates new state object
```

### ❌ Incorrect Usage

```typescript
// NEVER mutate state directly
const packet = useGameStore(state => state.selectedPacket);
packet.questions.push(newQuestion); // ❌ MUTATION - breaks Zustand
```

---

## Testing Contract

### Unit Testing Store

```typescript
import { useGameStore } from '@/store/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().resetGame();
  });

  it('initializes game with valid seed', () => {
    const { setSeed, selectedPacket } = useGameStore.getState();

    setSeed('TEST');

    expect(selectedPacket).not.toBeNull();
    expect(selectedPacket?.id).toBeDefined();
  });
});
```

### Multi-Device Sync Testing

```typescript
it('produces identical content for same seed on two stores', () => {
  // Simulate two devices
  const store1 = useGameStore.getState();
  const store2 = useGameStore.getState();

  store1.setSeed('SYNC');
  store2.setSeed('SYNC');

  // Content should be identical
  expect(store1.selectedPacket?.id).toBe(store2.selectedPacket?.id);
  expect(store1.selectedRole?.roleType).toBe(store2.selectedRole?.roleType);
  expect(store1.getStateHash()).toBe(store2.getStateHash());
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-22 | Initial API design for Phase 1 |

---

## Related Documents

- [data-model.md](../data-model.md) - Entity definitions and type interfaces
- [spec.md](../spec.md) - Feature specification and requirements
- [research.md](../research.md) - Technology decisions (Zustand rationale)

---

**Status**: ✅ Contract Defined
**Next Step**: Implement Zustand store following this contract in `src/store/gameStore.ts`
