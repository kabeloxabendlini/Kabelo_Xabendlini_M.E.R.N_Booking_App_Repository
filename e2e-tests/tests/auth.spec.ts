import { test, expect, Page } from '@playwright/test';

// Your real test credentials
const TEST_EMAIL = 'kabeloxabendlini385@gmail.com';
const TEST_PASSWORD = '4hggDeCucQc%**)';

test.describe('Authentication Flow', () => {

  // Helper function to login
  const login = async (page: Page) => {
  await page.goto('/');

  const signIn = page.getByText('Sign In');
  await expect(signIn).toBeVisible({ timeout: 20000 });
  await signIn.click();

  await page.locator('[name=email]').fill(TEST_EMAIL);
  await page.locator('[name=password]').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login/i }).click();

  await expect(
    page.getByRole('button', { name: 'Sign Out' })
  ).toBeVisible({ timeout: 20000 });
};

  test('should allow user to register', async ({ page }) => {
    const testEmail = `test_register_${Math.floor(Math.random() * 90000) + 10000}@test.com`;

    await page.goto('/');
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.getByRole('link', { name: 'Create an account here' }).click();

    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    await page.locator('[name=firstName]').fill('TestFirst');
    await page.locator('[name=lastName]').fill('TestLast');
    await page.locator('[name=email]').fill(testEmail);
    await page.locator('[name=password]').fill(TEST_PASSWORD);
    await page.locator('[name=confirmPassword]').fill(TEST_PASSWORD);

    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Registration Success!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });

  test('should allow user to login', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });

  test('should allow user to logout', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

});
