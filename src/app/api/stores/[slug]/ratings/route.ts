import { NextRequest, NextResponse } from "next/server";
import { getStoreBySlug } from "@/lib/store-search";
import { getCachedOrFetch, type PlatformRating } from "@/lib/api/platform-cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const [google, facebook, foursquare] = await Promise.all([
    getCachedOrFetch(store.id, "google", store.googlePlaceId ?? null),
    getCachedOrFetch(store.id, "facebook", store.facebookPageId ?? null),
    getCachedOrFetch(store.id, "foursquare", store.foursquareVenueId ?? null),
  ]);

  const response: Record<string, PlatformRating | null> = {
    google,
    facebook,
    foursquare,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
