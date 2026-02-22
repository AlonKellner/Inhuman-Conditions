# Inhuman Conditions

A static web version of **Inhuman Conditions**, the 5-minute social deduction interrogation game where an Investigator determines if a Suspect is human or robot.

> **Inhuman Conditions** designed by Tommy Maranges and Cory O'Brien.
> Illustrated by Mackenzie Schubert.
> Licensed under [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/)

## Features

- ✅ **Fully static** - No server required, works offline after initial load
- ✅ **Seed-based synchronization** - Play together on multiple devices using 4-letter seeds
- ✅ **Multiple play modes** - Single device, multi-device, timer-only
- ✅ **Authentic gameplay** - Based on the official game content from [robots.management](https://robots.management/)
- ✅ **Test-driven development** - Comprehensive unit and E2E test coverage
- ✅ **Modern tech stack** - React 18, TypeScript, Vite, Zustand

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Testing

```bash
# Run unit tests
npm test

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI (interactive)
npm run test:e2e:ui

# View E2E test report
npm run test:e2e:report
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## E2E Tests

The project includes end-to-end tests using Playwright that verify the application builds and runs correctly. These tests catch errors that unit tests cannot detect:

- **Syntax errors** in source files (e.g., unescaped apostrophes)
- **Build errors** that prevent compilation
- **Runtime errors** that prevent the application from loading
- **Integration issues** between components

### How E2E Tests Catch Syntax Errors

The E2E tests use Playwright's `webServer` configuration to start the Vite dev server before running tests. If there's a syntax error:

1. Vite's esbuild fails during the build
2. The dev server never starts
3. Playwright cannot connect to `http://localhost:5173`
4. All E2E tests fail with a timeout

**Example:** The apostrophe syntax error fixed in commit `a575166`:

```typescript
// This causes esbuild to fail:
prompt: 'Test the suspect's creative thinking',  // ❌ Syntax error

// Fixed version:
prompt: "Test the suspect's creative thinking",  // ✓ Works
```

When the syntax error exists, `npm run test:e2e` fails with:
```
Error: Timed out 120000ms waiting for http://localhost:5173
```

See [tests/e2e/README.md](tests/e2e/README.md) for complete E2E testing documentation.

### Verifying Syntax Error Detection

To demonstrate that E2E tests catch syntax errors:

```bash
# Run the verification script
./tests/e2e/verify-syntax-detection.sh
```

This script:
1. Temporarily introduces the apostrophe syntax error
2. Runs E2E tests (they fail)
3. Reverts the change
4. Runs E2E tests again (they pass)

## Project Structure

```
inhuman-conditions/
├── src/
│   ├── components/       # React components
│   │   ├── game/        # Game state components
│   │   └── ui/          # Reusable UI components
│   ├── data/            # Game data (packets, penalties, backgrounds)
│   ├── lib/             # Utilities (RNG, seed generation)
│   ├── store/           # Zustand state management
│   ├── styles/          # Global styles and design tokens
│   └── types/           # TypeScript definitions
│
├── tests/
│   ├── unit/            # Unit tests
│   └── e2e/             # End-to-end tests
│
├── specs/               # Spec-kit feature specifications
│   └── 001-seed-synced-game/
│       ├── spec.md      # Feature specification
│       ├── plan.md      # Implementation plan
│       ├── tasks.md     # Task breakdown
│       └── ...
│
└── public/              # Static assets
```

## Technology Stack

- **React 18.3+** - UI framework
- **TypeScript 5.3+** - Type safety
- **Vite 7.x** - Build tool and dev server
- **Zustand** - Lightweight state management
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **React Router v6** - Client-side routing (HashRouter for GitHub Pages)
- **CSS Modules** - Scoped styling
- **seedrandom** - Deterministic random number generation
- **date-fns** - UTC time manipulation

## Development Workflow

This project follows the **spec-kit paradigm** for feature development:

1. **Specify** - Create feature specification in `specs/`
2. **Plan** - Generate implementation plan with tech stack
3. **Tasks** - Break down into actionable tasks
4. **Implement** - Execute tasks following TDD methodology
5. **Verify** - Run tests to ensure correctness

All features are tracked in the `specs/` directory with complete documentation.

## License

This is a fan-made web implementation of Inhuman Conditions. The original game content is licensed under [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/).

**Attribution:**
- **Inhuman Conditions** designed by Tommy Maranges and Cory O'Brien
- Illustrated by Mackenzie Schubert
- Additional typesetting and layout by Sam Bertin & Tommy Maranges

This implementation is not affiliated with the original creators.

**Non-Commercial Use Only:** This project cannot be monetized or submitted to app stores without approval from the original creators.

## Contributing

This project uses:
- **Conventional Commits** for commit messages
- **TDD methodology** for all new features
- **Spec-kit paradigm** for feature planning
- **100% test coverage** for core game logic

See the [spec-kit documentation](https://github.com/spec-kit/spec-kit) for contribution guidelines.

## Links

- **Official Game**: [robots.management](https://robots.management/)
- **Original Web Implementation**: [RobotInterrogation GitHub](https://github.com/FTWinston/RobotInterrogation)
- **Report Issues**: [GitHub Issues](https://github.com/anthropics/claude-code)

---

Built following the spec-kit paradigm with test-driven development.
