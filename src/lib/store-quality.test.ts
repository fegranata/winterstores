import { describe, expect, it } from "vitest";
import { isGhostStore, isIndexableStore } from "./store-quality";

describe("isIndexableStore", () => {
  const base = {
    website: "https://shop.example",
    totalReviewCount: 120,
    services: ["rentals"],
    description: "",
  };

  it("requires real review activity", () => {
    expect(isIndexableStore({ ...base, totalReviewCount: 19, services: ["rentals", "boot-fitting"] })).toBe(false);
    expect(isIndexableStore({ ...base, totalReviewCount: 20, services: ["rentals", "boot-fitting"] })).toBe(true);
  });

  it("treats a rentals-only service profile as no distinguishing signal", () => {
    // Nearly every shop rents gear; it is the composed-description boilerplate
    // Google already declined to index.
    expect(isIndexableStore(base)).toBe(false);
    expect(isIndexableStore({ ...base, services: [] })).toBe(false);
    expect(isIndexableStore({ ...base, services: ["rentals", "waxing"] })).toBe(true);
    expect(isIndexableStore({ ...base, services: ["boot-fitting"] })).toBe(true);
  });

  it("accepts a hand-written description in place of a service profile", () => {
    const written = "Family-run shop in the village centre with a dedicated boot-fitting bench and a demo fleet.";
    expect(isIndexableStore({ ...base, description: written })).toBe(true);
    expect(isIndexableStore({ ...base, description: "Ski shop." })).toBe(false);
  });

  it("never indexes a ghost, whatever else it has", () => {
    expect(
      isIndexableStore({ website: null, totalReviewCount: 2, services: ["boot-fitting"], description: "" })
    ).toBe(false);
  });

  it("tolerates missing fields during static generation", () => {
    expect(
      isIndexableStore({
        website: "https://shop.example",
        totalReviewCount: NaN,
        services: undefined,
        description: null,
      })
    ).toBe(false);
  });
});

describe("isGhostStore", () => {
  it("only excludes listings with neither a website nor reviews", () => {
    expect(isGhostStore({ website: null, totalReviewCount: 0 })).toBe(true);
    expect(isGhostStore({ website: "", totalReviewCount: 4 })).toBe(true);
    expect(isGhostStore({ website: "   ", totalReviewCount: 1 })).toBe(true);
  });

  it("keeps anything with a website, however few reviews", () => {
    expect(isGhostStore({ website: "https://shop.example", totalReviewCount: 0 })).toBe(false);
  });

  it("keeps anything with real review activity, even with no website", () => {
    expect(isGhostStore({ website: null, totalReviewCount: 5 })).toBe(false);
    expect(isGhostStore({ website: null, totalReviewCount: 900 })).toBe(false);
  });

  it("treats a missing review count as zero rather than throwing", () => {
    // These pages render during static generation; a bad value must not fail
    // the build.
    expect(
      isGhostStore({ website: null, totalReviewCount: undefined as unknown as number })
    ).toBe(true);
    expect(
      isGhostStore({ website: null, totalReviewCount: NaN })
    ).toBe(true);
  });
});
