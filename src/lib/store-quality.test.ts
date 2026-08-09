import { describe, expect, it } from "vitest";
import { isGhostStore } from "./store-quality";

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
