/**
 * Resort-level shop ratings: the computation behind /reports.
 *
 * Pure and dependency-free on purpose. It runs once, offline, in
 * scripts/build-resort-ratings.ts, which freezes the result into
 * src/lib/data/resort-ratings.json. Pages read that snapshot — no page render
 * ever queries the database for this (HANDOVER.md: anything per-render is
 * multiplied by traffic we do not control).
 *
 * Method, in the order it is applied:
 *  1. Each shop is counted once, for the NEAREST resort, and only if that
 *     resort is within RADIUS_KM. The resort pages list every shop within
 *     30km, so neighbouring resorts share shops there; a ranking built that
 *     way gives Courchevel and La Plagne the identical score. Nearest-resort
 *     assignment makes the sets disjoint.
 *  2. A shop needs MIN_SHOP_REVIEWS reviews to count ("rated"), and a
 *     listing whose name identifies it only as a ski school is left out: the
 *     directory holds a few, they rate very highly, and "top-rated shop:
 *     Snowboardschule …" is not something a shop ranking should say.
 *  3. A resort's score is the review-weighted mean of its rated shops, with
 *     each shop's weight capped at REVIEW_WEIGHT_CAP so one outlet with
 *     thousands of reviews cannot decide a resort's result on its own
 *     (uncapped, a single 2,000-review store moved Oberstdorf by 0.16).
 *  4. A resort is ranked only with MIN_SHOPS rated shops and
 *     MIN_RESORT_REVIEWS reviews between them. The rest are reported as
 *     "not enough data", never ranked.
 */
import { haversineDistance } from "./geo";

export const RATINGS_METHOD = {
  radiusKm: 25,
  minShopReviews: 20,
  reviewWeightCap: 500,
  minShops: 5,
  minResortReviews: 500,
  /** Prior weight used only to order a resort's "top shops" list. */
  topShopPriorReviews: 50,
} as const;

export interface RatingResortInput {
  name: string;
  slug: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export interface RatingStoreInput {
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  score: number;
  reviews: number;
  services: string[];
}

export interface ResortShop {
  slug: string;
  name: string;
  city: string;
  score: number;
  reviews: number;
  distanceKm: number;
}

export interface ResortRating {
  slug: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  area: string;
  /** 1-based position among ranked resorts; null when there is not enough data. */
  rank: number | null;
  /** Capped review-weighted mean, 2 decimals; null with no rated shop. */
  score: number | null;
  /** Rated shops counted towards the score. */
  shops: number;
  /** Every shop assigned to this resort, rated or not. */
  shopsListed: number;
  /** Reviews across the rated shops (uncapped — this is the evidence base). */
  reviews: number;
  /** Share of rated shops scoring 4.5 or higher, 0–1, 2 decimals. */
  shareHigh: number;
  /** Rated shops per service tag. */
  services: Record<string, number>;
  /** Up to three, ordered by a review-count-adjusted score. */
  topShops: ResortShop[];
}

export interface GroupRating {
  name: string;
  score: number;
  shops: number;
  reviews: number;
  resorts: number;
}

export interface ResortRatingsSnapshot {
  generatedAt: string;
  season: string;
  method: typeof RATINGS_METHOD;
  totals: {
    stores: number;
    storesAssigned: number;
    storesRated: number;
    /** Listings left out because their name identifies them only as a ski school. */
    schoolsExcluded: number;
    reviews: number;
    resorts: number;
    resortsRanked: number;
    meanScore: number;
  };
  resorts: ResortRating[];
  countries: GroupRating[];
  areas: GroupRating[];
}

/** Broad areas a reader actually compares within ("best in the Alps"). */
const AREA_BY_COUNTRY: Record<string, string> = {
  FR: "The Alps",
  CH: "The Alps",
  AT: "The Alps",
  IT: "The Alps",
  DE: "The Alps",
  SI: "The Alps",
  US: "North America",
  CA: "North America",
  JP: "Japan",
  SE: "Scandinavia",
  NO: "Scandinavia",
  FI: "Scandinavia",
  PL: "Eastern Europe",
  BG: "Eastern Europe",
  RO: "Eastern Europe",
  ES: "Pyrenees & Iberia",
  AD: "Pyrenees & Iberia",
  AR: "Southern Hemisphere",
  CL: "Southern Hemisphere",
  NZ: "Southern Hemisphere",
  AU: "Southern Hemisphere",
  GB: "Scotland",
  KR: "South Korea",
};

export function areaForCountry(countryCode: string): string {
  return AREA_BY_COUNTRY[countryCode] ?? "Other";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const SCHOOL_WORDS =
  /(schule\b|\bschool\b|scuola|[ée]cole|\besf\b|escuela|escola|[sș]coal[aă]|szko[lł]a|skiskole|skidskola|hiihtokoulu)/i;
const SHOP_WORDS =
  /(rent|verleih|shop|store|noleggio|location|hire|[iî]nchirieri|alquiler|lloguer|wypo[zż]yczalnia|utleie|uthyrning|vuokra|sport(?!schule)|outlet|boutique|magasin|tienda|negozio|gesch[aä]ft|service|depot|werkstatt|atelier|boot\s?fitting|レンタル)/i;

/**
 * True when the name says "ski school" (in any of the languages the directory
 * covers) and nothing in it says shop, rental or workshop. "George Ski &
 * Snowboard – School, Rent, Shop" is a shop that also teaches and stays in;
 * "Snowboardschule SMT" is a school and does not.
 */
export function isSchoolOnlyName(name: string): boolean {
  return SCHOOL_WORDS.test(name) && !SHOP_WORDS.test(name);
}

function isRated(store: RatingStoreInput): boolean {
  return (
    Number.isFinite(store.score) &&
    store.score > 0 &&
    Number.isFinite(store.reviews) &&
    store.reviews >= RATINGS_METHOD.minShopReviews
  );
}

/** Review-weighted mean with each shop's weight capped. NaN-safe: 0 when empty. */
export function cappedWeightedMean(
  shops: readonly { score: number; reviews: number }[]
): number {
  let weight = 0;
  let sum = 0;
  for (const s of shops) {
    const w = Math.min(RATINGS_METHOD.reviewWeightCap, s.reviews);
    weight += w;
    sum += s.score * w;
  }
  return weight > 0 ? sum / weight : 0;
}

function groupRatings(
  resorts: readonly ResortRating[],
  ratedByResort: ReadonlyMap<string, RatingStoreInput[]>,
  keyOf: (r: ResortRating) => string
): GroupRating[] {
  const groups = new Map<string, { shops: RatingStoreInput[]; resorts: number }>();
  for (const r of resorts) {
    const g = groups.get(keyOf(r)) ?? { shops: [], resorts: 0 };
    g.shops.push(...(ratedByResort.get(r.slug) ?? []));
    if (r.rank !== null) g.resorts += 1;
    groups.set(keyOf(r), g);
  }
  return [...groups.entries()]
    .filter(([, g]) => g.shops.length > 0)
    .map(([name, g]) => ({
      name,
      score: round2(cappedWeightedMean(g.shops)),
      shops: g.shops.length,
      reviews: g.shops.reduce((a, s) => a + s.reviews, 0),
      resorts: g.resorts,
    }))
    .sort((a, b) => b.score - a.score || b.reviews - a.reviews);
}

export function computeResortRatings(
  stores: readonly RatingStoreInput[],
  resorts: readonly RatingResortInput[],
  meta: { generatedAt: string; season: string }
): ResortRatingsSnapshot {
  // 1. Nearest-resort assignment.
  const assigned = new Map<string, (RatingStoreInput & { distanceKm: number })[]>();
  let storesAssigned = 0;
  let schoolsExcluded = 0;
  for (const store of stores) {
    if (!Number.isFinite(store.latitude) || !Number.isFinite(store.longitude)) continue;
    if (isSchoolOnlyName(store.name)) {
      schoolsExcluded += 1;
      continue;
    }
    let nearest: RatingResortInput | null = null;
    let nearestKm = Infinity;
    for (const resort of resorts) {
      const km = haversineDistance(resort.lat, resort.lng, store.latitude, store.longitude);
      if (km < nearestKm) {
        nearestKm = km;
        nearest = resort;
      }
    }
    if (!nearest || nearestKm > RATINGS_METHOD.radiusKm) continue;
    const list = assigned.get(nearest.slug) ?? [];
    list.push({ ...store, distanceKm: nearestKm });
    assigned.set(nearest.slug, list);
    storesAssigned += 1;
  }

  const allRated = [...assigned.values()].flat().filter(isRated);
  const meanScore = cappedWeightedMean(allRated);

  // 2–4. Per-resort figures.
  const ratedByResort = new Map<string, RatingStoreInput[]>();
  const unranked = resorts.map((resort) => {
    const listed = assigned.get(resort.slug) ?? [];
    const rated = listed.filter(isRated);
    ratedByResort.set(resort.slug, rated);

    const reviews = rated.reduce((a, s) => a + s.reviews, 0);
    const raw = cappedWeightedMean(rated);
    const eligible =
      rated.length >= RATINGS_METHOD.minShops &&
      reviews >= RATINGS_METHOD.minResortReviews;

    const services: Record<string, number> = {};
    for (const s of rated) {
      for (const tag of s.services) services[tag] = (services[tag] ?? 0) + 1;
    }

    // Order a resort's best shops by a score pulled towards the overall mean
    // in proportion to how few reviews back it, so a 5.0 from 21 reviews does
    // not outrank a 4.9 from 900.
    const prior = RATINGS_METHOD.topShopPriorReviews;
    const adjusted = (s: RatingStoreInput) =>
      (s.score * s.reviews + meanScore * prior) / (s.reviews + prior);
    const topShops: ResortShop[] = [...rated]
      .sort((a, b) => adjusted(b) - adjusted(a) || b.reviews - a.reviews)
      .slice(0, 3)
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        city: s.city,
        score: s.score,
        reviews: s.reviews,
        distanceKm: Math.round((s as RatingStoreInput & { distanceKm: number }).distanceKm * 10) / 10,
      }));

    return {
      rating: {
        slug: resort.slug,
        name: resort.name,
        region: resort.region,
        country: resort.country,
        countryCode: resort.countryCode,
        area: areaForCountry(resort.countryCode),
        rank: null as number | null,
        score: rated.length > 0 ? round2(raw) : null,
        shops: rated.length,
        shopsListed: listed.length,
        reviews,
        shareHigh:
          rated.length > 0
            ? round2(rated.filter((s) => s.score >= 4.5).length / rated.length)
            : 0,
        services,
        topShops,
      } satisfies ResortRating,
      raw,
      eligible,
    };
  });

  // Rank on the unrounded score; reviews, then name, break exact ties so the
  // order is stable between runs.
  const ranked = unranked
    .filter((r) => r.eligible)
    .sort(
      (a, b) =>
        b.raw - a.raw ||
        b.rating.reviews - a.rating.reviews ||
        a.rating.name.localeCompare(b.rating.name)
    );
  ranked.forEach((r, i) => {
    r.rating.rank = i + 1;
  });

  const notRanked = unranked
    .filter((r) => !r.eligible)
    .sort((a, b) => a.rating.name.localeCompare(b.rating.name));

  const all = [...ranked, ...notRanked].map((r) => r.rating);

  return {
    generatedAt: meta.generatedAt,
    season: meta.season,
    method: RATINGS_METHOD,
    totals: {
      stores: stores.length,
      storesAssigned,
      storesRated: allRated.length,
      schoolsExcluded,
      reviews: allRated.reduce((a, s) => a + s.reviews, 0),
      resorts: resorts.length,
      resortsRanked: ranked.length,
      meanScore: round2(meanScore),
    },
    resorts: all,
    countries: groupRatings(all, ratedByResort, (r) => r.country),
    areas: groupRatings(all, ratedByResort, (r) => r.area),
  };
}

/** CSV of the ranked table, for the public download. RFC 4180 quoting. */
export function snapshotToCsv(snapshot: ResortRatingsSnapshot): string {
  const cell = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = [
    "rank",
    "resort",
    "country",
    "area",
    "score",
    "rated_shops",
    "reviews",
    "share_of_shops_rated_4_5_or_higher",
    "top_rated_shop",
    "resort_page",
  ];
  const rows = snapshot.resorts.map((r) => [
    r.rank,
    r.name,
    r.country,
    r.area,
    r.score === null ? null : r.score.toFixed(2),
    r.shops,
    r.reviews,
    r.shops > 0 ? r.shareHigh.toFixed(2) : null,
    r.topShops[0]?.name ?? null,
    `https://winterstores.co/resorts/${r.slug}`,
  ]);
  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\n") + "\n";
}
