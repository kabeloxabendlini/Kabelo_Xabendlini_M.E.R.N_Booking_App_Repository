import { test, expect } from '@playwright/test';

test.describe('Hotel Search & Booking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });

  test('should show hotel search results', async ({ page }) => {
    await page.getByPlaceholder('Where are you going?').fill('Dublin');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('Hotels found in Dublin')).toBeVisible();
    await expect(page.getByText('Dublin Getaways')).toBeVisible();
  });

  test('should show hotel detail', async ({ page }) => {
    await page.getByPlaceholder('Where are you going?').fill('Dublin');
    await page.getByRole('button', { name: 'Search' }).click();

    await page.getByText('Dublin Getaways').click();
    await expect(page).toHaveURL(/detail/);
    await expect(page.getByRole('button', { name: 'Book now' })).toBeVisible();
  });

  test('should book hotel', async ({ page }) => {
    await page.getByPlaceholder('Where are you going?').fill('Dublin');

    const date = new Date();
    date.setDate(date.getDate() + 3);
    const formattedDate = date.toISOString().split('T')[0];
    await page.getByPlaceholder('Check-out Date').fill(formattedDate);

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByText('Dublin Getaways').click();
    await page.getByRole('button', { name: 'Book now' }).click();

    await expect(page.getByText('Total Cost:')).toBeVisible();

    const stripeFrame = page.frameLocator('iframe').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('04/30');
    await stripeFrame.locator('[placeholder="CVC"]').fill('242');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('24225');

    await page.getByRole('button', { name: 'Confirm Booking' }).click();
    await expect(page.getByText('Booking Saved!')).toBeVisible();

    await page.getByRole('link', { name: 'My Bookings' }).click();
    await expect(page.getByText('Dublin Getaways')).toBeVisible();
  });
});
