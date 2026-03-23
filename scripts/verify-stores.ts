/**
 * Batch-verify unverified stores by fetching Google ratings.
 *
 * For each store with is_verified=false and a google_place_id:
 *   1. Calls Google Places API to get rating + review count
 *   2. Updates winterstores_score and total_review_count
 *   3. Caches the result in platform_ratings_cache
 *   4. Sets is_verified = true
 *
 * Stores without a google_place_id are skipped.
 *
 * Usage:
 *   npx tsx scripts/verify-stores.ts              (all unverified)
 *   npx tsx scripts/verify-stores.ts --country US  (filter by country code)
 *   npx tsx scripts/verify-stores.ts --dry-run     (preview only, no writes)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const DRY_RUN = process.argv.includes("--dry-run");
const countryIdx = process.argv.indexOf("--country");
const COUNTRY_FILTER = countryIdx !== -1 ? process.argv[countryIdx + 1] : null;

// Rate limit: ~5 requests per second to stay under Google quota
const BATCH_SIZE = 5;
const DELAY_MS = 1200;

interface UnverifiedStore {
  id: string;
  name: string;
  city: string;
  country_code: string;
  google_place_id: string;
}

async function fetchGoogleRating(placeId: string): Promise<{
  rating: number;
  reviewCount: number;
  mapsUrl: string;
} | null> {
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.rating) return null;
    return {
      rating: data.rating,
      reviewCount: data.userRatingCount ?? 0,
      mapsUrl: data.googleMapsUri ?? "",
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Batch Store Verification");
  console.log("═══════════════════════════════════════════════════\n");

  if (!GOOGLE_KEY) {
    console.error("GOOGLE_PLACES_API_KEY not set");
    process.exit(1);
  }

  // Find unverified stores with Google Place IDs
  let stores: UnverifiedStore[];
  if (COUNTRY_FILTER) {
    stores = await sql`
      SELECT id, name, city, country_code, google_place_id
      FROM stores
      WHERE is_verified = false AND google_place_id IS NOT NULL
        AND country_code = ${COUNTRY_FILTER}
      ORDER BY country_code, city, name
    `;
  } else {
    stores = await sql`
      SELECT id, name, city, country_code, google_place_id
      FROM stores
      WHERE is_verified = false AND google_place_id IS NOT NULL
      ORDER BY country_code, city, name
    `;
  }

  // Also count stores without Place IDs
  const [{ count: noPlaceId }] = await sql`
    SELECT COUNT(*) as count FROM stores
    WHERE is_verified = false AND google_place_id IS NULL
  `;

  console.log(`Unverified stores with Place ID: ${stores.length}`);
  console.log(`Unverified stores without Place ID: ${noPlaceId} (skipped)`);
  if (COUNTRY_FILTER) console.log(`Country filter: ${COUNTRY_FILTER}`);
  if (DRY_RUN) console.log("Mode: DRY RUN (no writes)");
  console.log("");

  let verified = 0;
  let failed = 0;
  let noRating = 0;

  for (let i = 0; i < stores.length; i += BATCH_SIZE) {
    const batch = stores.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (store) => {
        const rating = await fetchGoogleRating(store.google_place_id);
        return { store, rating };
      })
    );

    for (const { store, rating } of results) {
      if (!rating) {
        noRating++;
        if (i < 50) { // Only log first 50 failures
          console.log(`  ⚠ ${store.name} (${store.city}) — no rating found`);
        }
        continue;
      }

      if (DRY_RUN) {
        console.log(
          `  [DRY] ${store.name} (${store.city}) → ${rating.rating}★ (${rating.reviewCount} reviews)`
        );
        verified++;
        continue;
      }

      // Update store with rating and mark as verified
      await sql`
        UPDATE stores SET
          winterstores_score = ${rating.rating},
          total_review_count = ${rating.reviewCount},
          is_verified = true,
          updated_at = NOW()
        WHERE id = ${store.id}
      `;

      // Upsert platform_ratings_cache (delete + insert, no unique constraint)
      await sql`DELETE FROM platform_ratings_cache WHERE store_id = ${store.id} AND platform = 'google'`;
      await sql`
        INSERT INTO platform_ratings_cache (
          id, store_id, platform, rating, review_count, platform_url, fetched_at, expires_at
        ) VALUES (
          gen_random_uuid(), ${store.id}, 'google',
          ${rating.rating}, ${rating.reviewCount}, ${rating.mapsUrl}, NOW(), NOW() + interval '30 minutes'
        )
      `;

      verified++;
      if (verified % 50 === 0 || verified <= 10) {
        console.log(
          `  ✓ [${verified}/${stores.length}] ${store.name} (${store.city}) → ${rating.rating}★ (${rating.reviewCount} reviews)`
        );
      }
    }

    // Rate limiting
    if (i + BATCH_SIZE < stores.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // Final stats
  const [{ total }] = await sql`SELECT COUNT(*) as total FROM stores WHERE is_verified = true`;
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Results:`);
  console.log(`    Verified:    ${verified}`);
  console.log(`    No rating:   ${noRating}`);
  console.log(`    Failed:      ${failed}`);
  console.log(`    Total verified in DB: ${total}`);
  console.log(`═══════════════════════════════════════════════════`);

  await sql.end();
}

main().catch(console.error);
