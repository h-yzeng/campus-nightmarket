# End-to-End Testing Guide

## Overview

This document provides instructions for setting up and running End-to-End (E2E) tests for the Campus Night Market application using Playwright.

## Setup

### Install Playwright

```bash
npm install -D @playwright/test @playwright/test-runner
npx playwright install
```

### Configuration

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Critical User Flows

### 1. Buyer Flow: Signup → Browse → Cart → Checkout → Order

**File**: `tests/e2e/buyer-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Buyer Complete Flow', () => {
  test('should complete full buyer journey', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Night Market/);

    // 2. Sign up
    await page.click('text=Sign Up');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.click('button[type="submit"]');

    // 3. Wait for redirect to browse
    await expect(page).toHaveURL(/.*browse/);

    // 4. Browse listings
    await expect(page.locator('[role="article"]').first()).toBeVisible();

    // 5. Add item to cart
    await page.click('button:has-text("Add +")').first();

    // 6. Open cart
    await page.click('[aria-label*="Shopping cart"]');

    // 7. Verify item in cart
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
    await expect(page.locator('[role="listitem"]')).toBeVisible();

    // 8. Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');

    // 9. Fill checkout form
    await expect(page).toHaveURL(/.*checkout/);
    await page.click('input[value="Cash"]');
    await page.fill('input[placeholder*="pickup time"]', '18:00');
    await page.fill('textarea[placeholder*="notes"]', 'Test order');

    // 10. Place order
    await page.click('button:has-text("Place Order")');

    // 11. Verify order confirmation
    await expect(page).toHaveURL(/.*orders/);
    await expect(page.locator('text=Order placed successfully')).toBeVisible();
  });
});
```

### 2. Seller Flow: Signup → Create Listing → Manage Orders

**File**: `tests/e2e/seller-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Seller Complete Flow', () => {
  test('should complete full seller journey', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('/');

    // 2. Sign up as seller
    await page.click('text=Sign Up');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'Seller123!');
    await page.fill('input[name="firstName"]', 'Seller');
    await page.fill('input[name="lastName"]', 'User');
    await page.check('input[name="isSeller"]');
    await page.click('button[type="submit"]');

    // 3. Navigate to seller dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 4. Create new listing
    await page.click('text=Create Listing');
    await page.fill('input[name="name"]', 'Test Pizza');
    await page.fill('textarea[name="description"]', 'Delicious test pizza');
    await page.fill('input[name="price"]', '12.99');
    await page.selectOption('select[name="location"]', 'Campus Center');
    await page.selectOption('select[name="category"]', 'Food');
    await page.setInputFiles('input[type="file"]', 'path/to/test-image.jpg');
    await page.click('button:has-text("Create Listing")');

    // 5. Verify listing created
    await expect(page.locator('text=Test Pizza')).toBeVisible();

    // 6. View listings
    await page.click('text=My Listings');
    await expect(page.locator('[data-testid="listing-card"]')).toBeVisible();

    // 7. Manage orders (when orders exist)
    await page.click('text=Orders');
    await expect(page).toHaveURL(/.*orders/);
  });
});
```

### 3. Authentication Flow

**File**: `tests/e2e/auth-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'ExistingUser123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*browse/);
    await expect(page.locator('text=Browse')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'ExistingUser123!');
    await page.click('button[type="submit"]');

    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Sign Out');

    await expect(page).toHaveURL('/');
  });
});
```

## Running Tests

### Run All E2E Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/buyer-flow.spec.ts
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Tests

```bash
npx playwright test --debug
```

### View Test Report

```bash
npx playwright show-report
```

## Best Practices

### 1. Use Data Test IDs

Add `data-testid` attributes to components for reliable selection:

```tsx
<button data-testid="add-to-cart-button">Add to Cart</button>
```

Then select in tests:

```typescript
await page.click('[data-testid="add-to-cart-button"]');
```

### 2. Wait for Network Requests

```typescript
// Wait for API call to complete
await page.waitForResponse(
  (response) => response.url().includes('/api/listings') && response.status() === 200
);
```

### 3. Use Page Object Model

Create reusable page objects:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// In test
const loginPage = new LoginPage(page);
await loginPage.login('test@example.com', 'Test123!');
```

### 4. Clean Up Test Data

```typescript
test.afterEach(async () => {
  // Delete test user
  // Clear test orders
  // Remove test listings
});
```

### 5. Mock External Services

For services like Firebase, payment gateways:

```typescript
await page.route('**/firestore/**', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true }),
  });
});
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Timing Out

Increase timeout in `playwright.config.ts`:

```typescript
use: {
  actionTimeout: 10000, // 10 seconds
  navigationTimeout: 30000, // 30 seconds
}
```

### Flaky Tests

Add explicit waits:

```typescript
await page.waitForSelector('[data-testid="order-list"]', { state: 'visible' });
```

### Screenshot on Failure

Already configured in `playwright.config.ts`:

```typescript
use: {
  screenshot: 'only-on-failure',
}
```

Screenshots saved to `test-results/` directory.

## Coverage Goals

- **Critical Flows**: 100% (signup, login, browse, cart, checkout, order)
- **Secondary Flows**: 80% (profile, listings management, reviews)
- **Edge Cases**: 60% (errors, validation, rate limiting)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
