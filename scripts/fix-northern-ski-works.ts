/**
 * Fix Northern Ski Works data:
 * 1. Fix the wrong Google Place ID for the Stowe location (currently pointing to Inner Bootworks)
 * 2. Add Killington and Okemo locations
 * 3. Look up correct Google Place IDs for all three locations
 *
 * Usage: npx tsx scripts/fix-northern-ski-works.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

// ─── Google Places Lookup ─────────────────────────────────
async function lookupGooglePlaceId(
  query: string,
  lat: number,
  lng: number
): Promise<string | null> {
  if (!GOOGLE_KEY) {
    console.log("  ⚠️  No GOOGLE_PLACES_API_KEY — skipping Google lookup");
    return null;
  }

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.googleMapsUri",
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 2000,
            },
          },
          maxResultCount: 3,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log(`  ❌ Google API ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const places = data.places ?? [];

    if (places.length === 0) {
      console.log("  ❌ Google: no results");
      return null;
    }

    // Log all results for verification
    for (const p of places) {
      console.log(
        `    → ${p.displayName?.text ?? "?"} | ${p.formattedAddress ?? "?"} | ${p.id}`
      );
    }

    return places[0].id;
  } catch (err) {
    console.log(`  ❌ Google exception: ${err}`);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log("🔧 Fixing Northern Ski Works data...\n");

  // ── Step 1: Fix Stowe's Google Place ID ──────────────────
  console.log("═══ Step 1: Fix Stowe Google Place ID ═══");
  console.log("Current issue: google_place_id points to Inner Bootworks\n");

  // Delete stale cache entry
  const deletedCache = await sql`
    DELETE FROM platform_ratings_cache
    WHERE store_id = 'us-vt-001' AND platform = 'google'
  `;
  console.log(`Deleted stale Google cache for us-vt-001 (${deletedCache.count} rows)\n`);

  // Search for the correct Place ID using the street address
  console.log("Looking up: Northern Ski Works 7 S Main St Stowe VT");
  const stoweGoogleId = await lookupGooglePlaceId(
    "Northern Ski Works 7 S Main St Stowe Vermont",
    44.4654,
    -72.6874
  );

  if (stoweGoogleId) {
    await sql`
      UPDATE stores
      SET google_place_id = ${stoweGoogleId}, updated_at = NOW()
      WHERE id = 'us-vt-001'
    `;
    console.log(`\n✅ Updated Stowe google_place_id → ${stoweGoogleId}\n`);
  } else {
    // Clear the wrong one so it falls back to lat/lng maps link
    await sql`
      UPDATE stores
      SET google_place_id = NULL, updated_at = NOW()
      WHERE id = 'us-vt-001'
    `;
    console.log("\n⚠️  Could not find correct Place ID — cleared the wrong one\n");
  }

  // ── Step 2: Add Killington location ──────────────────────
  console.log("═══ Step 2: Add Killington location ═══");

  const killingtonExists = await sql`SELECT id FROM stores WHERE id = 'us-vt-002'`;
  if (killingtonExists.length > 0) {
    console.log("Killington entry already exists — skipping insert\n");
  } else {
    await sql`
      INSERT INTO stores (
        id, slug, name, description,
        address, city, region, country, country_code, postal_code,
        latitude, longitude,
        sport_types, services, price_level,
        website, has_online_shop, online_shop_url,
        phone, email,
        winterstores_score, total_review_count,
        google_place_id,
        photos, cover_photo,
        is_verified, created_at, updated_at
      ) VALUES (
        'us-vt-002',
        'northern-ski-works-killington',
        'Northern Ski Works',
        'Northern Ski Works Killington location on the Killington Resort access road, offering expert boot fitting, rentals, and a massive demo fleet.',
        '2089 Killington Road',
        'Killington',
        'Vermont',
        'United States',
        'US',
        '05751',
        43.6433,
        -72.7881,
        '["skiing","snowboarding","cross-country","snowshoeing"]'::jsonb,
        '["rentals","repairs","boot-fitting","waxing","used-gear"]'::jsonb,
        2,
        'https://www.northernskiworks.com',
        true,
        'https://www.northernskiworks.com/shop',
        '+1-802-422-9675',
        NULL,
        0,
        0,
        NULL,
        '[]'::jsonb,
        NULL,
        true,
        NOW(),
        NOW()
      )
    `;
    console.log("✅ Inserted Killington store (us-vt-002)\n");
  }

  // Look up Google Place ID for Killington
  console.log("Looking up: Northern Ski Works 2089 Killington Road VT");
  const killingtonGoogleId = await lookupGooglePlaceId(
    "Northern Ski Works 2089 Killington Road Killington Vermont",
    43.6433,
    -72.7881
  );

  if (killingtonGoogleId) {
    await sql`
      UPDATE stores
      SET google_place_id = ${killingtonGoogleId}, updated_at = NOW()
      WHERE id = 'us-vt-002'
    `;
    console.log(`✅ Updated Killington google_place_id → ${killingtonGoogleId}\n`);
  }

  // ── Step 3: Add Okemo/Ludlow location ────────────────────
  console.log("═══ Step 3: Add Okemo/Ludlow location ═══");

  const okemoExists = await sql`SELECT id FROM stores WHERE id = 'us-vt-003'`;
  if (okemoExists.length > 0) {
    console.log("Okemo entry already exists — skipping insert\n");
  } else {
    await sql`
      INSERT INTO stores (
        id, slug, name, description,
        address, city, region, country, country_code, postal_code,
        latitude, longitude,
        sport_types, services, price_level,
        website, has_online_shop, online_shop_url,
        phone, email,
        winterstores_score, total_review_count,
        google_place_id,
        photos, cover_photo,
        is_verified, created_at, updated_at
      ) VALUES (
        'us-vt-003',
        'northern-ski-works-okemo',
        'Northern Ski Works',
        'Northern Ski Works Okemo location in downtown Ludlow, serving Okemo Mountain Resort skiers with expert boot fitting, rentals, and gear sales.',
        '10 Main Street',
        'Ludlow',
        'Vermont',
        'United States',
        'US',
        '05149',
        43.3968,
        -72.6918,
        '["skiing","snowboarding","cross-country","snowshoeing"]'::jsonb,
        '["rentals","repairs","boot-fitting","waxing","used-gear"]'::jsonb,
        2,
        'https://www.northernskiworks.com',
        true,
        'https://www.northernskiworks.com/shop',
        '+1-802-228-3344',
        NULL,
        0,
        0,
        NULL,
        '[]'::jsonb,
        NULL,
        true,
        NOW(),
        NOW()
      )
    `;
    console.log("✅ Inserted Okemo store (us-vt-003)\n");
  }

  // Look up Google Place ID for Okemo
  console.log("Looking up: Northern Ski Works 10 Main Street Ludlow VT");
  const okemoGoogleId = await lookupGooglePlaceId(
    "Northern Ski Works 10 Main Street Ludlow Vermont",
    43.3968,
    -72.6918
  );

  if (okemoGoogleId) {
    await sql`
      UPDATE stores
      SET google_place_id = ${okemoGoogleId}, updated_at = NOW()
      WHERE id = 'us-vt-003'
    `;
    console.log(`✅ Updated Okemo google_place_id → ${okemoGoogleId}\n`);
  }

  // ── Summary ──────────────────────────────────────────────
  console.log("\n═══ Final State ═══");
  const results = await sql`
    SELECT id, slug, name, city, address, google_place_id
    FROM stores
    WHERE id IN ('us-vt-001', 'us-vt-002', 'us-vt-003')
    ORDER BY id
  `;

  for (const r of results) {
    console.log(
      `  ${r.id} | ${r.slug} | ${r.city} | ${r.address} | google=${r.google_place_id ?? "null"}`
    );
  }

  console.log("\n🎉 Done!");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
