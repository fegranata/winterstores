import { eq, and, gt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { fetchGoogleRating, type GoogleRatingResult } from "./google-places";
import { fetchFacebookRating, type FacebookRatingResult } from "./facebook";
import {
  fetchFoursquareRating,
  type FoursquareRatingResult,
} from "./foursquare";

export type PlatformName = "google" | "facebook" | "foursquare";

export interface PlatformRating {
  platform: PlatformName;
  rating: number;
  reviewCount: number;
  platformUrl: string;
}

/**
 * Cache lifetimes for platform ratings.
 *
 * These were 30 minutes / 6 hours / 12 hours, which cost roughly $260 in two
 * days. The lifetime was never the real problem though — the fetch path ran
 * during page render, so 1,053 store pages under continuous crawler traffic
 * wired Googlebot directly to the API bill with no ceiling. A shop's star
 * rating does not move measurably in 30 minutes, and nothing about the product
 * needs it to.
 *
 * Refreshing is now a scheduled job (scripts/refresh-ratings.ts) with an
 * explicit cap, and the render path stays read-only via getPlatformRatings.
 * These TTLs only bound how stale a scheduled refresh will tolerate.
 */
const TTL: Record<PlatformName, number> = {
  google: 30 * 24 * 60 * 60 * 1000, // 30 days
  facebook: 30 * 24 * 60 * 60 * 1000, // 30 days
  foursquare: 30 * 24 * 60 * 60 * 1000, // 30 days
};

type FetchResult =
  | GoogleRatingResult
  | FacebookRatingResult
  | FoursquareRatingResult;

/**
 * Extract the platform-specific URL from a fetch result.
 */
function extractPlatformUrl(
  platform: PlatformName,
  result: FetchResult
): string {
  switch (platform) {
    case "google":
      return (result as GoogleRatingResult).mapsUrl;
    case "facebook":
      return (result as FacebookRatingResult).facebookUrl;
    case "foursquare":
      return (result as FoursquareRatingResult).foursquareUrl;
  }
}

/**
 * Fetch fresh rating data from the appropriate platform API.
 */
async function fetchFromPlatform(
  platform: PlatformName,
  platformId: string
): Promise<FetchResult | null> {
  switch (platform) {
    case "google":
      return fetchGoogleRating(platformId);
    case "facebook":
      return fetchFacebookRating(platformId);
    case "foursquare":
      return fetchFoursquareRating(platformId);
  }
}

/**
 * Get cached platform rating or fetch from API and cache.
 */
export async function getCachedOrFetch(
  storeId: string,
  platform: PlatformName,
  platformId: string | null
): Promise<PlatformRating | null> {
  if (!platformId) return null;

  const db = getDb();
  const now = new Date();

  // Check cache for non-expired entry
  const [cached] = await db
    .select()
    .from(schema.platformRatingsCacheTable)
    .where(
      and(
        eq(schema.platformRatingsCacheTable.storeId, storeId),
        eq(schema.platformRatingsCacheTable.platform, platform),
        gt(schema.platformRatingsCacheTable.expiresAt, now)
      )
    )
    .limit(1);

  if (cached && cached.rating != null) {
    return {
      platform,
      rating: cached.rating,
      reviewCount: cached.reviewCount ?? 0,
      platformUrl: cached.platformUrl ?? "",
    };
  }

  // Fetch from API
  const result = await fetchFromPlatform(platform, platformId);
  if (!result) return null;

  const platformUrl = extractPlatformUrl(platform, result);
  const expiresAt = new Date(Date.now() + TTL[platform]);
  const id = `${storeId}_${platform}`;

  // Upsert cache entry
  await db
    .insert(schema.platformRatingsCacheTable)
    .values({
      id,
      storeId,
      platform,
      rating: result.rating,
      reviewCount: result.reviewCount,
      platformUrl,
      fetchedAt: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: schema.platformRatingsCacheTable.id,
      set: {
        rating: result.rating,
        reviewCount: result.reviewCount,
        platformUrl,
        fetchedAt: now,
        expiresAt,
      },
    });

  return {
    platform,
    rating: result.rating,
    reviewCount: result.reviewCount,
    platformUrl,
  };
}
