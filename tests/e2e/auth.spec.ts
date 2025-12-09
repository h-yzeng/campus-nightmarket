import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'nonexistent@hawk.illinoistech.edu');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.click('text=Login');
    await page.click('text=Forgot password');
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*signup/);

    await page.click('text=Log in');
    await expect(page).toHaveURL(/.*login/);
  });
});
