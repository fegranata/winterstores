import { NextRequest, NextResponse } from "next/server";
import { getStoreBySlug, getPlatformRatings } from "@/lib/store-search";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const rows = await getPlatformRatings(store.id);

  const response: Record<string, { platform: string; rating: number | null; reviewCount: number | null; platformUrl: string | null } | null> = {
    google: null,
    facebook: null,
    foursquare: null,
  };

  for (const row of rows) {
    response[row.platform] = row;
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
    },
  });
}
