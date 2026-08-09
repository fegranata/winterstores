import { describe, expect, it } from "vitest";
import { buildStoreDescription, resolveStoreDescription } from "./store-description";
import type { Store } from "@/types/store";

function makeStore(overrides: Partial<Store> = {}): Store {
  return {
    id: "id-1",
    slug: "test-shop-town",
    name: "Test Shop",
    description: "",
    address: "1 Main St",
    city: "Town",
    region: "Region",
    country: "Country",
    countryCode: "CC",
    postalCode: "0000",
    latitude: 47,
    longitude: 11,
    sportTypes: ["skiing"],
    services: ["rentals"],
    priceLevel: 2,
    website: "https://example.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    phone: null,
    email: null,
    winterstoresScore: 4.5,
    totalReviewCount: 100,
    googlePlaceId: null,
    yelpBusinessId: null,
    facebookPageId: null,
    foursquareVenueId: null,
    photos: [],
    coverPhoto: null,
    isVerified: false,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("buildStoreDescription", () => {
  it("distinguishes two shops of the same chain in the same town", () => {
    // The whole reason this exists: these two pages previously differed by ten
    // words out of 288, and Google indexed neither.
    const a = buildStoreDescription(
      makeStore({ slug: "chain-zentrum", name: "Chain Zentrum", totalReviewCount: 511, winterstoresScore: 4.5 })
    );
    const b = buildStoreDescription(
      makeStore({ slug: "chain-outlet", name: "Chain Outlet", totalReviewCount: 83, winterstoresScore: 4.8 })
    );

    expect(a).not.toBe(b);

    const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
    const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
    const distinct = [...wordsA].filter((w) => !wordsB.has(w)).length +
      [...wordsB].filter((w) => !wordsA.has(w)).length;
    expect(distinct).toBeGreaterThan(5);
  });

  it("is stable for the same store", () => {
    const store = makeStore();
    expect(buildStoreDescription(store)).toBe(buildStoreDescription(store));
  });

  it("keeps the sentence slots decorrelated across slugs", () => {
    // Guards a real regression: with `h * 31 + c`, 31 ≡ 1 (mod 3) makes the
    // hash a digit sum, so every slot moved in lockstep and only 3 of the 27
    // possible phrasings ever appeared — a third of shops in the same town
    // read identically. Assert the joint distribution stays wide, not just
    // that two hand-picked slugs happen to differ.
    const shapes = new Set(
      Array.from({ length: 200 }, (_, i) =>
        buildStoreDescription(
          makeStore({ slug: `shop-number-${i}`, name: "Same Name" })
        )
      )
    );
    expect(shapes.size).toBeGreaterThanOrEqual(20); // 27 combinations exist
  });

  it("states the real services and score", () => {
    const text = buildStoreDescription(
      makeStore({ services: ["boot-fitting", "waxing"], winterstoresScore: 4.2, totalReviewCount: 37 })
    );
    expect(text).toContain("boot fitting");
    expect(text).toContain("waxing and tuning");
    expect(text).toContain("4.2");
    expect(text).toContain("37");
  });

  it("omits the rating sentence when there are no reviews", () => {
    const text = buildStoreDescription(makeStore({ totalReviewCount: 0 }));
    expect(text).not.toContain("WinterStores Score");
    expect(text).not.toContain("out of 5");
  });

  it("mentions a nearby resort but not a distant one", () => {
    const near = buildStoreDescription(makeStore(), {
      nearestResort: { name: "Nearby Peak", distanceKm: 4 },
    });
    expect(near).toContain("Nearby Peak");

    const far = buildStoreDescription(makeStore(), {
      nearestResort: { name: "Distant Peak", distanceKm: 250 },
    });
    expect(far).not.toContain("Distant Peak");
  });

  it("never emits a dangling or malformed sentence", () => {
    const text = buildStoreDescription(makeStore({ services: [], sportTypes: [] }));
    expect(text).not.toMatch(/\s{2,}/);
    expect(text).not.toContain("undefined");
    expect(text.trim()).toMatch(/\.$/);
  });
});

describe("resolveStoreDescription", () => {
  it("prefers hand-written copy over a composed one", () => {
    const written = "A genuinely hand-written description.";
    expect(resolveStoreDescription(makeStore({ description: written }))).toBe(written);
  });

  it("falls back when the description is blank or whitespace", () => {
    const result = resolveStoreDescription(makeStore({ description: "   " }));
    expect(result).toBeTruthy();
    expect(result).toContain("Test Shop");
  });
});
