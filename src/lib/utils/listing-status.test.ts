import { describe, expect, it } from "vitest";
import {
  getListingStatus,
  isNegativeListingStatus,
} from "@/lib/utils/listing-status";

describe("getListingStatus", () => {
  it("returns unknown when no report exists", () => {
    expect(getListingStatus(null)).toBe("unknown");
  });

  it("maps available to active", () => {
    expect(
      getListingStatus({ status: "available", created_at: new Date().toISOString() })
    ).toBe("active");
  });

  it("maps unavailable to no_e0", () => {
    expect(
      getListingStatus({
        status: "unavailable",
        created_at: new Date().toISOString(),
      })
    ).toBe("no_e0");
  });

  it("maps closed to closed", () => {
    expect(
      getListingStatus({ status: "closed", created_at: new Date().toISOString() })
    ).toBe("closed");
  });

  it("maps incorrect with business tag to closed", () => {
    expect(
      getListingStatus({
        status: "incorrect",
        created_at: new Date().toISOString(),
        notes: "[no_longer_in_business] Empty lot",
      })
    ).toBe("closed");
  });

  it("maps incorrect to needs_review", () => {
    expect(
      getListingStatus({
        status: "incorrect",
        created_at: new Date().toISOString(),
      })
    ).toBe("needs_review");
  });
});

describe("isNegativeListingStatus", () => {
  it("flags closed, no_e0, and needs_review", () => {
    expect(isNegativeListingStatus("closed")).toBe(true);
    expect(isNegativeListingStatus("no_e0")).toBe(true);
    expect(isNegativeListingStatus("needs_review")).toBe(true);
  });

  it("does not flag active or unknown", () => {
    expect(isNegativeListingStatus("active")).toBe(false);
    expect(isNegativeListingStatus("unknown")).toBe(false);
  });
});
