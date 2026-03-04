export interface GoogleRatingResult {
  rating: number;
  reviewCount: number;
  mapsUrl: string;
}

/**
 * Fetch rating data from the Google Places API (New).
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchGoogleRating(
  placeId: string
): Promise<GoogleRatingResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri",
        },
        next: { revalidate: 1800 }, // 30 min
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.rating) return null;

    return {
      rating: data.rating,
      reviewCount: data.userRatingCount ?? 0,
      mapsUrl: data.googleMapsUri ?? "",
    };
  } catch {
    return null;
  }
}
