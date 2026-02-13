import { test, expect } from '@playwright/test';
import path from 'path';


test.describe('Manage Hotels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-hotels');
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });

  test('should allow user to add a hotel', async ({ page }) => {
    await page.goto('/add-hotel');

    await page.locator('[name="name"]').fill('Test Hotel');
    await page.locator('[name="city"]').fill('Test City');
    await page.locator('[name="country"]').fill('Test Country');
    await page.locator('[name="description"]').fill('This is a description for Test Hotel');
    await page.locator('[name="pricePerNight"]').fill('100');
    await page.selectOption('select[name="starRating"]', '3');

    await page.getByText('Budget').click();
    await page.getByLabel('Free Wifi').check();
    await page.getByLabel('Parking').check();

    await page.locator('[name="adultCount"]').fill('2');
    await page.locator('[name="childCount"]').fill('4');

    await page.setInputFiles('[name="imageFiles"]', [
      path.join(__dirname, 'files', '1.png'),
      path.join(__dirname, 'files', '2.png'),
    ]);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Hotel Saved!')).toBeVisible();
  });

  test('should display hotels', async ({ page }) => {
    await page.goto('/my-hotels');
    await expect(page.getByRole('link', { name: 'Add Hotel' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible();
  });

  test('should edit hotel', async ({ page }) => {
    await page.goto('/my-hotels');
    await page.getByRole('link', { name: 'View Details' }).first().click();

    const nameInput = page.locator('[name="name"]');
    const originalName = await nameInput.inputValue();

    await nameInput.fill(`${originalName} UPDATED`);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Hotel Saved!')).toBeVisible();

    await page.reload();
    await expect(nameInput).toHaveValue(`${originalName} UPDATED`);

    // reset to original
    await nameInput.fill(originalName);
    await page.getByRole('button', { name: 'Save' }).click();
  });
});
  test('should delete hotel', async ({ page }) => {
    await page.goto('/my-hotels');
    await page.getByRole('link', { name: 'View Details' }).first().click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Are you sure you want to delete this hotel?');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Delete Hotel' }).click();
    await expect(page.getByText('Hotel Deleted!')).toBeVisible();
  });
