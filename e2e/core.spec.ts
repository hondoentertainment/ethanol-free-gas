import { test, expect } from "@playwright/test";

test("stations API returns a list", async ({ request }) => {
  const response = await request.get("/api/stations?limit=5");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(Array.isArray(body.stations)).toBeTruthy();
});

test("states directory loads", async ({ page }) => {
  await page.goto("/states");
  await expect(
    page.getByRole("heading", { name: /by region/i })
  ).toBeVisible();
});

test("station detail page renders server-side", async ({ page }) => {
  await page.goto("/station/demo-annapolis-marina");
  await expect(
    page.getByRole("heading", { name: /Annapolis Harbor Marina/i })
  ).toBeVisible();
});

test("station detail emits GasStation JSON-LD", async ({ page }) => {
  await page.goto("/station/demo-annapolis-marina");
  const ld = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(ld).toContain("GasStation");
});

test("premium page loads", async ({ page }) => {
  await page.goto("/premium");
  await expect(
    page.getByRole("heading", { name: /Premium listings/i })
  ).toBeVisible();
});

test("sitemap is served", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("xml");
});

test("unknown station shows 404 page", async ({ page }) => {
  await page.goto("/station/does-not-exist-zzz");
  await expect(page.getByText(/Page not found/i)).toBeVisible();
});

test("map list drawer opens", async ({ page }) => {
  await page.goto("/");
  const gotIt = page.getByRole("button", { name: "Got it" });
  if (await gotIt.isVisible()) {
    await gotIt.click();
  }
  await page.getByRole("button", { name: /List/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("florida guide links to region directory", async ({ page }) => {
  await page.goto("/guides/florida-e0-gas");
  await expect(page.getByRole("link", { name: /Florida directory/i })).toBeVisible();
});

test("footer includes sitemap link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sitemap" })).toBeVisible();
});

test("demo station detail shows verify section", async ({ page }) => {
  await page.goto("/station/demo-annapolis-marina");
  await expect(page.locator("#verify-station")).toBeVisible();
});
