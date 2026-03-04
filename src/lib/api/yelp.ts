export interface YelpRatingResult {
  rating: number;
  reviewCount: number;
  yelpUrl: string;
}

/**
 * Fetch rating data from the Yelp Fusion API.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchYelpRating(
  businessId: string
): Promise<YelpRatingResult | null> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey || !businessId) return null;

  try {
    const res = await fetch(
      `https://api.yelp.com/v3/businesses/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 86400 }, // 24 hours
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.rating) return null;

    return {
      rating: data.rating,
      reviewCount: data.review_count ?? 0,
      yelpUrl: data.url ?? "",
    };
  } catch {
    return null;
  }
}
