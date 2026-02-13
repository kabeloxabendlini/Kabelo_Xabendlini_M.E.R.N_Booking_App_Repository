import { chromium, firefox, webkit, BrowserType } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Credentials must be set in environment variables
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error('❌ Please set TEST_EMAIL and TEST_PASSWORD environment variables.');
}

// URL to your login page
const LOGIN_URL = 'http://localhost:5174/login';

// Where to save storage state
const STORAGE_DIR = path.resolve('./e2e-tests');
const STORAGE_PATH = path.join(STORAGE_DIR, 'storageState.json');

// List of browsers
const browsers: { name: string; type: BrowserType<any> }[] = [
  { name: 'chromium', type: chromium },
  { name: 'firefox', type: firefox },
  { name: 'webkit', type: webkit },
];

(async () => {
  // Ensure storage directory exists
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

  for (const browserInfo of browsers) {
    console.log(`🌐 Launching ${browserInfo.name}...`);
    const browser = await browserInfo.type.launch({ headless: !!process.env.CI });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`➡️  Navigating to login page for ${browserInfo.name}...`);
    await page.goto(LOGIN_URL);

    // Fill login form
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for post-login element
    await page.waitForSelector('button:has-text("Sign Out")', { timeout: 30000 });
    console.log(`✅ Logged in successfully on ${browserInfo.name}`);

    // Save storage state (overwrite for all browsers)
    await context.storageState({ path: STORAGE_PATH });
    console.log(`💾 storageState.json updated for ${browserInfo.name}`);

    await browser.close();
  }

  console.log('🎉 All browsers processed. You can now run your Playwright tests!');
})();
