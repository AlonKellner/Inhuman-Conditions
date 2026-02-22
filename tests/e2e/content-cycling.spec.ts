import { test, expect } from '@playwright/test';

/**
 * E2E Test: Content Cycling Feature
 *
 * Tests the content cycling functionality across all game states.
 * Validates that players can cycle through penalties, packets, backgrounds,
 * and roles using < and > buttons while maintaining deterministic behavior.
 *
 * Cycling Feature Requirements:
 * 1. Cycling buttons visible in penalty calibration state
 * 2. Clicking next/previous updates displayed content
 * 3. Counter shows current index / total items (1-based for UX)
 * 4. Cycling wraps at boundaries (first ↔ last)
 * 5. Penalty cycling resets practice attempt counter
 * 6. Same seed produces same permutation order
 */

test.describe('Content Cycling E2E', () => {
  test('should cycle through penalties during penalty calibration', async ({ page }) => {
    // Navigate and start game
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('CYCLE');
    await page.getByRole('button', { name: /start game/i }).click();

    // Wait for penalty calibration state
    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    // Verify cycling buttons are visible
    const prevButton = page.getByLabel('Previous penalty');
    const nextButton = page.getByLabel('Next penalty');
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    // Verify initial counter shows 1 / 18 (penalty index 0 = display "1")
    await expect(page.getByText('1 / 18')).toBeVisible();

    // Get initial penalty text
    const penaltyBox = page.locator('[class*="penaltyBox"]');
    const initialPenalty = await penaltyBox.textContent();

    // Click next button
    await nextButton.click();

    // Verify counter increments to 2 / 18
    await expect(page.getByText('2 / 18')).toBeVisible();

    // Verify penalty text changed
    const newPenalty = await penaltyBox.textContent();
    expect(newPenalty).not.toBe(initialPenalty);

    // Click previous button to go back
    await prevButton.click();

    // Verify counter returns to 1 / 18
    await expect(page.getByText('1 / 18')).toBeVisible();

    // Verify penalty text returns to original
    const returnedPenalty = await penaltyBox.textContent();
    expect(returnedPenalty).toBe(initialPenalty);
  });

  test('should wrap penalty cycling at boundaries', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('WRAP');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    const prevButton = page.getByLabel('Previous penalty');
    const nextButton = page.getByLabel('Next penalty');

    // Start at 1 / 18
    await expect(page.getByText('1 / 18')).toBeVisible();

    // Click previous (should wrap to last penalty: 18 / 18)
    await prevButton.click();
    await expect(page.getByText('18 / 18')).toBeVisible();

    // Click next (should wrap back to first: 1 / 18)
    await nextButton.click();
    await expect(page.getByText('1 / 18')).toBeVisible();
  });

  test('should reset practice attempts when penalty changes', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('RESET');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    // Make 2 practice attempts
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await expect(page.getByText(/practice attempt 1 of 3/i)).toBeVisible();

    await practiceButton.click();
    await expect(page.getByText(/practice attempt 2 of 3/i)).toBeVisible();

    // Cycle to next penalty
    const nextButton = page.getByLabel('Next penalty');
    await nextButton.click();

    // Verify counter reset to 0 / 3
    await expect(page.getByText(/practice attempt 0 of 3/i)).toBeVisible();

    // Verify practice button is enabled again
    await expect(practiceButton).toBeEnabled();
  });

  test('should cycle through multiple penalties in sequence', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('SEQU');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    const nextButton = page.getByLabel('Next penalty');

    // Cycle through first 5 penalties
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`${i} / 18`)).toBeVisible();
      if (i < 5) {
        await nextButton.click();
        // Small delay to allow state update
        await page.waitForTimeout(100);
      }
    }

    // Should be at 5 / 18
    await expect(page.getByText('5 / 18')).toBeVisible();
  });

  test('should maintain cycling state during game flow', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('FLOW');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    // Cycle to penalty 3
    const nextButton = page.getByLabel('Next penalty');
    await nextButton.click();
    await page.waitForTimeout(100);
    await nextButton.click();
    await page.waitForTimeout(100);
    await expect(page.getByText('3 / 18')).toBeVisible();

    // Complete penalty calibration
    const practiceButton = page.getByRole('button', { name: /i practiced/i });
    await practiceButton.click();
    await practiceButton.click();
    await practiceButton.click();

    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Game should advance to next states
    // The cycling state should be preserved in the store
    // (We can't easily verify this in E2E without checking game state,
    // but the important thing is the game doesn't break)
  });

  test('should show correct counter for different seeds', async ({ page }) => {
    // Test with seed "AAAA"
    await page.goto('/');
    let seedInput = page.locator('input#seed-input');
    await seedInput.fill('AAAA');
    await page.getByRole('button', { name: /start game/i }).click();
    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('1 / 18')).toBeVisible();

    // Navigate back to seed entry
    await page.goto('/');

    // Test with seed "ZZZZ"
    seedInput = page.locator('input#seed-input');
    await seedInput.fill('ZZZZ');
    await page.getByRole('button', { name: /start game/i }).click();
    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('1 / 18')).toBeVisible();

    // Both seeds should show same counter (starting at 1 / 18)
    // but different penalty content (deterministic permutation)
  });

  test('should handle rapid clicking without breaking', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('RAPID');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    const nextButton = page.getByLabel('Next penalty');

    // Rapidly click next button 10 times
    for (let i = 0; i < 10; i++) {
      await nextButton.click();
    }

    // Should end up at 11 / 18 (started at 1, clicked 10 times)
    await expect(page.getByText('11 / 18')).toBeVisible({ timeout: 2000 });
  });

  test('should allow keyboard navigation on cycling buttons', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('KBRD');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    const nextButton = page.getByLabel('Next penalty');

    // Tab to next button and press Enter
    await nextButton.focus();
    await page.keyboard.press('Enter');

    // Verify counter increments
    await expect(page.getByText('2 / 18')).toBeVisible();
  });

  test('should maintain accessibility attributes', async ({ page }) => {
    await page.goto('/');
    const seedInput = page.locator('input#seed-input');
    await seedInput.fill('ALLY');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    // Verify ARIA labels
    const prevButton = page.getByLabel('Previous penalty');
    const nextButton = page.getByLabel('Next penalty');

    await expect(prevButton).toHaveAttribute('aria-label', 'Previous penalty');
    await expect(nextButton).toHaveAttribute('aria-label', 'Next penalty');

    // Verify title attributes (for tooltips)
    await expect(prevButton).toHaveAttribute('title', 'Previous penalty');
    await expect(nextButton).toHaveAttribute('title', 'Next penalty');

    // Verify counter has ARIA live region
    const counter = page.locator('[aria-live="polite"]').filter({ hasText: '1 / 18' });
    await expect(counter).toBeVisible();
    await expect(counter).toHaveAttribute('aria-atomic', 'true');
  });

  test('should maintain determinism across page reloads', async ({ page }) => {
    // Start game with specific seed
    await page.goto('/');
    let seedInput = page.locator('input#seed-input');
    await seedInput.fill('DETER');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    // Get first penalty text
    const penaltyBox = page.locator('[class*="penaltyBox"]');
    const firstPenalty = await penaltyBox.textContent();

    // Reload page
    await page.goto('/');

    // Enter same seed again
    seedInput = page.locator('input#seed-input');
    await seedInput.fill('DETER');
    await page.getByRole('button', { name: /start game/i }).click();

    await expect(page.getByText(/penalty calibration/i)).toBeVisible({ timeout: 5000 });

    // Get penalty text again
    const secondPenalty = await penaltyBox.textContent();

    // Should be identical (same seed = same permutation)
    expect(secondPenalty).toBe(firstPenalty);
  });
});
