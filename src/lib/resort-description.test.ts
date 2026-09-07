import { describe, expect, it } from "vitest";
import {
  buildResortDescription,
  buildResortMetaDescription,
} from "./resort-description";
import type { Resort } from "@/lib/data/resorts";
import type { StoreWithDistance } from "@/lib/resort-search";
import type { Store } from "@/types/store";

function makeResort(overrides: Partial<Resort> = {}): Resort {
  return {
    name: "Testberg",
    slug: "testberg",
    region: "Test Alps",
    country: "Testland",
    countryCode: "TL",
    lat: 47,
    lng: 11,
    ...overrides,
  };
}

function makeStore(
  overrides: Partial<Store> & { distance?: number } = {}
): StoreWithDistance {
  const { distance = 2, ...rest } = overrides;
  return {
    id: rest.slug ?? "id-1",
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
    ...rest,
    distance,
  };
}

describe("buildResortDescription", () => {
  it("returns nothing for a resort with no stores", () => {
    // Zero-store pages are noindexed and render their own empty state;
    // composed prose there would be padding around nothing.
    expect(buildResortDescription(makeResort(), [], 50)).toEqual([]);
  });

  it("distinguishes two resorts with similar store sets", () => {
    const stores = [
      makeStore({ slug: "a", city: "Town", distance: 1.2 }),
      makeStore({ slug: "b", city: "Town", distance: 3.4, services: ["rentals", "boot-fitting"] }),
    ];
    const a = buildResortDescription(makeResort({ slug: "alpville", name: "Alpville" }), stores, 30).join(" ");
    const b = buildResortDescription(makeResort({ slug: "schneedorf", name: "Schneedorf" }), stores, 30).join(" ");

    expect(a).not.toBe(b);
    const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
    const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
    const distinct =
      [...wordsA].filter((w) => !wordsB.has(w)).length +
      [...wordsB].filter((w) => !wordsA.has(w)).length;
    expect(distinct).toBeGreaterThan(2);
  });

  it("is deterministic per resort", () => {
    const stores = [makeStore({ slug: "a" }), makeStore({ slug: "b" })];
    const resort = makeResort();
    expect(buildResortDescription(resort, stores, 30)).toEqual(
      buildResortDescription(resort, stores, 30)
    );
  });

  it("names a top shop only when it has enough review evidence", () => {
    // A 5.0 from 3 reviews must not be crowned over a 4.6 from 400.
    const noisy = makeStore({
      slug: "noisy",
      name: "Noisy Five Star",
      winterstoresScore: 5,
      totalReviewCount: 3,
    });
    const proven = makeStore({
      slug: "proven",
      name: "Proven Shop",
      winterstoresScore: 4.6,
      totalReviewCount: 400,
    });
    const text = buildResortDescription(makeResort(), [noisy, proven], 30).join(" ");
    expect(text).toContain("Proven Shop");
    expect(text).not.toContain("Noisy Five Star");
  });

  it("mentions distinctive services with their counts", () => {
    const stores = [
      makeStore({ slug: "a", services: ["rentals", "boot-fitting"] }),
      makeStore({ slug: "b", services: ["rentals", "boot-fitting", "repairs"] }),
    ];
    const text = buildResortDescription(makeResort(), stores, 30).join(" ");
    expect(text).toContain("2 fit boots");
    expect(text).toContain("1 handles repairs"); // singular verb for a count of one
  });

  it("skips non-Latin city names rather than rendering them in English prose", () => {
    const stores = [
      makeStore({ slug: "a", city: "北安曇郡白馬村" }),
      makeStore({ slug: "b", city: "北安曇郡白馬村" }),
    ];
    const text = buildResortDescription(makeResort(), stores, 30).join(" ");
    expect(text).not.toContain("北安曇郡白馬村");
  });
});

describe("buildResortMetaDescription", () => {
  it("varies with the store set instead of repeating boilerplate", () => {
    const small = buildResortMetaDescription(
      makeResort(),
      [makeStore({ slug: "a" })],
      30
    );
    const large = buildResortMetaDescription(
      makeResort(),
      [
        makeStore({ slug: "a" }),
        makeStore({ slug: "b", services: ["rentals", "boot-fitting"] }),
      ],
      50
    );
    expect(small).not.toBe(large);
    expect(large).toContain("2 ski & snowboard shops");
    expect(large).toContain("50km");
  });

  it("stays within meta-description length on a large resort", () => {
    const stores = Array.from({ length: 41 }, (_, i) =>
      makeStore({
        slug: `s${i}`,
        services: ["rentals", "boot-fitting"],
        totalReviewCount: 500,
      })
    );
    const text = buildResortMetaDescription(makeResort(), stores, 30);
    expect(text.length).toBeLessThanOrEqual(170);
  });
});
