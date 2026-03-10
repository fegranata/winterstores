/**
 * Lookup Platform IDs for Existing Stores
 *
 * This script searches Google Places, Facebook, and Foursquare APIs
 * to find matching business IDs for all stores in the database.
 *
 * Usage:
 *   npx tsx scripts/lookup-platform-ids.ts
 *
 * Required env vars in .env.local:
 *   GOOGLE_PLACES_API_KEY, FACEBOOK_ACCESS_TOKEN, FOURSQUARE_API_KEY
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// ─── API Keys ────────────────────────────────────────────
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const FB_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FSQ_KEY = process.env.FOURSQUARE_API_KEY;

interface Store {
  id: string;
  name: string;
  city: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  google_place_id: string | null;
  facebook_page_id: string | null;
  foursquare_venue_id: string | null;
}

// ─── Google Places: Text Search ──────────────────────────
async function lookupGoogle(store: Store): Promise<string | null> {
  if (!GOOGLE_KEY) return null;
  if (store.google_place_id) return store.google_place_id; // already set

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName",
        },
        body: JSON.stringify({
          textQuery: `${store.name} ${store.city} ${store.country}`,
          locationBias: {
            circle: {
              center: { latitude: store.latitude, longitude: store.longitude },
              radius: 5000,
            },
          },
          maxResultCount: 1,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log(`    [DEBUG Google] ${res.status} ${res.statusText}: ${errText.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    if (!data.places?.length) {
      console.log(`    [DEBUG Google] 200 OK but no places in response`);
    }
    return data.places?.[0]?.id ?? null;
  } catch (err) {
    console.log(`    [DEBUG Google] Exception: ${err}`);
    return null;
  }
}

// ─── Facebook: Page Search ───────────────────────────────
async function lookupFacebook(store: Store): Promise<string | null> {
  if (!FB_TOKEN) return null;
  if (store.facebook_page_id) return store.facebook_page_id;

  try {
    const params = new URLSearchParams({
      q: store.name,
      type: "page",
      fields: "id,name,location",
      access_token: FB_TOKEN,
      limit: "5",
    });

    const res = await fetch(
      `https://graph.facebook.com/v21.0/pages/search?${params}`
    );

    if (!res.ok) return null;
    const data = await res.json();

    // Try to match by name similarity and location
    const pages = data.data ?? [];
    for (const page of pages) {
      const nameMatch =
        page.name?.toLowerCase().includes(store.name.toLowerCase()) ||
        store.name.toLowerCase().includes(page.name?.toLowerCase());
      if (nameMatch) return page.id;
    }

    // Fallback: return first result if any
    return pages[0]?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Foursquare: Place Match ─────────────────────────────
async function lookupFoursquare(store: Store): Promise<string | null> {
  if (!FSQ_KEY) return null;
  if (store.foursquare_venue_id) return store.foursquare_venue_id;

  try {
    const params = new URLSearchParams({
      name: store.name,
      ll: `${store.latitude},${store.longitude}`,
    });

    const res = await fetch(
      `https://api.foursquare.com/v3/places/match?${params}`,
      {
        headers: {
          Authorization: FSQ_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log(`    [DEBUG FSQ Match] ${res.status} ${res.statusText}: ${errText.slice(0, 200)}`);
      // Fallback to search if match endpoint fails
      return await searchFoursquare(store);
    }

    const data = await res.json();
    if (!data.place?.fsq_id) {
      console.log(`    [DEBUG FSQ Match] 200 OK but no place in response`);
    }
    return data.place?.fsq_id ?? null;
  } catch (err) {
    console.log(`    [DEBUG FSQ Match] Exception: ${err}`);
    return await searchFoursquare(store);
  }
}

async function searchFoursquare(store: Store): Promise<string | null> {
  if (!FSQ_KEY) return null;

  try {
    const params = new URLSearchParams({
      query: store.name,
      ll: `${store.latitude},${store.longitude}`,
      radius: "5000",
      limit: "1",
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

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log(`    [DEBUG FSQ Search] ${res.status} ${res.statusText}: ${errText.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    if (!data.results?.length) {
      console.log(`    [DEBUG FSQ Search] 200 OK but no results`);
    }
    return data.results?.[0]?.fsq_id ?? null;
  } catch (err) {
    console.log(`    [DEBUG FSQ Search] Exception: ${err}`);
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log("🔍 Looking up platform IDs for all stores...\n");
  console.log("API keys configured:");
  console.log(`  Google Places: ${GOOGLE_KEY ? "✅" : "❌ (skipping)"}`);
  console.log(`  Facebook:      ${FB_TOKEN ? "✅" : "❌ (skipping)"}`);
  console.log(`  Foursquare:    ${FSQ_KEY ? "✅" : "❌ (skipping)"}`);
  console.log("");

  const stores: Store[] = await sql`
    SELECT id, name, city, country, country_code, latitude, longitude,
           google_place_id, facebook_page_id, foursquare_venue_id
    FROM stores
    ORDER BY name
  `;

  console.log(`Found ${stores.length} stores to process.\n`);

  const report = {
    google: { found: 0, skipped: 0, failed: 0 },
    facebook: { found: 0, skipped: 0, failed: 0 },
    foursquare: { found: 0, skipped: 0, failed: 0 },
  };

  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    console.log(
      `[${i + 1}/${stores.length}] ${store.name} (${store.city}, ${store.country})`
    );

    // Lookup all platforms in parallel
    const [googleId, fbId, fsqId] = await Promise.all([
      lookupGoogle(store),
      lookupFacebook(store),
      lookupFoursquare(store),
    ]);

    // Track results
    const updates: string[] = [];

    if (GOOGLE_KEY) {
      if (store.google_place_id) report.google.skipped++;
      else if (googleId) {
        report.google.found++;
        updates.push(`google_place_id = '${googleId}'`);
        console.log(`  ✅ Google: ${googleId}`);
      } else {
        report.google.failed++;
        console.log(`  ❌ Google: not found`);
      }
    }

    if (FB_TOKEN) {
      if (store.facebook_page_id) report.facebook.skipped++;
      else if (fbId) {
        report.facebook.found++;
        updates.push(`facebook_page_id = '${fbId}'`);
        console.log(`  ✅ Facebook: ${fbId}`);
      } else {
        report.facebook.failed++;
        console.log(`  ❌ Facebook: not found`);
      }
    }

    if (FSQ_KEY) {
      if (store.foursquare_venue_id) report.foursquare.skipped++;
      else if (fsqId) {
        report.foursquare.found++;
        updates.push(`foursquare_venue_id = '${fsqId}'`);
        console.log(`  ✅ Foursquare: ${fsqId}`);
      } else {
        report.foursquare.failed++;
        console.log(`  ❌ Foursquare: not found`);
      }
    }

    // Update DB if any new IDs found
    if (updates.length > 0) {
      const setClauses = updates.join(", ");
      await sql.unsafe(
        `UPDATE stores SET ${setClauses}, updated_at = NOW() WHERE id = '${store.id}'`
      );
    }

    // Rate limiting: small delay between stores
    await new Promise((r) => setTimeout(r, 200));
  }

  // Print report
  console.log("\n" + "=".repeat(50));
  console.log("📊 REPORT");
  console.log("=".repeat(50));

  for (const [platform, stats] of Object.entries(report)) {
    const key =
      platform === "google"
        ? GOOGLE_KEY
        : platform === "facebook"
        ? FB_TOKEN
        : FSQ_KEY;

    if (!key) {
      console.log(`  ${platform.padEnd(12)} — SKIPPED (no API key)`);
      continue;
    }

    console.log(
      `  ${platform.padEnd(12)} — Found: ${stats.found}, Already set: ${stats.skipped}, Not found: ${stats.failed}`
    );
  }

  console.log("\nDone!");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
