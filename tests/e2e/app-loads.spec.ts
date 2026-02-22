import { test, expect } from '@playwright/test';

/**
 * E2E Test: Application Loads Without Errors
 *
 * This test verifies that the application builds and loads correctly.
 * It will FAIL if there are:
 * - Syntax errors in source files (like unescaped apostrophes in strings)
 * - Build errors that prevent the dev server from starting
 * - Runtime errors that prevent the app from rendering
 *
 * This test would have caught the apostrophe syntax error in packets.ts
 * because the Vite build would fail, preventing the server from starting.
 */

test.describe('Application Build and Load', () => {
  test('should build without errors and load the home page', async ({ page }) => {
    // Navigate to the application
    // If the build fails (e.g., syntax error), the webServer won't start
    // and this test will timeout and fail
    await page.goto('/');

    // Verify the page loaded by checking for the header
    const header = page.locator('header h1');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Inhuman Conditions');

    // Verify the subtitle is present
    const subtitle = page.locator('.subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('5-minute interrogation game');

    // Verify footer attribution is present
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Tommy Maranges and Cory O\'Brien');
    await expect(footer).toContainText('CC BY-NC-SA 4.0');
  });

  test('should render the seed entry screen', async ({ page }) => {
    await page.goto('/');

    // Verify the seed entry component renders
    // This ensures all game data files (packets, penalties, backgrounds) load without errors
    const seedInput = page.locator('input#seed-input');
    await expect(seedInput).toBeVisible();
    await expect(seedInput).toHaveAttribute('placeholder', 'ABCD');

    // Verify the seed generation buttons are present
    const timeBasedButton = page.getByRole('button', { name: /use time-based seed/i });
    await expect(timeBasedButton).toBeVisible();

    const randomizeButton = page.getByRole('button', { name: /randomize seed/i });
    await expect(randomizeButton).toBeVisible();

    // Verify the start game button is present
    const startButton = page.getByRole('button', { name: /start game/i });
    await expect(startButton).toBeVisible();
    // Start button should be disabled until a valid seed is entered
    await expect(startButton).toBeDisabled();
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto('/');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Game Flow', () => {
  test('should navigate through basic game flow', async ({ page }) => {
    await page.goto('/');

    // Enter a seed
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('TEST');

    // Start the game
    const startButton = page.getByRole('button', { name: /start game/i });
    await expect(startButton).toBeEnabled();
    await startButton.click();

    // The game should auto-advance through intermediate states
    // Wait for the "Setting up your game..." loading screen
    await expect(page.getByText(/setting up your game/i)).toBeVisible();

    // Wait for the interview state to appear (auto-advance should happen within a few seconds)
    // Look for either "Question" text or "Pass device" text
    const interviewContent = page.locator('text=/Question|Pass device/i').first();
    await expect(interviewContent).toBeVisible({ timeout: 10000 });

    // Verify we've reached the interview state
    // This verifies that all game data loads correctly (packets, penalties, backgrounds, roles)
    // If there were syntax errors in packets.ts, the data wouldn't load and this would fail
    const pageContent = await page.textContent('body');
    const hasInterviewContent =
      pageContent?.includes('Question') || pageContent?.includes('Pass device');

    expect(hasInterviewContent).toBe(true);
  });
});
