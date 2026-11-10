/**
 * The frozen resort-ratings snapshot behind /reports and the rank line on
 * resort pages. Regenerate with scripts/build-resort-ratings.ts --commit;
 * never compute this at render time (see src/lib/resort-ratings.ts).
 */
import snapshot from "./resort-ratings.json";
import type {
  ResortRating,
  ResortRatingsSnapshot,
} from "@/lib/resort-ratings";

export const RESORT_RATINGS = snapshot as unknown as ResortRatingsSnapshot;

/** Ranked resorts, best first. */
export const RANKED_RESORTS: ResortRating[] = RESORT_RATINGS.resorts
  .filter((r): r is ResortRating & { rank: number; score: number } => r.rank !== null)
  .sort((a, b) => a.rank - b.rank);

/** Resorts with too few rated shops or reviews to rank, by name. */
export const UNRANKED_RESORTS: ResortRating[] = RESORT_RATINGS.resorts.filter(
  (r) => r.rank === null
);

const BY_SLUG = new Map(RESORT_RATINGS.resorts.map((r) => [r.slug, r]));

export function getResortRating(slug: string): ResortRating | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Household names readers look for first. Used to say, when it is true, that
 * the famous resorts are not at the top; only those actually ranked count.
 */
const FAMOUS_SLUGS = ["chamonix", "zermatt", "aspen", "whistler", "vail", "st-anton", "niseko"];

export const FAMOUS_RANKED: ResortRating[] = FAMOUS_SLUGS.map((slug) =>
  RANKED_RESORTS.find((r) => r.slug === slug)
)
  .filter((r): r is ResortRating => Boolean(r))
  .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

/** True when at least three famous resorts are ranked and none is in the top ten. */
export const FAMOUS_OUTSIDE_TOP_TEN =
  FAMOUS_RANKED.length >= 3 && FAMOUS_RANKED.every((r) => (r.rank ?? 0) > 10);

export const REPORT_PATHS = {
  index: "/reports",
  ratings: "/reports/ski-shop-ratings-by-resort",
  topResorts: "/reports/best-resorts-for-ski-shops",
  csv: "/data/ski-shop-ratings-by-resort.csv",
} as const;

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function formatSnapshotDate(iso: string = RESORT_RATINGS.generatedAt): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
