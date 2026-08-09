/**
 * Whether a store has enough substance to be worth putting in front of Google.
 *
 * Deliberately a narrow test. Measuring the corpus showed there is no useful
 * middle signal: only 32 of 1,053 stores have any written description and none
 * have photos, so a "does it have unique content" bar would have excluded 97%
 * of the directory. What genuinely separates a real listing from a dead one is
 * whether anyone has ever engaged with it — a shop with no website and almost
 * no reviews is a scraping artifact, not a business we can say anything about.
 *
 * Everything else keeps its index slot and gets a composed description instead
 * (see store-description.ts).
 */

const MIN_REVIEWS_WITHOUT_SITE = 5;

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
