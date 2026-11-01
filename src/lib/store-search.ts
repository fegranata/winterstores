import { cache } from "react";
import { getDb, schema } from "@/lib/db";
import { eq, gte, lte, and, or, desc, asc, ilike, sql, count as drizzleCount } from "drizzle-orm";
import { haversineDistance } from "@/lib/geo";
import type {
  Store,
  StoreSearchParams,
  StoreSearchResult,
  SportType,
  ServiceType,
} from "@/types/store";

const { storesTable } = schema;

// -- DB row -> Store object --
type StoreRow = typeof storesTable.$inferSelect;

export function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    address: row.address,
    city: row.city,
    region: row.region,
    country: row.country,
    countryCode: row.countryCode,
    postalCode: row.postalCode,
    latitude: row.latitude,
    longitude: row.longitude,
    sportTypes: (row.sportTypes ?? []) as SportType[],
    services: (row.services ?? []) as ServiceType[],
    priceLevel: row.priceLevel as 1 | 2 | 3,
    website: row.website,
    hasOnlineShop: row.hasOnlineShop,
    onlineShopUrl: row.onlineShopUrl,
    phone: row.phone,
    email: row.email,
    winterstoresScore: row.winterstoresScore,
    totalReviewCount: row.totalReviewCount,
    googlePlaceId: row.googlePlaceId,
    yelpBusinessId: row.yelpBusinessId,
    facebookPageId: row.facebookPageId,
    foursquareVenueId: row.foursquareVenueId,
    photos: (row.photos ?? []) as string[],
    coverPhoto: row.coverPhoto,
    isVerified: row.isVerified,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

type StoreWithDistance = Store & { distance?: number };

/** Hard ceilings so no request — bot or human — can make this expensive. */
const SEARCH_MAX_LIMIT = 50;
const SEARCH_MAX_PAGE = 100;
const SEARCH_MAX_QUERY_CHARS = 100;

/** Escape LIKE metacharacters so a query of "100%" means the literal text. */
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Every filter, the sort and the pagination run in SQL. Until 2026-11-01
 * this pulled the entire stores table (all columns, no LIMIT) on every
 * request and filtered in JS — about 1MB of Supabase egress per search.
 * /search is the one route that is dynamic per request, so a bot farm
 * hitting it ~5,000 times a day burned through the 5GB monthly egress
 * quota and got the project's database service suspended. Fourth instance
 * of the per-request-cost-times-uncontrolled-multiplier rule in HANDOVER.md.
 * A page of 20 rows is now ~15KB.
 */
export async function searchStores(params: StoreSearchParams): Promise<StoreSearchResult> {
  const {
    q: rawQ,
    sport,
    service,
    lat,
    lng,
    distance: maxDistance,
    minRating,
    hasOnlineShop,
    priceLevel,
    country,
    sort = "highest-rated",
  } = params;

  const limit = Math.min(Math.max(1, Math.floor(params.limit ?? 20)), SEARCH_MAX_LIMIT);
  const page = Math.min(Math.max(1, Math.floor(params.page ?? 1)), SEARCH_MAX_PAGE);
  const q = rawQ?.trim().slice(0, SEARCH_MAX_QUERY_CHARS);
  const hasPoint =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  const conditions = [];

  if (q) {
    const pattern = likePattern(q);
    conditions.push(
      or(
        ilike(storesTable.name, pattern),
        ilike(storesTable.city, pattern),
        ilike(storesTable.region, pattern),
        ilike(storesTable.country, pattern),
        ilike(storesTable.description, pattern)
      )!
    );
  }

  if (sport) {
    const sportArr: SportType[] = Array.isArray(sport) ? sport : [sport];
    conditions.push(
      or(
        ...sportArr.map(
          (sp) => sql`${storesTable.sportTypes} @> ${JSON.stringify([sp])}::jsonb`
        )
      )!
    );
  }

  if (service) {
    const serviceArr: ServiceType[] = Array.isArray(service) ? service : [service];
    conditions.push(
      or(
        ...serviceArr.map(
          (sv) => sql`${storesTable.services} @> ${JSON.stringify([sv])}::jsonb`
        )
      )!
    );
  }

  if (minRating != null) {
    conditions.push(gte(storesTable.winterstoresScore, minRating));
  }

  if (hasOnlineShop != null) {
    conditions.push(eq(storesTable.hasOnlineShop, hasOnlineShop));
  }

  if (priceLevel != null) {
    conditions.push(lte(storesTable.priceLevel, priceLevel));
  }

  if (country) {
    const lower = country.toLowerCase();
    conditions.push(
      or(
        eq(sql`LOWER(${storesTable.country})`, lower),
        eq(sql`LOWER(${storesTable.countryCode})`, lower)
      )!
    );
  }

  // Planar squared distance with a cos² longitude correction — the same
  // ranking expression getNearbyStores uses. Good to well under 1% at the
  // radii involved; the exact haversine is still computed for display.
  const cosLat = hasPoint ? Math.cos((lat! * Math.PI) / 180) : 1;
  const distanceKm2 = hasPoint
    ? sql<number>`(
        power((${storesTable.latitude} - ${lat}) * 111.32, 2) +
        power((${storesTable.longitude} - ${lng}) * 111.32 * ${cosLat}, 2)
      )`
    : null;

  if (maxDistance != null && distanceKm2) {
    conditions.push(sql`${distanceKm2} <= ${maxDistance * maxDistance}`);
  }

  const db = getDb();
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === "closest" && distanceKm2
      ? [asc(distanceKm2)]
      : sort === "most-reviewed"
        ? [desc(storesTable.totalReviewCount), desc(storesTable.winterstoresScore)]
        : sort === "newest"
          ? [desc(storesTable.createdAt)]
          : [desc(storesTable.winterstoresScore), desc(storesTable.totalReviewCount)];

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(storesTable)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: drizzleCount() }).from(storesTable).where(whereClause),
  ]);

  const stores: StoreWithDistance[] = rows.map((row) => {
    const store: StoreWithDistance = rowToStore(row);
    if (hasPoint) {
      store.distance = haversineDistance(lat!, lng!, store.latitude, store.longitude);
    }
    return store;
  });

  return {
    stores,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Wrapped with React cache() to deduplicate calls within a single server render
// (generateMetadata + page component both call this with the same slug)
export const getStoreBySlug = cache(async function getStoreBySlug(
  slug: string
): Promise<Store | undefined> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.slug, slug))
    .limit(1);

  return row ? rowToStore(row) : undefined;
});

export async function getNearbyStores(
  store: Store,
  limitCount = 5
): Promise<StoreWithDistance[]> {
  const db = getDb();

  // Pre-filter to a ~100km bounding box to avoid loading all rows
  const latDelta = 1.0;
  const lngDelta = 1.5;

  // Rank and truncate in SQL rather than fetching the whole box and sorting in
  // JS. The box averaged 71 rows per store page (198 at worst) to render 4
  // cards, which across 1,377 store pages meant ~97k rows — about 37MB of
  // Supabase egress per full regeneration pass. At the old 1-hour ISR that was
  // ~26GB/month against a 5.5GB quota.
  //
  // Squared planar distance is enough to order by at this scale; the cos²
  // factor compensates for longitude converging toward the poles. Exact
  // haversine still runs below, on the handful of rows that survive.
  const cosLat = Math.cos((store.latitude * Math.PI) / 180) ** 2;
  const approxDistance = sql`(
    (${storesTable.latitude} - ${store.latitude}) * (${storesTable.latitude} - ${store.latitude})
    + (${storesTable.longitude} - ${store.longitude}) * (${storesTable.longitude} - ${store.longitude}) * ${cosLat}
  )`;

  let rows = await db
    .select()
    .from(storesTable)
    .where(
      and(
        sql`${storesTable.id} != ${store.id}`,
        gte(storesTable.latitude, store.latitude - latDelta),
        lte(storesTable.latitude, store.latitude + latDelta),
        gte(storesTable.longitude, store.longitude - lngDelta),
        lte(storesTable.longitude, store.longitude + lngDelta)
      )
    )
    .orderBy(approxDistance)
    .limit(limitCount);

  // Fallback for an isolated store with nothing in its box: widen to the whole
  // table, but still order and truncate in SQL — the previous version loaded
  // every row in the database here.
  if (rows.length === 0) {
    rows = await db
      .select()
      .from(storesTable)
      .where(sql`${storesTable.id} != ${store.id}`)
      .orderBy(approxDistance)
      .limit(limitCount);
  }

  return rows
    .map(rowToStore)
    .map((s) => ({
      ...s,
      distance: haversineDistance(
        store.latitude,
        store.longitude,
        s.latitude,
        s.longitude
      ),
    }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .slice(0, limitCount);
}

/**
 * cache()-wrapped: the browse and best-ski-shops pages each call this from both
 * generateMetadata and the page body, so without it every render pays for two
 * full-table aggregations instead of one.
 */
export const getUniqueCountries = cache(async function getUniqueCountries(): Promise<{
  country: string;
  countryCode: string;
  count: number;
}[]> {
  const db = getDb();
  const rows = await db
    .select({
      country: storesTable.country,
      countryCode: storesTable.countryCode,
      count: drizzleCount(),
    })
    .from(storesTable)
    .groupBy(storesTable.countryCode, storesTable.country)
    .orderBy(desc(drizzleCount()));

  return rows.map((r) => ({
    country: r.country,
    countryCode: r.countryCode,
    count: r.count,
  }));
});

/**
 * Compares against the column directly rather than LOWER(country_code), which
 * defeated idx_stores_country_code and forced a sequential scan on every call
 * (and left the planner estimating 5 rows where 327 came back). Codes are
 * stored uppercase — verified, zero rows differ from their upper() form.
 */
export const getStoresByCountry = cache(async function getStoresByCountry(
  countryCode: string
): Promise<Store[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.countryCode, countryCode.toUpperCase()));

  return rows.map(rowToStore);
});

export const getRegionsByCountry = cache(async function getRegionsByCountry(
  countryCode: string
): Promise<{ region: string; count: number }[]> {
  const db = getDb();
  const rows = await db
    .select({
      region: storesTable.region,
      count: drizzleCount(),
    })
    .from(storesTable)
    .where(eq(storesTable.countryCode, countryCode.toUpperCase()))
    .groupBy(storesTable.region)
    .orderBy(desc(drizzleCount()));

  return rows.map((r) => ({ region: r.region, count: r.count }));
});

export async function getStoresByRegion(
  countryCode: string,
  region: string
): Promise<Store[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(storesTable)
    .where(
      and(
        eq(sql`LOWER(${storesTable.countryCode})`, countryCode.toLowerCase()),
        eq(sql`LOWER(${storesTable.region})`, region.toLowerCase())
      )
    );

  return rows.map(rowToStore);
}

export async function getAllCountryCodes(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .selectDistinct({ countryCode: storesTable.countryCode })
    .from(storesTable);

  return rows.map((r) => r.countryCode);
}

// -- Stats helpers (used by homepage) --
export async function getStoreCount(): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ count: drizzleCount() }).from(storesTable);
  return row?.count ?? 0;
}

export async function getTotalReviewCount(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${storesTable.totalReviewCount}), 0)`,
    })
    .from(storesTable);

  return row?.total ?? 0;
}

// -- Server-side helpers for store detail page --

export interface PlatformRatingRow {
  platform: string;
  rating: number | null;
  reviewCount: number | null;
  platformUrl: string | null;
}

export async function getPlatformRatings(storeId: string): Promise<PlatformRatingRow[]> {
  const db = getDb();
  return db
    .select({
      platform: schema.platformRatingsCacheTable.platform,
      rating: schema.platformRatingsCacheTable.rating,
      reviewCount: schema.platformRatingsCacheTable.reviewCount,
      platformUrl: schema.platformRatingsCacheTable.platformUrl,
    })
    .from(schema.platformRatingsCacheTable)
    .where(eq(schema.platformRatingsCacheTable.storeId, storeId));
}

/**
 * Fetch platform ratings with cache population.
 * Unlike getPlatformRatings (read-only), this calls getCachedOrFetch()
 * which populates/refreshes the cache by calling platform APIs when needed.
 */
export async function getOrFetchPlatformRatings(store: Store): Promise<PlatformRatingRow[]> {
  const { getCachedOrFetch } = await import("@/lib/api/platform-cache");

  const results = await Promise.all([
    getCachedOrFetch(store.id, "google", store.googlePlaceId),
    getCachedOrFetch(store.id, "facebook", store.facebookPageId),
    getCachedOrFetch(store.id, "foursquare", store.foursquareVenueId),
  ]);

  return results
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map((r) => ({
      platform: r.platform,
      rating: r.rating,
      reviewCount: r.reviewCount,
      platformUrl: r.platformUrl,
    }));
}

export interface ReviewRow {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  text: string;
  date: string;
  source: string;
}

export async function getStoreReviews(storeId: string): Promise<ReviewRow[]> {
  const db = getDb();
  return db
    .select({
      id: schema.reviewsTable.id,
      authorName: schema.reviewsTable.authorName,
      rating: schema.reviewsTable.rating,
      title: schema.reviewsTable.title,
      text: schema.reviewsTable.text,
      date: schema.reviewsTable.date,
      source: schema.reviewsTable.source,
    })
    .from(schema.reviewsTable)
    .where(eq(schema.reviewsTable.storeId, storeId))
    .orderBy(desc(schema.reviewsTable.createdAt))
    .limit(50);
}
