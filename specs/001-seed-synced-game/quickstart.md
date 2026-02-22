# Developer Quickstart Guide

**Feature**: Seed-Synced Inhuman Conditions Web Game
**Created**: 2026-02-22
**Audience**: New developers contributing to the project

Welcome! This guide will get you up and running with the Inhuman Conditions web game codebase in under 10 minutes.

## Prerequisites

- **Node.js**: v18.0+ or v20.0+ (LTS recommended)
- **npm**: v9.0+ (comes with Node.js)
- **Git**: Any recent version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

**Check your versions**:
```bash
node --version  # Should be v18+ or v20+
npm --version   # Should be v9+
git --version   # Any recent version
```

---

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/inhuman-conditions.git
cd inhuman-conditions

# Install dependencies
npm install
```

**What this installs**:
- React 18.3+ & TypeScript 5.3+
- Vite 5.x (build tool)
- Zustand (state management)
- seedrandom (deterministic RNG)
- Vitest (testing framework)
- React Testing Library (component tests)

---

### 2. Start Development Server

```bash
npm run dev
```

**Expected output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser. You should see the game's seed entry screen.

---

### 3. Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

**Expected**: All tests should pass ✓

---

## Project Structure (2 minutes)

```
inhuman-conditions/
├── .specify/               # Spec-kit paradigm files
│   ├── memory/
│   │   └── constitution.md # Project principles & non-negotiables
│   └── templates/          # Spec & plan templates
│
├── specs/                  # Feature specifications
│   └── 001-seed-synced-game/
│       ├── spec.md         # WHAT & WHY (requirements)
│       ├── plan.md         # HOW (implementation strategy)
│       ├── research.md     # Technology decisions & rationale
│       ├── data-model.md   # Entity definitions & Zustand store
│       ├── contracts/      # Public API contracts
│       └── quickstart.md   # This file
│
├── src/
│   ├── components/         # React components
│   │   ├── game/          # Game state components
│   │   ├── ui/            # Reusable UI components
│   │   └── tutorial/      # Tutorial flow
│   ├── data/              # Game data (packets, penalties, backgrounds)
│   ├── lib/               # Utilities (RNG, seed generation, inducer)
│   ├── store/             # Zustand store
│   ├── styles/            # Global styles & design tokens
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
│
├── tests/                 # Test files
│   ├── unit/
│   ├── integration/
│   └── test-utils.ts
│
├── public/                # Static assets
├── package.json
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Vitest configuration
└── tsconfig.json          # TypeScript configuration
```

---

## Core Concepts (3 minutes)

### 1. Seed-Based Synchronization

**The Problem**: How do we synchronize two devices without a server or WebRTC?

**The Solution**: A 4-letter seed (e.g., `ABCD`) deterministically generates all game content.

```typescript
import { GameRNG } from '@/lib/GameRNG';

const rng1 = new GameRNG('ABCD');
const rng2 = new GameRNG('ABCD');

// Same seed = identical outputs
rng1.nextInt(0, 100); // 42
rng2.nextInt(0, 100); // 42 (guaranteed)
```

**Key Files**:
- `src/lib/GameRNG.ts` - Deterministic random number generator
- `src/lib/seedGeneration.ts` - Seed creation from UTC time

---

### 2. State Machine Game Flow

The game progresses through 10 linear states:

```
SeedEntry → ModeSelection → RoleSelection → PenaltyCalibration →
PacketDisplay → InducerPuzzle → BackgroundDisplay → ReadyToStart →
Interview → Conclusion
```

**Manual Transitions**: Players click "Next" buttons to advance (no auto-progression).

**Key Files**:
- `src/store/gameStore.ts` - Zustand store managing state
- `src/components/GameStateMachine.tsx` - State orchestrator

---

### 3. Role-Based Views

Different players see different content based on their role:

| Role | Sees |
|------|------|
| **Investigator** | Questions, notes area, determination buttons |
| **Suspect** | Role type, traits, tasks, background, penalty |
| **Spectator** | Questions only (read-only, no secrets) |

**Key Files**:
- `src/components/game/Interview/InvestigatorView.tsx`
- `src/components/game/Interview/SuspectView.tsx`
- `src/components/game/Interview/SpectatorView.tsx`

---

### 4. Test-Driven Development (TDD)

We follow strict TDD methodology:

1. **Red**: Write failing test
2. **Green**: Implement minimal code to pass
3. **Refactor**: Improve without breaking tests

**Example**:
```typescript
// 1. RED - Write test first
describe('GameRNG', () => {
  it('produces identical outputs for same seed', () => {
    const rng1 = new GameRNG('SEED');
    const rng2 = new GameRNG('SEED');
    expect(rng1.nextInt(0, 10)).toBe(rng2.nextInt(0, 10));
  });
});

// 2. GREEN - Implement
export class GameRNG {
  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min)) + min;
  }
}

// 3. REFACTOR - Tests still pass ✓
```

**Coverage Targets**:
- Game logic (`src/lib/`): 100%
- Components (`src/components/`): 80%+

---

## Common Tasks

### Adding a New Component

```bash
# 1. Create component file
touch src/components/ui/MyComponent.tsx

# 2. Create test file
touch src/components/ui/MyComponent.test.tsx

# 3. Create styles (CSS Module)
touch src/components/ui/MyComponent.module.css
```

**Component Template**:
```typescript
import { FC } from 'react';
import styles from './MyComponent.module.css';

interface MyComponentProps {
  // Define props
}

export const MyComponent: FC<MyComponentProps> = (props) => {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
};
```

**Test Template**:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

---

### Using the Zustand Store

```typescript
import { useGameStore } from '@/store/gameStore';

function MyComponent() {
  // Subscribe to specific state (prevents unnecessary re-renders)
  const seed = useGameStore(state => state.seed);
  const gameState = useGameStore(state => state.gameState);

  // Access actions
  const setSeed = useGameStore(state => state.setSeed);
  const advanceState = useGameStore(state => state.advanceState);

  const handleClick = () => {
    setSeed('TEST');
    advanceState();
  };

  return <button onClick={handleClick}>Start Game</button>;
}
```

**API Reference**: See [contracts/game-state-api.md](./contracts/game-state-api.md)

---

### Running Specific Tests

```bash
# Run tests for specific file
npm test GameRNG

# Run tests in specific directory
npm test src/lib

# Run with coverage for specific file
npm run test:coverage -- GameRNG.test.ts
```

---

### Checking Code Quality

```bash
# Type checking
npm run type-check

# Linting (if configured)
npm run lint

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## Key Design Decisions

### Why Vite?
- ⚡ Faster HMR than Create React App
- 📦 Smaller production bundles
- 🌳 Better tree-shaking
- 📖 See [research.md](./research.md#1-build-tool-vite-vs-create-react-app)

### Why Zustand?
- 🪶 Tiny bundle (1KB vs Redux 13KB)
- 🎯 Less boilerplate
- 🔍 Excellent TypeScript inference
- 🛠️ Redux DevTools compatible
- 📖 See [research.md](./research.md#2-state-management-zustand-vs-redux-vs-context-api)

### Why CSS Modules?
- ⚡ Zero runtime overhead
- 🔒 Scoped styles (no collisions)
- 📘 TypeScript support
- 🎨 Design tokens via CSS custom properties
- 📖 See [research.md](./research.md#5-styling-css-modules-vs-styled-components-vs-tailwind)

---

## Troubleshooting

### Port 5173 Already in Use

```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

---

### Tests Fail with "Cannot find module"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### TypeScript Errors in IDE

```bash
# Restart TypeScript server (VSCode)
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"

# Or regenerate tsconfig paths
npm run type-check
```

---

## Next Steps

1. **Read the Constitution**: [.specify/memory/constitution.md](./.specify/memory/constitution.md)
   - Understand non-negotiable principles
   - Legal compliance (CC BY-NC-SA 4.0)
   - Code style guidelines

2. **Review the Spec**: [specs/001-seed-synced-game/spec.md](./spec.md)
   - User stories & acceptance criteria
   - Functional requirements
   - Success criteria

3. **Study the Plan**: [specs/001-seed-synced-game/plan.md](./plan.md)
   - Technical architecture
   - Implementation phases
   - File structure details

4. **Explore the Data Model**: [specs/001-seed-synced-game/data-model.md](./data-model.md)
   - Entity definitions
   - Zustand store shape
   - Type relationships

5. **Understand the API**: [specs/001-seed-synced-game/contracts/game-state-api.md](./contracts/game-state-api.md)
   - Store methods
   - Error handling
   - Testing patterns

6. **Pick a Task**: Check [specs/001-seed-synced-game/tasks.md](./tasks.md) (after `/speckit.tasks`)
   - Prioritized task list
   - Dependencies clearly marked
   - Acceptance criteria per task

---

## Getting Help

- **Documentation**: All specs and plans are in `specs/001-seed-synced-game/`
- **Code Comments**: Check inline comments in complex files
- **Git History**: `git log --oneline` to see implementation progression
- **Ask Questions**: Open an issue with `[QUESTION]` tag

---

## License & Attribution

This is a fan-made implementation of **Inhuman Conditions**, designed by Tommy Maranges and Cory O'Brien, illustrated by Mac Schubert.

**License**: CC BY-NC-SA 4.0
- ✅ Free to use and modify
- ❌ No commercial use
- ✅ Must credit original creators
- ❌ Cannot submit to app stores without approval

**Required Footer**:
```html
<footer>
  <p>
    <strong>Inhuman Conditions</strong> designed by Tommy Maranges and Cory O'Brien.
    Illustrated by Mac Schubert.
  </p>
  <p>
    Licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
      CC BY-NC-SA 4.0
    </a>
  </p>
</footer>
```

---

**Happy coding!** 🎮🤖

If you have questions, check the constitution, specs, or plan documents first. Most answers are already documented.
