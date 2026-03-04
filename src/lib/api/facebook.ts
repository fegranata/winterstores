export interface FacebookRatingResult {
  rating: number;
  reviewCount: number;
  facebookUrl: string;
}

/**
 * Fetch rating data from the Facebook Graph API.
 * Returns null if the access token is missing or the request fails.
 */
export async function fetchFacebookRating(
  pageId: string
): Promise<FacebookRatingResult | null> {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!accessToken || !pageId) return null;

  try {
    const fields = "overall_star_rating,rating_count,link,name";
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}?fields=${fields}&access_token=${accessToken}`,
      {
        next: { revalidate: 21600 }, // 6 hours
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.overall_star_rating) return null;

    return {
      rating: data.overall_star_rating,
      reviewCount: data.rating_count ?? 0,
      facebookUrl: data.link ?? `https://www.facebook.com/${pageId}`,
    };
  } catch {
    return null;
  }
}
