# Data Model: Inhuman Conditions

**Feature**: Seed-Synced Inhuman Conditions Web Game
**Created**: 2026-02-22
**Status**: Phase 1 Design

This document defines all game entities and the Zustand store shape for state management.

## Core Entities

### Seed
A 4-letter uppercase string that determines all random game content.

```typescript
type Seed = string; // Format: /^[A-Z]{4}$/

interface SeedValidation {
  isValid: boolean;
  error?: string;
}
```

**Validation Rules**:
- Must be exactly 4 characters
- Must contain only uppercase letters A-Z
- No numbers, lowercase, or special characters

---

### Game Mode
Determines how the game is played (device configuration).

```typescript
enum GameMode {
  SingleDevice = 'single-device',
  MultiDevice = 'multi-device',
  TimerOnly = 'timer-only'
}
```

**Modes**:
- `SingleDevice`: Device passed between players, role info hidden/revealed
- `MultiDevice`: Each player has own device, role-specific views
- `TimerOnly`: Only countdown timer, no game logic

---

### Player Role
The role selected by each player in multi-device mode.

```typescript
enum PlayerRole {
  Investigator = 'investigator',
  Suspect = 'suspect',
  Spectator = 'spectator'
}
```

**Role Descriptions**:
- `Investigator`: Asks questions, makes determination
- `Suspect`: Answers questions with role constraints
- `Spectator`: Observes without seeing secret information

---

### Game State
Current phase in the game flow state machine.

```typescript
enum GameState {
  SeedEntry = 'seed-entry',
  ModeSelection = 'mode-selection',
  RoleSelection = 'role-selection',
  PenaltyCalibration = 'penalty-calibration',
  PacketDisplay = 'packet-display',
  InducerPuzzle = 'inducer-puzzle',
  BackgroundDisplay = 'background-display',
  ReadyToStart = 'ready-to-start',
  Interview = 'interview',
  Conclusion = 'conclusion'
}
```

**State Flow**:
Linear progression with manual button-driven transitions. No automatic state changes.

---

### Question Packet
A themed set of interview questions.

```typescript
interface Question {
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  examples: string[];
}

interface PacketRole {
  roleType: RoleType;
  description: string;
  fault?: string; // Only for robot roles
  traits: string[];
  tasks?: string[]; // Only for violent robots
}

interface Packet {
  id: string;
  name: string;
  difficulty: 'intro' | 'easy' | 'intermediate' | 'hard';
  icon: string; // Unicode emoji or icon identifier
  prompt: string; // Instructions for Investigator
  questions: Question[];
  roles: PacketRole[];
}
```

**Packet List** (11 total):
1. Small Talk (Telephone 📞) - Intro
2. Creative Problem Solving (Scissors ✂️) - Easy
3. Imagination (Unicorn 🦄) - Easy
4. Cooperation & Collaboration (Tandem Bicycle 🚲) - Easy
5. Hopes and Dreams (Sprout 🌱) - Intermediate
6. Body Integration (Heart ❤️) - Intermediate
7. Grief (Rose 🌹) - Intermediate
8. Threat Assessment (Snake 🐍) - Intermediate
9. Moral Failings (Devil 😈) - Intermediate
10. Self Image (Mirror 🪞) - Intermediate
11. Recognizing Intentions (Water Spout 💧) - Hard

---

### Role Type
The suspect's actual identity (Human or Robot variant).

```typescript
enum RoleType {
  Human = 'human',
  PatientRobot = 'patient-robot',
  ViolentRobot = 'violent-robot'
}

interface RoleAssignment {
  roleType: RoleType;
  fault?: RobotFault; // Only for robots
  description: string;
  traits: string[];
  tasks?: string[]; // Only for violent robots
  restrictions?: string[]; // Only for patient robots
}

enum RobotFault {
  LongTermMemory = 'long-term-memory',
  Friendship = 'friendship',
  Evaluation = 'evaluation',
  Taste = 'taste',
  Humor = 'humor',
  Empathy = 'empathy',
  // Additional faults from game data
}
```

**Distribution**:
- Human: 33% (roll 1-4 on d12)
- Patient Robot: 50% (roll 5-10 on d12, two fault types)
- Violent Robot: 17% (roll 11-12 on d12, two variants)

---

### Penalty
An action the Suspect must perform when violating their restriction (Patient Robots only).

```typescript
interface Penalty {
  id: string;
  text: string;
  examples?: string[];
}
```

**Total Count**: 18 unique penalties

**Examples**:
- "Apologize"
- "Swear"
- "Say three consecutive words beginning with the same letter"
- "Make a sound effect"

---

### Suspect Background
The character identity assigned to the Suspect.

```typescript
interface Background {
  id: string;
  name: string;
  description?: string;
}
```

**Total Count**: 30 unique backgrounds

**Examples**:
- "Reality TV Contestant"
- "Disgraced Scientist"
- "Mayoral Candidate"
- "Former Professional Athlete"

---

### Inducer Pattern
A maze-like puzzle with directional connections and letter markers.

```typescript
enum Direction {
  North = 1 << 0, // 0001
  East = 1 << 1,  // 0010
  South = 1 << 2, // 0100
  West = 1 << 3   // 1000
}

interface Cell {
  row: number;
  col: number;
  connections: number; // Bitflags of Direction enum
  label?: string; // Letter marker (A, B, C, ...)
}

interface InducerPattern {
  grid: Cell[][]; // 5x5 grid
  solutionPath: string; // Sequence of letters (e.g., "ABCDEF")
  question: string; // Question about the pattern
}
```

**Grid Dimensions**: 5 rows × 5 columns

**Algorithm**: Recursive depth-first maze generation with seeded randomness

---

### Determination
The Investigator's final decision about the Suspect's identity.

```typescript
enum Determination {
  Human = 'human',
  Robot = 'robot'
}

interface GameOutcome {
  determination: Determination;
  actualRole: RoleType;
  correct: boolean;
}
```

**Outcome Calculation**:
- Correct if determination matches actual role (Human = Human, Robot = any robot type)
- Incorrect otherwise

---

## Zustand Store Shape

### Store Interface

```typescript
interface GameStore {
  // Seed & Initialization
  seed: Seed | null;
  setSeed: (seed: Seed) => void;
  generateDefaultSeed: () => Seed;
  generateRandomSeed: () => Seed;
  validateSeed: (seed: Seed) => SeedValidation;

  // Game Mode & Role
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  playerRole: PlayerRole | null;
  setPlayerRole: (role: PlayerRole) => void;

  // Game State Machine
  gameState: GameState;
  advanceState: () => void;
  resetGame: () => void;

  // Selected Game Content (initialized by seed)
  selectedPacket: Packet | null;
  selectedPenalty: Penalty | null;
  selectedRole: RoleAssignment | null;
  selectedBackground: Background | null;
  inducerPattern: InducerPattern | null;
  shuffledQuestions: Question[] | null;

  // Game Initialization (called when seed is set)
  initializeGame: () => void;

  // Interview State
  timerStarted: boolean;
  timerElapsed: boolean;
  startTimer: () => void;
  onTimerElapsed: () => void;

  // Penalty Calibration
  calibrationAttempts: number;
  incrementCalibration: () => void;

  // Conclusion
  determination: Determination | null;
  setDetermination: (determination: Determination) => void;
  outcome: GameOutcome | null;

  // UI State
  roleVisible: boolean; // For single-device mode
  toggleRoleVisibility: () => void;

  // Sync Check (for debugging multi-device desyncs)
  getStateHash: () => string;
}
```

### Store Initialization Flow

```typescript
// 1. User enters/generates seed
setSeed('ABCD');

// 2. Initialize game content (called automatically by setSeed)
initializeGame() {
  const rng = new GameRNG(this.seed);

  // Select content deterministically
  this.selectedPacket = packets[rng.nextInt(0, packets.length)];
  this.selectedPenalty = penalties[rng.nextInt(0, penalties.length)];
  this.selectedRole = assignRole(rng, this.selectedPacket);
  this.selectedBackground = backgrounds[rng.nextInt(0, backgrounds.length)];
  this.inducerPattern = generateInducerPattern(rng);
  this.shuffledQuestions = rng.shuffle([...this.selectedPacket.questions]);
}

// 3. User selects mode
setMode(GameMode.MultiDevice);

// 4. User selects role (multi-device only)
setPlayerRole(PlayerRole.Investigator);

// 5. Advance through states
advanceState(); // SeedEntry → ModeSelection
advanceState(); // ModeSelection → RoleSelection
// ... etc
```

### State Hash for Sync Check

```typescript
getStateHash(): string {
  // Hash current game state for multi-device sync debugging
  const stateData = {
    seed: this.seed,
    gameState: this.gameState,
    selectedPacketId: this.selectedPacket?.id,
    selectedPenaltyId: this.selectedPenalty?.id,
    selectedRoleType: this.selectedRole?.roleType,
    selectedBackgroundId: this.selectedBackground?.id,
  };

  // Simple hash (first 8 chars of JSON string for display)
  return JSON.stringify(stateData)
    .split('')
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(16)
    .substring(0, 8);
}
```

---

## Data Relationships

```
Seed (4 letters)
  ↓ (deterministic selection via GameRNG)
  ├─→ Packet (1 of 11)
  │     └─→ Questions (shuffled order)
  │     └─→ Role variants
  ├─→ Penalty (1 of 18)
  ├─→ Background (1 of 30)
  ├─→ Role Assignment (Human 33%, PatientRobot 50%, ViolentRobot 17%)
  └─→ Inducer Pattern (5x5 maze)

Game Flow:
  Seed → Mode → Role → Calibration → Packet → Inducer → Background → Interview → Conclusion
                                                                          ↓
                                                                    Determination
                                                                          ↓
                                                                       Outcome
```

---

## TypeScript File Organization

```
src/types/
  ├── seed.ts           # Seed, SeedValidation
  ├── game-mode.ts      # GameMode, PlayerRole
  ├── game-state.ts     # GameState enum
  ├── packet.ts         # Packet, Question, PacketRole
  ├── role.ts           # RoleType, RoleAssignment, RobotFault
  ├── penalty.ts        # Penalty
  ├── background.ts     # Background
  ├── inducer.ts        # InducerPattern, Cell, Direction
  ├── outcome.ts        # Determination, GameOutcome
  └── index.ts          # Re-export all types

src/store/
  └── gameStore.ts      # Zustand store implementation
```

---

## Validation Rules Summary

| Entity | Validation |
|--------|------------|
| Seed | Exactly 4 uppercase letters (A-Z) |
| Question | Must have type, text, at least 1 example |
| Packet | Must have 6 questions (primary/secondary mix) |
| Role | Robots must have fault and traits |
| Inducer Pattern | Must be 5×5 grid with valid connections |
| Determination | Must match Determination enum values |

---

**Status**: ✅ Design Complete
**Next Step**: Implement TypeScript interfaces in `src/types/` directory
