export interface FoursquareRatingResult {
  rating: number;
  reviewCount: number;
  foursquareUrl: string;
}

/**
 * Fetch rating data from the Foursquare Places API (new endpoints).
 * Base URL: places-api.foursquare.com
 * Auth: Bearer token + X-Places-Api-Version header.
 * Foursquare uses a 10-point scale, so we normalize to 5-star.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchFoursquareRating(
  venueId: string
): Promise<FoursquareRatingResult | null> {
  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey || !venueId) return null;

  try {
    const fields = "rating,stats,website";
    const res = await fetch(
      `https://places-api.foursquare.com/places/${venueId}?fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "X-Places-Api-Version": "2025-06-17",
        },
        next: { revalidate: 43200 }, // 12 hours
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.rating) return null;

    // Foursquare uses a 10-point scale → normalize to 5
    const normalizedRating = Math.round((data.rating / 2) * 10) / 10;

    return {
      rating: normalizedRating,
      reviewCount: data.stats?.total_ratings ?? 0,
      foursquareUrl:
        data.website ?? `https://foursquare.com/v/${venueId}`,
    };
  } catch {
    return null;
  }
}
