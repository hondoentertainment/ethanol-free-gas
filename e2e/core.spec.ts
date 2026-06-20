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
  // Dev server may stream a 200 for notFound(); production returns 404. Assert
  // on the rendered not-found content, which is reliable in both modes.
  await page.goto("/station/does-not-exist-zzz");
  await expect(page.getByText(/Page not found/i)).toBeVisible();
});
