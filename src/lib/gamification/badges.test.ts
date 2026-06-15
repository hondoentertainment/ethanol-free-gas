import { describe, expect, it } from "vitest";
import {
  CONTRIBUTOR_BADGES,
  getBadgesForPoints,
  getTopBadge,
} from "@/lib/gamification/badges";

describe("contributor badges", () => {
  it("returns no badges below 25 points", () => {
    expect(getBadgesForPoints(10)).toHaveLength(0);
  });

  it("returns scout at 25 points", () => {
    const badges = getBadgesForPoints(25);
    expect(badges.map((b) => b.id)).toContain("scout");
  });

  it("returns highest earned badge", () => {
    expect(getTopBadge(120)?.id).toBe("explorer");
  });

  it("defines badges in ascending point order", () => {
    for (let i = 1; i < CONTRIBUTOR_BADGES.length; i++) {
      expect(CONTRIBUTOR_BADGES[i].minPoints).toBeGreaterThan(
        CONTRIBUTOR_BADGES[i - 1].minPoints
      );
    }
  });
});
