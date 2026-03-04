export interface FoursquareRatingResult {
  rating: number;
  reviewCount: number;
  foursquareUrl: string;
}

/**
 * Fetch rating data from the Foursquare Places API v3.
 * Foursquare uses a 10-point scale, so we normalize to 5-star.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchFoursquareRating(
  venueId: string
): Promise<FoursquareRatingResult | null> {
  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey || !venueId) return null;

  try {
    const fields = "rating,stats,link";
    const res = await fetch(
      `https://api.foursquare.com/v3/places/${venueId}?fields=${fields}`,
      {
        headers: {
          Authorization: apiKey,
          Accept: "application/json",
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
        data.link ?? `https://foursquare.com/v/${venueId}`,
    };
  } catch {
    return null;
  }
}
