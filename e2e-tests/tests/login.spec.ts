import { test, expect } from '@playwright/test';

test('should see homepage after login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Find your next stay')).toBeVisible();
});

test('should allow searching hotels', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Where are you going?' }).fill('Dublin');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('Dublin Getaways')).toBeVisible();
});
