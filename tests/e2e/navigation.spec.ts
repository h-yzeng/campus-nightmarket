import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Night Market/i);
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should have accessible navigation links', async ({ page }) => {
    await page.goto('/');

    // Check that main navigation elements are present
    const loginLink = page.locator('text=Login');
    const signupLink = page.locator('text=Sign Up');

    await expect(loginLink).toBeVisible();
    await expect(signupLink).toBeVisible();

    // Verify links are keyboard accessible
    await loginLink.focus();
    await expect(loginLink).toBeFocused();
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveURL('/');

    await page.goto('/cart');
    await expect(page).toHaveURL('/');

    await page.goto('/orders');
    await expect(page).toHaveURL('/');

    await page.goto('/profile');
    await expect(page).toHaveURL('/');
  });

  test('should handle 404 routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // Should redirect to home for unauthenticated users
    await expect(page).toHaveURL('/');
  });
});
