import { NextRequest, NextResponse } from "next/server";
import { searchStores } from "@/lib/store-search";
import type { SportType, ServiceType } from "@/types/store";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sportParam = params.getAll("sport") as SportType[];
  const serviceParam = params.getAll("service") as ServiceType[];

  const result = await searchStores({
    q: params.get("q") ?? undefined,
    sport: sportParam.length > 0 ? sportParam : undefined,
    service: serviceParam.length > 0 ? serviceParam : undefined,
    lat: params.get("lat") ? Number(params.get("lat")) : undefined,
    lng: params.get("lng") ? Number(params.get("lng")) : undefined,
    distance: params.get("distance") ? Number(params.get("distance")) : undefined,
    minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
    hasOnlineShop: params.get("hasOnlineShop") === "true" ? true : params.get("hasOnlineShop") === "false" ? false : undefined,
    priceLevel: params.get("priceLevel") ? Number(params.get("priceLevel")) : undefined,
    country: params.get("country") ?? undefined,
    sort: (params.get("sort") as "closest" | "highest-rated" | "most-reviewed" | "newest") ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
