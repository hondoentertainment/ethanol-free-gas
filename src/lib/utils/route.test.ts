import { describe, expect, it } from "vitest";
import { distanceToPolylineMiles, sortStationsForDisplay } from "@/lib/utils/route";

describe("distanceToPolylineMiles", () => {
  it("returns 0 for a point on the polyline", () => {
    const polyline = [
      { lat: 38.0, lng: -76.0 },
      { lat: 39.0, lng: -76.0 },
    ];
    const distance = distanceToPolylineMiles({ lat: 38.5, lng: -76.0 }, polyline);
    expect(distance).toBeLessThan(0.01);
  });
});

describe("sortStationsForDisplay", () => {
  it("sorts premium stations first", () => {
    const sorted = sortStationsForDisplay([
      { is_premium: false, distance_miles: 1 },
      { is_premium: true, distance_miles: 10 },
    ]);
    expect(sorted[0].is_premium).toBe(true);
  });
});
