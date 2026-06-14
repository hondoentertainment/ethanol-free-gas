import { describe, expect, it } from "vitest";
import { haversineMiles } from "@/lib/utils/geo";
import { getVerificationLabel } from "@/lib/utils/verification";

describe("getVerificationLabel", () => {
  it("returns unverified when no verification exists", () => {
    expect(getVerificationLabel(null)).toBe("unverified");
  });

  it("returns verified_today for recent available verification", () => {
    const label = getVerificationLabel({
      status: "available",
      created_at: new Date().toISOString(),
    });
    expect(label).toBe("verified_today");
  });

  it("returns unverified for unavailable status", () => {
    const label = getVerificationLabel({
      status: "unavailable",
      created_at: new Date().toISOString(),
    });
    expect(label).toBe("unverified");
  });
});

describe("haversineMiles", () => {
  it("returns zero for identical coordinates", () => {
    expect(haversineMiles(38.97, -76.49, 38.97, -76.49)).toBe(0);
  });

  it("returns a positive distance for different coordinates", () => {
    const distance = haversineMiles(38.97, -76.49, 39.0, -76.4);
    expect(distance).toBeGreaterThan(0);
  });
});
