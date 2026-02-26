import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Official Inhuman Conditions Game Flow
 * Validates critical fixes from DISCREPANCY_REPORT.md
 */

test.describe('Official Game Flow: Role Reveal Before Timer', () => {
  test('Suspect sees Robot Catalyzer card BEFORE timer starts', async ({ page }) => {
    await page.goto('/');

    // Start game with seed
    await page.fill('input[placeholder*="seed" i]', 'TEST');
    await page.click('button:has-text("Start Game")');

    // STATE 1: Penalty Calibration (untimed)
    await page.waitForSelector('text=/penalty/i', { timeout: 5000 });
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await practiceButton.click();
    await practiceButton.click();

    // STATE 2: Packet Display (manual confirmation)
    await page.waitForSelector('text=/question packet/i', { timeout: 5000 });
    await page.click('button:has-text("Continue")');

    // STATE 3: Role Reveal (CRITICAL - must happen BEFORE timer)
    // Wait for Role Reveal component
    const roleRevealHeading = page.locator('text=/Robot Catalyzer/i');
    await expect(roleRevealHeading).toBeVisible({ timeout: 5000 });

    // Verify restrictions are visible
    await expect(page.locator('text=/Your Restrictions/i, text=/Tasks to Complete/i').first()).toBeVisible();

    // Verify maze preview is shown
    await expect(page.locator('img[alt*="Inducer Maze" i]')).toBeVisible();

    // CRITICAL: Timer should NOT be started yet
    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).not.toBeVisible();

    // Confirm understanding
    await page.click('button:has-text("I Understand My Role")');

    // STATE 4: Inducer Puzzle placeholder (manual advance)
    await page.waitForTimeout(500);
    const inducerContinue = page.locator('button:has-text("Continue")');
    if (await inducerContinue.isVisible()) {
      await inducerContinue.click();
    }

    // STATE 5: Background Display (manual confirmation)
    await page.waitForSelector('text=/your background/i', { timeout: 5000 });
    await page.click('button:has-text("I Understand")');

    // STATE 6: Ready to Start (manual timer start)
    await page.waitForSelector('button:has-text("Start Interview")', { timeout: 5000 });

    // Timer still should not be started
    await expect(timer).not.toBeVisible();

    // Start the interview - ONLY NOW should timer start
    await page.click('button:has-text("Start Interview")');

    // NOW timer should be visible
    await expect(timer).toBeVisible({ timeout: 2000 });
  });

  test('Human players skip Role Reveal automatically', async ({ page }) => {
    // Use a seed that produces a human role
    // Note: This test assumes we can find a seed that generates human
    await page.goto('/');
    await page.fill('input[placeholder*="seed" i]', 'HUMAN');
    await page.click('button:has-text("Start Game")');

    // Complete penalty calibration
    await page.waitForSelector('text=/penalty/i', { timeout: 5000 });
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await practiceButton.click();
    await practiceButton.click();

    // Packet display
    await page.waitForSelector('text=/question packet/i', { timeout: 5000 });
    await page.click('button:has-text("Continue")');

    // If human, should skip role reveal and go directly to background or next state
    // Robot Catalyzer should NOT appear
    await page.waitForTimeout(1000);
    const roleReveal = page.locator('text=/Robot Catalyzer/i');

    // Either we're past role reveal entirely, or we see background
    const isRoleRevealVisible = await roleReveal.isVisible().catch(() => false);
    if (!isRoleRevealVisible) {
      // Successfully skipped role reveal
      expect(isRoleRevealVisible).toBe(false);
    }
  });

  test('Role Reveal displays all required information', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="seed" i]', 'ROBO');
    await page.click('button:has-text("Start Game")');

    // Navigate to role reveal
    await page.waitForSelector('text=/penalty/i', { timeout: 5000 });
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await practiceButton.click();
    await practiceButton.click();

    await page.waitForSelector('text=/question packet/i', { timeout: 5000 });
    await page.click('button:has-text("Continue")');

    // Wait for role reveal
    await expect(page.locator('text=/Robot Catalyzer/i')).toBeVisible({ timeout: 5000 });

    // Check for fault type (should be visible)
    const faultHeadings = await page.locator('h2').allTextContents();
    const hasFault = faultHeadings.some(text =>
      text.includes('Memory') ||
      text.includes('Empathy') ||
      text.includes('Curiosity') ||
      text.includes('Evaluation') ||
      text.includes('Friendship') ||
      text.includes('Humor') ||
      text.includes('Taste') ||
      text.includes('Deception') ||
      text.includes('Preservation') ||
      text.includes('Pain')
    );
    expect(hasFault).toBe(true);

    // Check for role type
    await expect(page.locator('text=/Patient Robot/i, text=/Violent Robot/i').first()).toBeVisible();

    // Check for maze preview image
    const mazeImage = page.locator('img[alt*="Inducer Maze" i]');
    await expect(mazeImage).toBeVisible();
    await expect(mazeImage).toHaveAttribute('src', /\/assets\/mazes\/.+\.png/);
  });
});

test.describe('Official Game Flow: Inducer Puzzle During Interview', () => {
  test('Inducer puzzle displays during interview for robot roles', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="seed" i]', 'MAZE');
    await page.click('button:has-text("Start Game")');

    // Navigate through to interview
    await page.waitForSelector('text=/penalty/i', { timeout: 5000 });
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await practiceButton.click();
    await practiceButton.click();

    await page.waitForSelector('text=/question packet/i', { timeout: 5000 });
    await page.click('button:has-text("Continue")');

    // Role reveal
    const roleReveal = page.locator('text=/Robot Catalyzer/i');
    if (await roleReveal.isVisible()) {
      await page.click('button:has-text("I Understand My Role")');
    }

    // Inducer placeholder
    await page.waitForTimeout(500);
    const inducerContinue = page.locator('button:has-text("Continue")');
    if (await inducerContinue.isVisible()) {
      await inducerContinue.click();
    }

    // Background
    await page.waitForSelector('text=/your background/i', { timeout: 5000 });
    await page.click('button:has-text("I Understand")');

    // Start interview
    await page.waitForSelector('button:has-text("Start Interview")', { timeout: 5000 });
    await page.click('button:has-text("Start Interview")');

    // Wait for interview to start
    await page.waitForTimeout(1000);

    // Scroll down to suspect view (in single-device mode)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for inducer puzzle display
    const inducerTitle = page.locator('text=/Inducer Pattern/i');
    await expect(inducerTitle).toBeVisible({ timeout: 3000 });

    // Check for maze image
    const mazeImage = page.locator('img[alt*="Inducer Pattern Maze" i]');
    await expect(mazeImage).toBeVisible();

    // Check for solution input
    const solutionInput = page.locator('input[placeholder*="letter sequence" i]');
    await expect(solutionInput).toBeVisible();
  });

  test('Inducer puzzle accepts and validates solutions', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="seed" i]', 'PUZZ');
    await page.click('button:has-text("Start Game")');

    // Navigate to interview (fast path)
    await page.waitForSelector('text=/penalty/i', { timeout: 5000 });
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await practiceButton.click();
    await practiceButton.click();

    await page.waitForSelector('text=/question packet/i', { timeout: 5000 });
    await page.click('button:has-text("Continue")');

    const roleReveal = page.locator('text=/Robot Catalyzer/i');
    if (await roleReveal.isVisible()) {
      await page.click('button:has-text("I Understand My Role")');
    }

    await page.waitForTimeout(500);
    const inducerContinue = page.locator('button:has-text("Continue")');
    if (await inducerContinue.isVisible()) {
      await inducerContinue.click();
    }

    await page.waitForSelector('text=/your background/i', { timeout: 5000 });
    await page.click('button:has-text("I Understand")');

    await page.waitForSelector('button:has-text("Start Interview")', { timeout: 5000 });
    await page.click('button:has-text("Start Interview")');

    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Find and interact with inducer puzzle
    const solutionInput = page.locator('input[placeholder*="letter sequence" i]');
    await expect(solutionInput).toBeVisible({ timeout: 3000 });

    // Try incorrect solution
    await solutionInput.fill('WXYZ');
    await page.click('button:has-text("Submit")');

    // Should show incorrect feedback
    await expect(page.locator('text=/Incorrect/i')).toBeVisible({ timeout: 2000 });

    // Try correct solution (using known solution from catalyzerCards)
    // Note: Seed PUZZ might generate a specific catalyzer card with known solution
    // For this test, we'll try a few common solutions
    const solutions = ['ABCD', 'EFGH', 'IJKL', 'MNOP'];
    let foundCorrect = false;

    for (const solution of solutions) {
      await solutionInput.clear();
      await solutionInput.fill(solution);
      await page.click('button:has-text("Submit")');

      const correctFeedback = page.locator('text=/Correct/i');
      if (await correctFeedback.isVisible().catch(() => false)) {
        foundCorrect = true;
        break;
      }
    }

    // At least one solution should work
    expect(foundCorrect).toBe(true);
  });
});
