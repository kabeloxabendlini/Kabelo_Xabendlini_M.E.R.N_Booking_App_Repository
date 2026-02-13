import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e-tests/storageState.json',
      },
    },
    {
      name: 'firefox',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: './e2e-tests/storageState.json',
      },
    },
    {
      name: 'webkit',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: './e2e-tests/storageState.json',
      },
    },
  ],

  use: {
  baseURL: 'http://localhost:5174',
  storageState: './e2e-tests/storageState.json',
  trace: 'on-first-retry',
},

  reporter: 'html',
});
