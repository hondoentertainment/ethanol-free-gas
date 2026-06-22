import type { Page } from "@playwright/test";

export async function dismissOnboardingIfPresent(page: Page) {
  const gotIt = page.getByRole("button", { name: "Got it" });
  try {
    await gotIt.waitFor({ state: "visible", timeout: 5000 });
    await gotIt.click();
    await gotIt.waitFor({ state: "hidden", timeout: 5000 });
  } catch {
    // Onboarding already completed for this browser session.
  }
}
