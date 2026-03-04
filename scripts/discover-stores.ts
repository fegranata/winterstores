/**
 * Store Discovery Pipeline
 *
 * Searches Google Places and Foursquare APIs near major ski resorts to discover
 * new winter sport stores that aren't yet in the database.
 *
 * Usage:
 *   npx tsx scripts/discover-stores.ts
 *   npx tsx scripts/discover-stores.ts --auto-insert  (insert unverified stores into DB)
 *
 * Output:
 *   - Prints discovered candidates to console
 *   - Writes JSON to scripts/output/discovered-stores.json
 *
 * Required env vars in .env.local:
 *   GOOGLE_PLACES_API_KEY, FOURSQUARE_API_KEY (at least one required)
 */

import "dotenv/config";
import postgres from "postgres";
import { randomUUID } from "crypto";
import { RESORT_LOCATIONS, type ResortLocation } from "./resort-locations";
import * as fs from "fs";
import * as path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const FSQ_KEY = process.env.FOURSQUARE_API_KEY;
const AUTO_INSERT = process.argv.includes("--auto-insert");

const SEARCH_QUERIES = [
  "ski shop",
  "snowboard store",
  "winter sport store",
  "ski rental",
  "ski equipment shop",
];

const SEARCH_RADIUS = 50000; // 50km

interface DiscoveredStore {
  name: string;
  address: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  source: "google" | "foursquare";
  sourceId: string;
  phone?: string;
  website?: string;
  nearestResort: string;
}

interface ExistingStore {
  name: string;
  latitude: number;
  longitude: number;
}

// ─── Haversine Distance (km) ─────────────────────────────
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Google Places: Text Search ──────────────────────────
async function searchGoogle(
  query: string,
  location: ResortLocation
): Promise<DiscoveredStore[]> {
  if (!GOOGLE_KEY) return [];

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.addressComponents",
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: location.lat, longitude: location.lng },
              radius: SEARCH_RADIUS,
            },
          },
          maxResultCount: 20,
        }),
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const places = data.places ?? [];

    return places.map(
      (p: {
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        nationalPhoneNumber?: string;
        websiteUri?: string;
        id?: string;
        addressComponents?: Array<{
          types: string[];
          longText: string;
          shortText: string;
        }>;
      }) => {
        // Extract city and country from address components
        const components = p.addressComponents ?? [];
        const city =
          components.find((c) => c.types.includes("locality"))?.longText ?? "";
        const country =
          components.find((c) => c.types.includes("country"))?.longText ??
          location.country;
        const countryCode =
          components.find((c) => c.types.includes("country"))?.shortText ??
          location.countryCode;

        return {
          name: p.displayName?.text ?? "Unknown",
          address: p.formattedAddress ?? "",
          city: city || location.name,
          country,
          countryCode,
          lat: p.location?.latitude ?? 0,
          lng: p.location?.longitude ?? 0,
          source: "google" as const,
          sourceId: p.id ?? "",
          phone: p.nationalPhoneNumber,
          website: p.websiteUri,
          nearestResort: location.name,
        };
      }
    );
  } catch {
    return [];
  }
}

// ─── Foursquare: Place Search ────────────────────────────
async function searchFoursquare(
  query: string,
  location: ResortLocation
): Promise<DiscoveredStore[]> {
  if (!FSQ_KEY) return [];

  try {
    const params = new URLSearchParams({
      query,
      ll: `${location.lat},${location.lng}`,
      radius: String(SEARCH_RADIUS),
      limit: "50",
      fields: "fsq_id,name,location,tel,website",
    });

    const res = await fetch(
      `https://api.foursquare.com/v3/places/search?${params}`,
      {
        headers: {
          Authorization: FSQ_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.results ?? []).map(
      (p: {
        name?: string;
        location?: {
          formatted_address?: string;
          locality?: string;
          country?: string;
          region?: string;
        };
        geocodes?: { main?: { latitude: number; longitude: number } };
        tel?: string;
        website?: string;
        fsq_id?: string;
      }) => ({
        name: p.name ?? "Unknown",
        address: p.location?.formatted_address ?? "",
        city: p.location?.locality ?? location.name,
        country: p.location?.country ?? location.country,
        countryCode: location.countryCode,
        lat: p.geocodes?.main?.latitude ?? 0,
        lng: p.geocodes?.main?.longitude ?? 0,
        source: "foursquare" as const,
        sourceId: p.fsq_id ?? "",
        phone: p.tel,
        website: p.website,
        nearestResort: location.name,
      })
    );
  } catch {
    return [];
  }
}

// ─── De-duplication ──────────────────────────────────────
function isDuplicate(
  store: DiscoveredStore,
  existing: ExistingStore[]
): boolean {
  for (const e of existing) {
    const dist = haversine(store.lat, store.lng, e.latitude, e.longitude);
    if (dist < 0.1) return true; // Within 100m

    // Same name within 1km
    const nameSimilar =
      e.name.toLowerCase().includes(store.name.toLowerCase()) ||
      store.name.toLowerCase().includes(e.name.toLowerCase());
    if (nameSimilar && dist < 1) return true;
  }
  return false;
}

function deduplicateDiscovered(stores: DiscoveredStore[]): DiscoveredStore[] {
  const seen = new Map<string, DiscoveredStore>();

  for (const store of stores) {
    // Key: lowercased name + approximate coordinates
    const coordKey = `${Math.round(store.lat * 100)}_${Math.round(store.lng * 100)}`;
    const key = `${store.name.toLowerCase()}_${coordKey}`;

    if (!seen.has(key)) {
      seen.set(key, store);
    }
  }

  return Array.from(seen.values());
}

// ─── Slug generation ─────────────────────────────────────
function slugify(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Auto-Insert ─────────────────────────────────────────
async function insertStore(store: DiscoveredStore): Promise<void> {
  const id = randomUUID();
  const slug = slugify(store.name, store.city);

  await sql`
    INSERT INTO stores (
      id, slug, name, description, address, city, region, country, country_code,
      postal_code, latitude, longitude, sport_types, services, price_level,
      winterstores_score, total_review_count, is_verified,
      ${store.source === "google" ? sql`google_place_id` : sql`foursquare_venue_id`},
      phone, website, has_online_shop, photos, created_at, updated_at
    ) VALUES (
      ${id}, ${slug}, ${store.name}, '', ${store.address}, ${store.city},
      '', ${store.country}, ${store.countryCode}, '', ${store.lat}, ${store.lng},
      '["skiing","snowboarding"]'::jsonb, '["rentals"]'::jsonb, 2,
      0, 0, false,
      ${store.sourceId},
      ${store.phone ?? null}, ${store.website ?? null}, false, '[]'::jsonb,
      NOW(), NOW()
    )
    ON CONFLICT (slug) DO NOTHING
  `;
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log("🏔️  WinterStores Discovery Pipeline\n");
  console.log(`Searching near ${RESORT_LOCATIONS.length} ski resorts`);
  console.log(`Google Places: ${GOOGLE_KEY ? "✅" : "❌ (skipping)"}`);
  console.log(`Foursquare:    ${FSQ_KEY ? "✅" : "❌ (skipping)"}`);
  console.log(`Auto-insert:   ${AUTO_INSERT ? "✅ ON" : "❌ OFF (dry run)"}`);
  console.log("");

  if (!GOOGLE_KEY && !FSQ_KEY) {
    console.error("At least one API key is required (GOOGLE_PLACES_API_KEY or FOURSQUARE_API_KEY)");
    process.exit(1);
  }

  // Load existing stores for de-duplication
  const existingStores: ExistingStore[] = await sql`
    SELECT name, latitude, longitude FROM stores
  `;
  console.log(`Existing stores in DB: ${existingStores.length}\n`);

  const allDiscovered: DiscoveredStore[] = [];

  for (let i = 0; i < RESORT_LOCATIONS.length; i++) {
    const resort = RESORT_LOCATIONS[i];
    console.log(
      `[${i + 1}/${RESORT_LOCATIONS.length}] Searching near ${resort.name}, ${resort.country}...`
    );

    // Search with a couple of queries to get good coverage
    const queriesToUse = SEARCH_QUERIES.slice(0, 3); // Use first 3 queries

    for (const query of queriesToUse) {
      const [googleResults, fsqResults] = await Promise.all([
        searchGoogle(query, resort),
        searchFoursquare(query, resort),
      ]);

      allDiscovered.push(...googleResults, ...fsqResults);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  // De-duplicate among discovered
  let candidates = deduplicateDiscovered(allDiscovered);

  // Remove stores already in DB
  candidates = candidates.filter((s) => !isDuplicate(s, existingStores));

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 DISCOVERY RESULTS`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Raw discoveries:     ${allDiscovered.length}`);
  console.log(`After dedup:         ${candidates.length}`);
  console.log(`Existing in DB:      ${existingStores.length}`);
  console.log("");

  if (candidates.length === 0) {
    console.log("No new stores discovered.");
    await sql.end();
    return;
  }

  // Group by country
  const byCountry = new Map<string, DiscoveredStore[]>();
  for (const s of candidates) {
    const existing = byCountry.get(s.country) ?? [];
    existing.push(s);
    byCountry.set(s.country, existing);
  }

  for (const [country, stores] of byCountry) {
    console.log(`\n🌍 ${country} (${stores.length} stores)`);
    for (const s of stores.slice(0, 10)) {
      console.log(`  • ${s.name} — ${s.city} (via ${s.source}, near ${s.nearestResort})`);
    }
    if (stores.length > 10) {
      console.log(`  ... and ${stores.length - 10} more`);
    }
  }

  // Save to JSON
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "discovered-stores.json");
  fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
  console.log(`\n💾 Full list saved to: ${outputPath}`);

  // Auto-insert if flag is set
  if (AUTO_INSERT) {
    console.log(`\n🔄 Auto-inserting ${candidates.length} stores...`);
    let inserted = 0;
    for (const store of candidates) {
      try {
        await insertStore(store);
        inserted++;
      } catch (e) {
        console.log(`  ⚠ Skipped ${store.name}: ${(e as Error).message}`);
      }
    }
    console.log(`✅ Inserted ${inserted} new stores (unverified)`);
  } else {
    console.log(
      `\n💡 Run with --auto-insert to add these stores to the database.`
    );
  }

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
