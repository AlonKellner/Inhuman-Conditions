# E2E Tests

## Purpose

These end-to-end (E2E) tests verify that the application builds and runs correctly. They catch errors that unit tests cannot detect, including:

1. **Syntax errors** in source files (e.g., unescaped apostrophes in strings)
2. **Build errors** that prevent the application from compiling
3. **Runtime errors** that prevent the application from loading
4. **Integration issues** between components and the game state machine

## How Syntax Errors Are Caught

The E2E tests catch syntax errors through the Playwright `webServer` configuration in `playwright.config.ts`:

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

**The Process:**

1. Before running any tests, Playwright executes `npm run dev` (which runs `vite`)
2. Vite builds the application using esbuild
3. If there are **syntax errors** (like the apostrophe in `packets.ts`), esbuild fails
4. The dev server **never starts**
5. Playwright cannot connect to `http://localhost:5173`
6. The tests **timeout and fail**

**Example:** The apostrophe error in `src/data/packets.ts`:

```typescript
// This would cause esbuild to fail:
prompt: 'Test the suspect's creative thinking',  // ❌ Unescaped apostrophe

// Expected '}' but found 's' at character position 157
```

When this syntax error exists:
- `npm run dev` fails with: `Error: Expected '}' but found 's'`
- The Vite dev server never starts
- All E2E tests fail with: `Error: Timed out waiting for http://localhost:5173`

## Test Coverage

### 1. Build Verification (`should build without errors and load the home page`)

Verifies:
- The application builds successfully (no syntax errors)
- The dev server starts
- The home page loads
- Critical elements render (header, subtitle, footer)

**Catches:** Syntax errors, build errors, missing dependencies

### 2. Seed Entry Screen (`should render the seed entry screen`)

Verifies:
- The seed input field renders
- All seed generation buttons are present
- The start button is initially disabled
- User can interact with the form

**Catches:** Component rendering errors, missing UI elements

### 3. Console Errors (`should not have console errors on load`)

Verifies:
- No JavaScript errors in the console
- No uncaught exceptions during page load
- Clean error-free runtime

**Catches:** Runtime errors, uncaught exceptions, React errors

### 4. Game Flow (`should navigate through basic game flow`)

Verifies:
- User can enter a seed and start a game
- The game advances through states correctly
- All game data loads (packets, penalties, backgrounds, roles)
- The interview screen eventually displays

**Catches:** State machine errors, data loading failures, integration issues

## Running E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (interactive)
npm run test:e2e:ui

# View the test report
npm run test:e2e:report
```

## Demonstrating Syntax Error Detection

To verify that the E2E tests catch syntax errors like the apostrophe issue:

1. **Introduce the syntax error**:
   ```bash
   # Edit src/data/packets.ts and change line 157 to use single quotes:
   prompt: 'Test the suspect's creative thinking',  # Broken
   ```

2. **Run the E2E tests**:
   ```bash
   npm run test:e2e
   ```

3. **Expected result**:
   ```
   Error: Timed out 120000ms waiting for http://localhost:5173
   ```

4. **Revert the change**:
   ```bash
   # Change back to double quotes:
   prompt: "Test the suspect's creative thinking",  # Fixed
   ```

5. **Run the tests again**:
   ```bash
   npm run test:e2e
   # All tests pass ✓
   ```

## CI/CD Integration

In continuous integration environments:

- E2E tests run on every commit
- Syntax errors cause immediate build failures
- No broken code can be merged to main
- Provides fast feedback to developers

The tests are configured to:
- Use only 1 worker in CI (sequential execution)
- Retry failed tests up to 2 times in CI
- Never reuse existing dev servers in CI (always fresh build)

## Performance

E2E tests are slower than unit tests because they:
- Build the entire application
- Start a dev server
- Launch a real browser
- Navigate through the UI

**Typical run time:** 3-10 seconds for all 4 tests

**Trade-off:** The added time is worth it because these tests catch errors that unit tests cannot detect.
