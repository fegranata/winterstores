/**
 * Google Places Scraper — discovers winter sport stores by searching
 * for ski/snowboard shops in target regions.
 *
 * Usage: GOOGLE_API_KEY=xxx npx tsx scripts/scrape/google-places.ts
 *
 * Requires: Google Places API key (Nearby Search + Place Details)
 * Docs: https://developers.google.com/maps/documentation/places/web-service
 */
import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "stores.db");
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("❌ Set GOOGLE_API_KEY environment variable");
  process.exit(1);
}

const BASE_URL = "https://maps.googleapis.com/maps/api/place";

// Target regions: [lat, lng, label]
const SEARCH_LOCATIONS: [number, number, string][] = [
  [39.6403, -106.3742, "Vail, Colorado"],
  [39.4817, -106.0384, "Breckenridge, Colorado"],
  [40.6461, -111.498, "Park City, Utah"],
  [44.4654, -72.6874, "Stowe, Vermont"],
  [39.1677, -120.1452, "Tahoe City, California"],
  [50.1163, -122.9574, "Whistler, Canada"],
  [51.1784, -115.5708, "Banff, Canada"],
  [46.0207, 7.7491, "Zermatt, Switzerland"],
  [46.6244, 8.0413, "Grindelwald, Switzerland"],
  [47.1275, 10.2638, "St. Anton, Austria"],
  [45.9237, 6.8694, "Chamonix, France"],
  [42.8635, 140.6989, "Niseko, Japan"],
  [36.6983, 137.8614, "Hakuba, Japan"],
  [47.4916, 11.0956, "Garmisch, Germany"],
  [63.3995, 13.0825, "Åre, Sweden"],
  [59.9239, 10.723, "Oslo, Norway"],
];

const SEARCH_QUERIES = [
  "ski shop",
  "snowboard store",
  "winter sports equipment",
  "ski rental",
];

interface PlaceResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: { location: { lat: number; lng: number } };
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function searchNearby(
  lat: number,
  lng: number,
  query: string,
  radius = 50000
): Promise<PlaceResult[]> {
  const url = new URL(`${BASE_URL}/nearbysearch/json`);
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("keyword", query);
  url.searchParams.set("key", API_KEY!);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn(`⚠️  API error: ${data.status} — ${data.error_message ?? ""}`);
    return [];
  }

  return data.results ?? [];
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const url = new URL(`${BASE_URL}/details/json`);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry,address_components"
  );
  url.searchParams.set("key", API_KEY!);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    console.warn(`⚠️  Details error for ${placeId}: ${data.status}`);
    return null;
  }

  return data.result;
}

function extractAddressComponent(
  components: PlaceDetails["address_components"],
  type: string
): string {
  const comp = components.find((c) => c.types.includes(type));
  return comp?.long_name ?? "";
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const seenPlaceIds = new Set<string>();
  let newCount = 0;

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO stores (
      id, slug, name, description,
      address, city, region, country, country_code, postal_code,
      latitude, longitude,
      sport_types, services, price_level,
      website, has_online_shop, online_shop_url, phone, email,
      composite_rating, total_review_count, review_sources,
      photos, cover_photo,
      is_verified, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?
    )
  `);

  for (const [lat, lng, label] of SEARCH_LOCATIONS) {
    for (const query of SEARCH_QUERIES) {
      console.log(`🔍 Searching "${query}" near ${label}...`);

      const results = await searchNearby(lat, lng, query);
      console.log(`   Found ${results.length} results`);

      for (const place of results) {
        if (seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);

        if (place.business_status === "CLOSED_PERMANENTLY") continue;

        // Get full details
        const details = await getPlaceDetails(place.place_id);
        if (!details) continue;

        const city = extractAddressComponent(details.address_components, "locality");
        const region = extractAddressComponent(
          details.address_components,
          "administrative_area_level_1"
        );
        const country = extractAddressComponent(details.address_components, "country");
        const countryCode =
          details.address_components.find((c) => c.types.includes("country"))
            ?.short_name ?? "";
        const postalCode = extractAddressComponent(
          details.address_components,
          "postal_code"
        );

        const id = `gp-${crypto.randomBytes(6).toString("hex")}`;
        const slug = slugify(`${details.name}-${city}`);
        const now = new Date().toISOString().slice(0, 10);

        const reviewSources = details.rating
          ? [
              {
                platform: "google",
                rating: details.rating,
                reviewCount: details.user_ratings_total ?? 0,
                url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                lastScraped: now,
              },
            ]
          : [];

        try {
          insertStmt.run(
            id,
            slug,
            details.name,
            "", // description — to be enriched later
            details.formatted_address,
            city,
            region,
            country,
            countryCode,
            postalCode,
            details.geometry.location.lat,
            details.geometry.location.lng,
            JSON.stringify(["skiing", "snowboarding"]), // default — to be enriched
            JSON.stringify(["rentals"]), // default — to be enriched
            2, // default price level
            details.website ?? null,
            details.website ? 1 : 0,
            details.website ?? null,
            details.formatted_phone_number ?? null,
            null,
            details.rating ?? 0,
            details.user_ratings_total ?? 0,
            JSON.stringify(reviewSources),
            "[]",
            null,
            0,
            now,
            now
          );
          newCount++;
        } catch (err) {
          // Likely a slug conflict — skip
        }

        // Rate limiting — be nice to the API
        await new Promise((r) => setTimeout(r, 200));
      }

      // Pause between searches
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const count = db.prepare("SELECT COUNT(*) as count FROM stores").get() as {
    count: number;
  };
  console.log(`\n✅ Added ${newCount} new stores. Total: ${count.count}`);
  db.close();
}

main().catch(console.error);
