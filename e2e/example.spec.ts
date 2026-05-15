import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VetGo/);
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');
    // Add more specific assertions based on your page structure
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should have signin page', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page).toHaveTitle(/Sign In/);
  });

  test('should have signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page).toHaveTitle(/Sign Up/);
  });
});
