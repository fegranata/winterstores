import { cache } from "react";
import { getDb } from "@/lib/db";
import { storesTable } from "@/lib/db/schema";
import { gte, lte, and } from "drizzle-orm";
import { rowToStore } from "@/lib/store-search";
import { haversineDistance } from "@/lib/geo";
import type { Store } from "@/types/store";

export type StoreWithDistance = Store & { distance: number };

/**
 * Find stores within `radiusKm` of a point. Returns stores sorted by distance.
 * Uses a bounding-box pre-filter then exact haversine.
 */
export const getStoresNearResort = cache(
  async (
    lat: number,
    lng: number,
    radiusKm: number = 30
  ): Promise<StoreWithDistance[]> => {
    const db = getDb();

    // ~1 degree latitude ≈ 111km; longitude varies by cos(lat)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const rows = await db
      .select()
      .from(storesTable)
      .where(
        and(
          gte(storesTable.latitude, lat - latDelta),
          lte(storesTable.latitude, lat + latDelta),
          gte(storesTable.longitude, lng - lngDelta),
          lte(storesTable.longitude, lng + lngDelta)
        )
      );

    return rows
      .map(rowToStore)
      .map((s) => ({
        ...s,
        distance: haversineDistance(lat, lng, s.latitude, s.longitude),
      }))
      .filter((s) => s.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }
);

/**
 * The store list a resort page actually displays: 30km, widened to 50km when
 * that turns up fewer than 3 shops.
 *
 * Both the page body and its generateMetadata need this. Going through one
 * cache()-wrapped helper means they share a single result — calling
 * getStoresNearResort directly with different radii would miss the cache and
 * double the query count for every resort at build time.
 */
export const getResortPageStores = cache(
  async (
    lat: number,
    lng: number
  ): Promise<{ stores: StoreWithDistance[]; radiusUsed: number }> => {
    const near = await getStoresNearResort(lat, lng, 30);
    if (near.length >= 3) return { stores: near, radiusUsed: 30 };
    return { stores: await getStoresNearResort(lat, lng, 50), radiusUsed: 50 };
  }
);
