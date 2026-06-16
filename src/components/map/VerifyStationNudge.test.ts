import { describe, expect, it } from "vitest";
import { VERIFICATION_ONBOARDING_GOAL } from "@/components/map/VerifyStationNudge";

describe("VERIFICATION_ONBOARDING_GOAL", () => {
  it("is a positive onboarding target", () => {
    expect(VERIFICATION_ONBOARDING_GOAL).toBeGreaterThan(0);
    expect(VERIFICATION_ONBOARDING_GOAL).toBe(5);
  });
});
