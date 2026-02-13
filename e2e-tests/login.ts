import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:5174/');
  await page.getByRole('link', { name: 'Sign In' }).click();

  await page.locator('[name=email]').fill('1@1.com');
  await page.locator('[name=password]').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for Sign Out to confirm login
  await page.getByRole('button', { name: 'Sign Out' }).waitFor({ timeout: 60000 });

  // Save login state
  await page.context().storageState({ path: 'storageState.json' });

  console.log('✅ Login successful, storageState.json created!');
  await browser.close();
})();
  