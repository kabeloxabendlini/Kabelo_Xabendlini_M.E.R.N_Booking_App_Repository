import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

(async () => {
  const storagePath = path.resolve('./storageState.json');

  // Remove old storage state if it exists
  if (fs.existsSync(storagePath)) {
    fs.unlinkSync(storagePath);
    console.log('🗑️  Old storageState.json removed.');
  }

  // Launch browser
  const browser = await chromium.launch({ headless: !!process.env.CI });
  const page = await browser.newPage();

  console.log('🌐 Navigating to login page...');
  await page.goto('http://localhost:5174/login');

  // Fill in login credentials
  await page.fill('input[name="email"]', 'kabeloxabendlini385@gmail.com');
  await page.fill('input[name="password"]', '4hggDeCucQc%**)');

  // Submit login form
  await page.click('button[type="submit"]');

  // Wait for the "Sign Out" button as post-login confirmation
  const signOutButton = page.locator('button:has-text("Sign Out")');
  await signOutButton.waitFor({ timeout: 30000 });
  console.log('✅ Login successful!');

  // Save storage state for e2e tests
  await page.context().storageState({ path: storagePath });
  console.log(`💾 storageState.json has been created/updated at: ${storagePath}`);

  await browser.close();
})();


// import { test as setup, expect } from '@playwright/test';

// setup('authenticate user', async ({ page }) => {
//   const email = process.env.TEST_EMAIL;
//   const password = process.env.TEST_PASSWORD;

//   if (!email || !password) {
//     throw new Error('TEST_EMAIL / TEST_PASSWORD are not set');
//   }

//   await page.goto('/');

//   // Open login form (matches actual UI)
//   await page.getByRole('link', { name: 'Sign In' }).click();

//   await page.getByRole('textbox', { name: /email/i }).fill(email);
//   await page.getByRole('textbox', { name: /password/i }).fill(password);

//   await page.getByRole('button', { name: /login/i }).click();

//   await expect(
//     page.getByRole('button', { name: 'Sign Out' })
//   ).toBeVisible({ timeout: 30000 });

//   await page.context().storageState({
//     path: './e2e-tests/storageState.json',
//   });
// });