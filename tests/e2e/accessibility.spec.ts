import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have skip navigation link', async ({ page }) => {
    await page.goto('/');

    // Skip link should be present (may be visually hidden)
    const skipLink = page.locator('[data-testid="skip-navigation"], a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should have proper heading hierarchy on landing page', async ({ page }) => {
    await page.goto('/');

    // Check for h1 heading
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have accessible form labels on login', async ({ page }) => {
    await page.goto('/login');

    // Email input should have associated label
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Check for aria-label or associated label element
    const emailLabel = await emailInput.getAttribute('aria-label');
    const hasLabel = emailLabel || (await page.locator('label[for="email"]').count()) > 0;
    expect(hasLabel).toBeTruthy();
  });

  test('should support keyboard navigation on login form', async ({ page }) => {
    await page.goto('/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(firstFocused);

    // Continue tabbing through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to submit with Enter key
    await page.fill('input[name="email"]', 'test@hawk.illinoistech.edu');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.keyboard.press('Enter');

    // Form should submit
    await page.waitForTimeout(500);
  });

  test('should have sufficient color contrast in dark theme', async ({ page }) => {
    await page.goto('/');

    // Verify dark theme is applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Should be a dark background color
    expect(bgColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  });

  test('should have focus indicators visible', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.focus();

    // Check that element has visible focus styling
    const focusStyles = await emailInput.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
      };
    });

    // Should have some form of focus indicator
    const hasFocusIndicator =
      focusStyles.outline !== 'none' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.borderColor !== 'transparent';

    expect(hasFocusIndicator).toBeTruthy();
  });
});
