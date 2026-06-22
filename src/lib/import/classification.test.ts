import { describe, expect, it } from "vitest";
import { inferClassification } from "@/lib/import/classification";

describe("inferClassification", () => {
  it("classifies marinas as boat", () => {
    expect(inferClassification("Harbor Marina Fuel Dock")).toBe("boat");
  });

  it("classifies gas stations as car", () => {
    expect(inferClassification("Sheetz #123")).toBe("car");
  });

  it("classifies dual-access locations", () => {
    expect(
      inferClassification("Shell Marina & Gas Station", "boat dock and car pumps")
    ).toBe("dual");
  });
});
