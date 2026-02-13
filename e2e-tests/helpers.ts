import { Page } from "@playwright/test";
import path from "path";

export const UI_URL = "http://localhost:5174/";

export async function login(page: Page, email = "1@1.com", password = "password123") {
  await page.goto(UI_URL);
  await page.getByRole("link", { name: "Sign In" }).click();
  await page.locator("[name=email]").fill(email);
  await page.locator("[name=password]").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForSelector("text=Sign in Successful!");
}

export async function addHotel(
  page: Page,
  hotelName = "Test Hotel",
  city = "Test City",
  country = "Test Country",
  description = "This is a description",
  price = "100",
  starRating = "3",
  adultCount = "2",
  childCount = "0"
) {
  await page.goto(`${UI_URL}add-hotel`);
  await page.locator('[name="name"]').fill(hotelName);
  await page.locator('[name="city"]').fill(city);
  await page.locator('[name="country"]').fill(country);
  await page.locator('[name="description"]').fill(description);
  await page.locator('[name="pricePerNight"]').fill(price);
  await page.selectOption('select[name="starRating"]', starRating);
  await page.getByText("Budget").click();
  await page.getByLabel("Free Wifi").check();
  await page.getByLabel("Parking").check();
  await page.locator('[name="adultCount"]').fill(adultCount);
  await page.locator('[name="childCount"]').fill(childCount);
  await page.setInputFiles('[name="imageFiles"]', [
    path.join(__dirname, "files", "1.png"),
    path.join(__dirname, "files", "2.png"),
  ]);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector("text=Hotel Saved!");
}

export async function bookHotel(page: Page, hotelName = "Dublin Getaways") {
  await page.goto(UI_URL);
  await page.getByPlaceholder("Where are you going?").fill("Dublin");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByText(hotelName).click();
  await page.getByRole("button", { name: "Book now" }).click();

  // Fill Stripe card iframe
  const stripeFrame = page.frameLocator("iframe").first();
  await stripeFrame.locator('[placeholder="Card number"]').fill("4242424242424242");
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("04/30");
  await stripeFrame.locator('[placeholder="CVC"]').fill("242");
  await stripeFrame.locator('[placeholder="ZIP"]').fill("24225");

  await page.getByRole("button", { name: "Confirm Booking" }).click();
  await page.waitForSelector("text=Booking Saved!");
}
