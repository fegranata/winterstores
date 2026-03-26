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
