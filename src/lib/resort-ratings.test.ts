import { describe, expect, it } from "vitest";
import {
  RATINGS_METHOD,
  cappedWeightedMean,
  computeResortRatings,
  isSchoolOnlyName,
  snapshotToCsv,
  type RatingResortInput,
  type RatingStoreInput,
} from "./resort-ratings";

const META = { generatedAt: "2026-11-10", season: "2026/27" };

const resort = (name: string, lat: number, lng: number): RatingResortInput => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  region: "Test Region",
  country: "Testland",
  countryCode: "FR",
  lat,
  lng,
});

let n = 0;
const shop = (
  lat: number,
  lng: number,
  score: number,
  reviews: number,
  services: string[] = ["rentals"]
): RatingStoreInput => ({
  slug: `shop-${++n}`,
  name: `Shop ${n}`,
  city: "Town",
  latitude: lat,
  longitude: lng,
  score,
  reviews,
  services,
});

/** `count` shops at one point, each with the same score and review count. */
const cluster = (lat: number, lng: number, count: number, score: number, reviews: number) =>
  Array.from({ length: count }, () => shop(lat, lng, score, reviews));

describe("cappedWeightedMean", () => {
  it("weights by reviews", () => {
    expect(cappedWeightedMean([{ score: 5, reviews: 300 }, { score: 4, reviews: 100 }])).toBeCloseTo(4.75);
  });

  it("caps one shop's weight so a giant outlet cannot decide the result", () => {
    const cap = RATINGS_METHOD.reviewWeightCap;
    const mean = cappedWeightedMean([
      { score: 3, reviews: cap * 20 },
      { score: 5, reviews: cap },
    ]);
    // Both sit at the cap, so they count equally.
    expect(mean).toBeCloseTo(4);
  });

  it("returns 0 for no shops rather than NaN", () => {
    expect(cappedWeightedMean([])).toBe(0);
  });
});

describe("computeResortRatings", () => {
  const alpha = resort("Alpha", 46.0, 7.0);
  // ~8km east of Alpha: close enough that a 30km radius would share shops.
  const beta = resort("Beta", 46.0, 7.1);

  it("counts each shop once, for its nearest resort", () => {
    const stores = [...cluster(46.0, 7.0, 6, 4.8, 200), ...cluster(46.0, 7.1, 6, 4.2, 200)];
    const snap = computeResortRatings(stores, [alpha, beta], META);
    const a = snap.resorts.find((r) => r.slug === "alpha")!;
    const b = snap.resorts.find((r) => r.slug === "beta")!;

    expect(a.shops).toBe(6);
    expect(b.shops).toBe(6);
    expect(a.score).toBe(4.8);
    expect(b.score).toBe(4.2);
    expect(a.rank).toBe(1);
    expect(b.rank).toBe(2);
    expect(snap.totals.storesAssigned).toBe(12);
  });

  it("ignores shops beyond the radius of every resort", () => {
    // ~111km north.
    const far = cluster(47.0, 7.0, 6, 5, 200);
    const snap = computeResortRatings([...cluster(46.0, 7.0, 6, 4.5, 200), ...far], [alpha], META);
    expect(snap.totals.storesAssigned).toBe(6);
    expect(snap.resorts[0].score).toBe(4.5);
  });

  it("does not count shops with too few reviews, but still lists them", () => {
    const stores = [
      ...cluster(46.0, 7.0, 6, 4.5, 200),
      shop(46.0, 7.0, 1.0, RATINGS_METHOD.minShopReviews - 1),
    ];
    const r = computeResortRatings(stores, [alpha], META).resorts[0];
    expect(r.shops).toBe(6);
    expect(r.shopsListed).toBe(7);
    expect(r.score).toBe(4.5);
  });

  it("reports a resort without ranking it when the evidence is thin", () => {
    const fewShops = cluster(46.0, 7.0, RATINGS_METHOD.minShops - 1, 4.9, 1000);
    const fewReviews = cluster(46.0, 7.1, RATINGS_METHOD.minShops, 4.9, 30);
    const snap = computeResortRatings([...fewShops, ...fewReviews], [alpha, beta], META);

    expect(snap.totals.resortsRanked).toBe(0);
    for (const r of snap.resorts) {
      expect(r.rank).toBeNull();
      expect(r.score).toBe(4.9); // still shown, just not ranked
    }
  });

  it("gives a resort with no rated shop a null score, not 0", () => {
    const r = computeResortRatings([], [alpha], META).resorts[0];
    expect(r.score).toBeNull();
    expect(r.rank).toBeNull();
    expect(r.shops).toBe(0);
    expect(r.topShops).toEqual([]);
  });

  it("puts ranked resorts first, in rank order, then the rest by name", () => {
    const gamma = resort("Gamma", 46.0, 7.9);
    const stores = [
      ...cluster(46.0, 7.0, 6, 4.3, 200), // Alpha: ranked 2nd
      ...cluster(46.0, 7.9, 6, 4.9, 200), // Gamma: ranked 1st
    ];
    const snap = computeResortRatings(stores, [alpha, resort("Beta", 46.0, 7.45), gamma], META);
    expect(snap.resorts.map((r) => r.slug)).toEqual(["gamma", "alpha", "beta"]);
    expect(snap.resorts.map((r) => r.rank)).toEqual([1, 2, null]);
  });

  it("orders top shops so a handful of perfect reviews does not beat a proven shop", () => {
    const proven = shop(46.0, 7.0, 4.9, 900);
    const lucky = shop(46.0, 7.0, 5.0, 21);
    const stores = [...cluster(46.0, 7.0, 5, 4.4, 200), lucky, proven];
    const r = computeResortRatings(stores, [alpha], META).resorts[0];
    expect(r.topShops).toHaveLength(3);
    expect(r.topShops[0].slug).toBe(proven.slug);
  });

  it("counts services and the share of highly rated shops", () => {
    const stores = [
      shop(46.0, 7.0, 4.8, 200, ["rentals", "boot-fitting"]),
      shop(46.0, 7.0, 4.6, 200, ["rentals", "boot-fitting", "repairs"]),
      shop(46.0, 7.0, 4.5, 200, ["rentals"]),
      shop(46.0, 7.0, 4.4, 200, ["rentals"]),
      shop(46.0, 7.0, 4.0, 200, ["rentals"]),
    ];
    const r = computeResortRatings(stores, [alpha], META).resorts[0];
    expect(r.services).toEqual({ rentals: 5, "boot-fitting": 2, repairs: 1 });
    expect(r.shareHigh).toBe(0.6);
  });

  it("aggregates countries and areas over the same rated shops", () => {
    const stores = [...cluster(46.0, 7.0, 6, 4.8, 200), ...cluster(46.0, 7.1, 6, 4.2, 200)];
    const snap = computeResortRatings(stores, [alpha, beta], META);
    expect(snap.countries).toEqual([
      { name: "Testland", score: 4.5, shops: 12, reviews: 2400, resorts: 2 },
    ]);
    expect(snap.areas[0].name).toBe("The Alps");
    expect(snap.totals.meanScore).toBe(4.5);
  });
});

describe("isSchoolOnlyName", () => {
  it("flags names that are only a ski school, in several languages", () => {
    for (const name of [
      "Snowboardschule SMT Mayrhofen",
      "Skischule Garmisch-Partenkirchen",
      "Scuola Sci & Snowboard Snowdreamers Cortina",
      "Elevation – Școală Ski Poiana Brașov",
      "Escuela de Esquí Val De Ruda",
      "Schneesportschule Snow Plus Balderschwang",
    ]) {
      expect(isSchoolOnlyName(name), name).toBe(true);
    }
  });

  it("keeps shops that also teach, and shops with no school word at all", () => {
    for (const name of [
      "George Ski & Snowboard Bansko - School, Rent, Shop",
      "Skischule & Skiverleih Snowsports Mayrhofen",
      "COTA1700 - Alquiler, Escuela y Tienda de esquí en Baqueira",
      "R&J Ski School - Bootfitting Poiana Brasov",
      "No School Snowboard Shop",
      "High Life Bergsport GmbH & Alpinschule OG",
      "Christy Sports CB Treasury Center",
    ]) {
      expect(isSchoolOnlyName(name), name).toBe(false);
    }
  });

  it("leaves school-only listings out of the resort figures", () => {
    const school = { ...shop(46.0, 7.0, 5, 900), name: "Skischule Alpha" };
    const snap = computeResortRatings([...cluster(46.0, 7.0, 6, 4.4, 200), school], [resort("Alpha", 46.0, 7.0)], META);
    expect(snap.totals.schoolsExcluded).toBe(1);
    expect(snap.resorts[0].shops).toBe(6);
    expect(snap.resorts[0].shopsListed).toBe(6);
    expect(snap.resorts[0].score).toBe(4.4);
  });
});

describe("snapshotToCsv", () => {
  it("writes one row per resort and quotes names containing commas", () => {
    const tricky = { ...resort("Alta, Snowbird", 46.0, 7.0), slug: "alta-snowbird" };
    const snap = computeResortRatings(cluster(46.0, 7.0, 6, 4.7, 200), [tricky], META);
    const lines = snapshotToCsv(snap).trimEnd().split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[0].startsWith("rank,resort,country")).toBe(true);
    expect(lines[1]).toContain('"Alta, Snowbird"');
    expect(lines[1]).toContain("4.70");
    expect(lines[1]).toContain("https://winterstores.co/resorts/alta-snowbird");
  });
});
