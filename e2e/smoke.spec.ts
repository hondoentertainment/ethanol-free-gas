import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ethanol-Free Fuel" }).first()
  ).toBeVisible();
});

test("health endpoint", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBeLessThan(600);
});

test("guides page", async ({ page }) => {
  await page.goto("/guides");
  await expect(page.getByRole("heading", { name: "Guides" })).toBeVisible();
});
