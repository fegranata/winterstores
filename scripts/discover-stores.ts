/**
 * Store Discovery Pipeline
 *
 * Searches Google Places and Foursquare APIs near major ski resorts to discover
 * new winter sport stores that aren't yet in the database.
 *
 * Usage:
 *   npx tsx scripts/discover-stores.ts                          (all resorts, dry run)
 *   npx tsx scripts/discover-stores.ts --auto-insert            (all resorts, insert into DB)
 *   npx tsx scripts/discover-stores.ts --region "French Alps"   (filter by region)
 *   npx tsx scripts/discover-stores.ts --region "Colorado" --auto-insert
 *
 * Output:
 *   - Prints discovered candidates to console
 *   - Writes JSON to scripts/output/discovered-stores.json
 *
 * Required env vars in .env.local:
 *   GOOGLE_PLACES_API_KEY, FOURSQUARE_API_KEY (at least one required)
 */

import { config } from "dotenv";
config({ path: ".env.local" });
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

// --region "French Alps" → filter to only that region
const regionIdx = process.argv.indexOf("--region");
const REGION_FILTER = regionIdx !== -1 ? process.argv[regionIdx + 1] : null;

const SEARCH_QUERIES = [
  "ski shop",
  "snowboard store",
  "winter sport store",
  "ski rental",
  "ski equipment shop",
];

const SEARCH_RADIUS = 50000; // 50km

// ─── Quality Gates ──────────────────────────────────────
// Reject results whose name contains any of these keywords (case-insensitive)
const NAME_BLACKLIST = [
  "hotel", "hostel", "lodge", "inn", "motel", "chalet", "apartment", "cabin",
  "residence", "resort hotel", "b&b", "bed and breakfast", "airbnb",
  "restaurant", "bar", "café", "cafe", "bistro", "pizzeria", "pub", "grill",
  "instructor", "school", "lesson", "academy", "guide", "tour",
  "taxi", "transfer", "shuttle", "parking",
  "spa", "wellness", "massage", "physiotherapy",
  "supermarket", "grocery", "pharmacy", "bakery",
  "real estate", "immobili", "property",
  "dentist", "doctor", "clinic", "hospital",
];

// At least one of these must appear in the name OR in Google's types
const NAME_WHITELIST = [
  "ski", "snowboard", "sport", "rental", "shop", "store", "gear",
  "mountain", "outdoor", "winter", "snow", "board", "alpine",
  "surf", // for shops like "Rhythm" that say "surf & snow"
  "intersport", "decathlon", "skiset", "precision ski", "pic negre",
];

// Google Places types that indicate wrong business category
const REJECTED_GOOGLE_TYPES = [
  "lodging", "hotel", "motel", "campground", "rv_park",
  "restaurant", "food", "meal_delivery", "meal_takeaway", "cafe", "bar", "bakery",
  "school", "university", "primary_school", "secondary_school",
  "hospital", "doctor", "dentist", "pharmacy", "health",
  "real_estate_agency", "insurance_agency", "bank", "atm",
  "car_rental", "car_dealer", "gas_station",
  "church", "place_of_worship",
  "night_club", "casino",
];

// Website domains that indicate wrong business (accommodation/booking sites)
const REJECTED_DOMAINS = [
  "booking.com", "airbnb.com", "expedia.com", "hotels.com",
  "tripadvisor.com", "vrbo.com", "agoda.com", "hostelworld.com",
];

function passesQualityGates(
  name: string,
  types: string[],
  website?: string,
): { passes: boolean; reason?: string } {
  const nameLower = name.toLowerCase();

  // 1. Name blacklist — reject obviously wrong businesses
  for (const keyword of NAME_BLACKLIST) {
    if (nameLower.includes(keyword)) {
      return { passes: false, reason: `name blacklist: "${keyword}"` };
    }
  }

  // 2. Google Places type check — reject wrong categories
  for (const t of types) {
    if (REJECTED_GOOGLE_TYPES.includes(t)) {
      return { passes: false, reason: `rejected type: "${t}"` };
    }
  }

  // 3. Name whitelist — at least one sport/retail keyword must be present
  //    (either in name or in Google types like "store", "shopping_mall")
  const hasWhitelistName = NAME_WHITELIST.some((kw) => nameLower.includes(kw));
  const hasRetailType = types.some((t) =>
    ["store", "shopping_mall", "sporting_goods_store", "bicycle_store"].includes(t)
  );
  if (!hasWhitelistName && !hasRetailType) {
    return { passes: false, reason: "no sport/retail keyword in name or types" };
  }

  // 4. Website domain check — reject booking/accommodation sites
  if (website) {
    try {
      const domain = new URL(website).hostname.replace("www.", "");
      if (REJECTED_DOMAINS.some((d) => domain.includes(d))) {
        return { passes: false, reason: `rejected domain: "${domain}"` };
      }
    } catch {
      // invalid URL, not a reason to reject
    }
  }

  return { passes: true };
}

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
  google_place_id: string | null;
  foursquare_venue_id: string | null;
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
            "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.addressComponents,places.types",
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

    const results: DiscoveredStore[] = [];

    for (const p of places as Array<{
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      nationalPhoneNumber?: string;
      websiteUri?: string;
      id?: string;
      types?: string[];
      addressComponents?: Array<{
        types: string[];
        longText: string;
        shortText: string;
      }>;
    }>) {
      const name = p.displayName?.text ?? "Unknown";
      const types = p.types ?? [];

      // ── Quality Gate ──────────────────────────────────
      const check = passesQualityGates(name, types, p.websiteUri);
      if (!check.passes) {
        continue; // silently skip bad results
      }

      const components = p.addressComponents ?? [];
      const city =
        components.find((c) => c.types.includes("locality"))?.longText ?? "";
      const country =
        components.find((c) => c.types.includes("country"))?.longText ??
        location.country;
      const countryCode =
        components.find((c) => c.types.includes("country"))?.shortText ??
        location.countryCode;

      results.push({
        name,
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
      });
    }

    return results;
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

    const results: DiscoveredStore[] = [];

    for (const p of (data.results ?? []) as Array<{
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
    }>) {
      const name = p.name ?? "Unknown";

      // ── Quality Gate (no types from FSQ basic search) ──
      const check = passesQualityGates(name, [], p.website);
      if (!check.passes) {
        continue;
      }

      results.push({
        name,
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
      });
    }

    return results;
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
    // Exact platform ID match
    if (store.source === "google" && e.google_place_id && store.sourceId === e.google_place_id) return true;
    if (store.source === "foursquare" && e.foursquare_venue_id && store.sourceId === e.foursquare_venue_id) return true;

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
  // Filter resorts by region if specified
  let resorts = RESORT_LOCATIONS;
  if (REGION_FILTER) {
    resorts = RESORT_LOCATIONS.filter(
      (r) => r.region.toLowerCase() === REGION_FILTER.toLowerCase()
    );
    if (resorts.length === 0) {
      const regions = [...new Set(RESORT_LOCATIONS.map((r) => r.region))].sort();
      console.error(`No resorts found for region "${REGION_FILTER}".`);
      console.error(`Available regions: ${regions.join(", ")}`);
      process.exit(1);
    }
  }

  console.log("🏔️  WinterStores Discovery Pipeline\n");
  if (REGION_FILTER) {
    console.log(`Region filter: ${REGION_FILTER}`);
  }
  console.log(`Searching near ${resorts.length} ski resorts`);
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
    SELECT name, latitude, longitude, google_place_id, foursquare_venue_id FROM stores
  `;
  console.log(`Existing stores in DB: ${existingStores.length}\n`);

  const allDiscovered: DiscoveredStore[] = [];

  for (let i = 0; i < resorts.length; i++) {
    const resort = resorts[i];
    console.log(
      `[${i + 1}/${resorts.length}] Searching near ${resort.name}, ${resort.country}...`
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
  console.log(`Passed quality gates: ${allDiscovered.length}`);
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
