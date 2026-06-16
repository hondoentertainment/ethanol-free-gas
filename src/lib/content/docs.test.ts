import { describe, expect, it } from "vitest";
import { DOCS, getDoc, getDocsByCategory } from "@/lib/content/docs";

describe("docs content", () => {
  it("has unique slugs", () => {
    const slugs = DOCS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves getting-started", () => {
    const doc = getDoc("getting-started");
    expect(doc?.title).toContain("Getting started");
  });

  it("groups by category", () => {
    const gettingStarted = getDocsByCategory("Getting started");
    expect(gettingStarted.length).toBeGreaterThan(0);
  });

  it("has related slugs that exist", () => {
    for (const doc of DOCS) {
      for (const related of doc.relatedSlugs ?? []) {
        expect(getDoc(related), `${doc.slug} → ${related}`).toBeDefined();
      }
    }
  });
});
