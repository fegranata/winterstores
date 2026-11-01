/**
 * Which store pages are worth putting in front of Google.
 *
 * Two tiers, both reversible in one commit:
 *
 * isGhostStore — a listing with no website and almost no reviews is a scraping
 * artifact, not a business we can say anything about. Noindexed since
 * 2026-08-09 and kept out of the sitemap.
 *
 * isIndexableStore — the 2026-11-01 Search Console check showed composed
 * descriptions did not clear Google's bar: indexed pages fell 683 → 418,
 * 557 store pages sat in "Crawled – currently not indexed" and 562 more in
 * "Discovered – currently not indexed". Measured on 1,439 stores, only 677
 * had both real review activity (≥20) and a distinguishing signal — more
 * than the near-universal `rentals` tag, or a written description. The rest
 * read as near-duplicates of each other. Asking Google to index them was
 * costing the crawl budget the resort pages and guides need, so they are now
 * `noindex, follow`: still rendered for humans, still linking outward.
 *
 * The threshold is deliberately a whole-corpus measurement, not a guess: see
 * GO_LIVE.md §7 for the numbers behind it.
 */

const MIN_REVIEWS_WITHOUT_SITE = 5;
const MIN_REVIEWS_TO_INDEX = 20;
const MIN_WRITTEN_DESCRIPTION_CHARS = 50;

export function isGhostStore(store: {
  website: string | null;
  totalReviewCount: number;
}): boolean {
  const hasSite = Boolean(store.website && store.website.trim());
  const reviews = Number.isFinite(store.totalReviewCount)
    ? store.totalReviewCount
    : 0;

  return !hasSite && reviews < MIN_REVIEWS_WITHOUT_SITE;
}

/**
 * True when the page has enough distinguishing substance to ask Google to
 * index it: real review activity plus either a service profile beyond plain
 * rentals or a hand-written description. Ghosts are never indexable.
 */
export function isIndexableStore(store: {
  website: string | null;
  totalReviewCount: number;
  services: readonly string[] | null | undefined;
  description: string | null | undefined;
}): boolean {
  if (isGhostStore(store)) return false;

  const reviews = Number.isFinite(store.totalReviewCount)
    ? store.totalReviewCount
    : 0;
  if (reviews < MIN_REVIEWS_TO_INDEX) return false;

  const services = Array.isArray(store.services) ? store.services : [];
  const hasServiceProfile = services.filter((s) => s !== "rentals").length > 0;
  const hasWrittenDescription =
    typeof store.description === "string" &&
    store.description.trim().length > MIN_WRITTEN_DESCRIPTION_CHARS;

  return hasServiceProfile || hasWrittenDescription;
}
