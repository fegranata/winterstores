import { eq, and, gt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { fetchGoogleRating, type GoogleRatingResult } from "./google-places";
import { fetchYelpRating, type YelpRatingResult } from "./yelp";

export interface PlatformRating {
  platform: "google" | "yelp";
  rating: number;
  reviewCount: number;
  platformUrl: string;
}

const TTL = {
  google: 30 * 60 * 1000, // 30 minutes
  yelp: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Get cached platform rating or fetch from API and cache.
 */
export async function getCachedOrFetch(
  storeId: string,
  platform: "google" | "yelp",
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
  let result: GoogleRatingResult | YelpRatingResult | null = null;
  if (platform === "google") {
    result = await fetchGoogleRating(platformId);
  } else {
    result = await fetchYelpRating(platformId);
  }

  if (!result) return null;

  const platformUrl =
    "mapsUrl" in result ? result.mapsUrl : result.yelpUrl;
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
