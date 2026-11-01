/**
 * Refresh platform ratings on a schedule, with a hard spend ceiling.
 *
 * Background: ratings used to refresh during page render on a 30-minute TTL.
 * With 1,053 store pages under constant crawler traffic that wired Googlebot
 * straight to the Google Places bill — roughly $260 in two days. The response
 * at the time was to stop calling the API entirely, which left every rating
 * frozen since March.
 *
 * This is the middle ground: refreshing is a deliberate, capped, scheduled job
 * and the render path stays read-only forever. Cost per run is bounded by
 * --limit and is knowable before you press go, rather than being a function of
 * how much Googlebot feels like crawling.
 *
 * Usage:
 *   npx tsx scripts/refresh-ratings.ts                 # dry run, default cap
 *   npx tsx scripts/refresh-ratings.ts --limit 200     # preview 200 oldest
 *   npx tsx scripts/refresh-ratings.ts --limit 200 --commit
 *
 * Intended cadence: monthly. At ~1,050 stores a full pass is roughly 1,050
 * Google Place Details calls; check current Places pricing before raising the
 * cap, and note only stores with a googlePlaceId cost anything.
 */

import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const DEFAULT_LIMIT = 100;

const limitIdx = process.argv.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? Number(process.argv[limitIdx + 1]) : DEFAULT_LIMIT;
const COMMIT = process.argv.includes("--commit");

if (!Number.isInteger(LIMIT) || LIMIT <= 0) {
  console.error("--limit must be a positive integer");
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 3 });

interface StaleStore {
  id: string;
  name: string;
  google_place_id: string | null;
  fetched_at: Date | null;
}

async function main() {
  console.log("⭐ Rating refresh\n");
  console.log(`Mode:  ${COMMIT ? "COMMIT (will call APIs and write)" : "DRY RUN"}`);
  console.log(`Limit: ${LIMIT} stores\n`);

  // Oldest first, so repeated capped runs eventually cover everything rather
  // than refreshing the same rows.
  const stale = await sql<StaleStore[]>`
    SELECT s.id, s.name, s.google_place_id, c.fetched_at
    FROM stores s
    LEFT JOIN platform_ratings_cache c
      ON c.store_id = s.id AND c.platform = 'google'
    WHERE s.google_place_id IS NOT NULL
    ORDER BY c.fetched_at ASC NULLS FIRST
    LIMIT ${LIMIT}
  `;

  console.log(`Stores selected: ${stale.length}`);
  if (stale.length === 0) {
    console.log("Nothing to refresh.");
    return;
  }

  const oldest = stale[0]?.fetched_at;
  const newest = stale[stale.length - 1]?.fetched_at;
  console.log(`Staleness range: ${oldest ? oldest.toISOString().slice(0, 10) : "never"} → ${newest ? newest.toISOString().slice(0, 10) : "never"}`);
  console.log(`Google Place Details calls this run: ${stale.length}\n`);

  if (!COMMIT) {
    console.log("Sample:");
    stale.slice(0, 10).forEach((s) =>
      console.log(`  ${s.fetched_at ? s.fetched_at.toISOString().slice(0, 10) : "never     "}  ${s.name}`)
    );
    console.log("\nRe-run with --commit to actually call the APIs and write.");
    return;
  }

  if (!GOOGLE_KEY) {
    console.error("GOOGLE_PLACES_API_KEY is not set — nothing to refresh with.");
    process.exit(1);
  }

  let updated = 0;
  let failed = 0;
  let noRating = 0;
  // Same API call, one extra field: catches shops Google has marked closed,
  // so permanent closures surface every month instead of via one-off audits
  // (the 2026-09-07 audit found one this way). Never auto-deleted — closures
  // are listed at the end for a human decision.
  const closed: { name: string; status: string }[] = [];

  for (const [i, store] of stale.entries()) {
    process.stdout.write(`[${i + 1}/${stale.length}] ${store.name.slice(0, 45).padEnd(45)}`);

    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${store.google_place_id}`,
        {
          headers: {
            "X-Goog-Api-Key": GOOGLE_KEY,
            "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,businessStatus",
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.log(` ✗ HTTP ${res.status}`);
        failed++;
        continue;
      }

      const data = await res.json();
      if (data.businessStatus && data.businessStatus !== "OPERATIONAL") {
        closed.push({ name: store.name, status: data.businessStatus });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // A store Google has no rating for still gets a (null-rated) cache row:
      // without one its fetched_at stays NULL, it sorts to the front of every
      // oldest-first run, and the same ratingless stores eat the call budget
      // month after month. The render path ignores rows with a null rating.
      const rating: number | null = data.rating ?? null;
      const reviewCount: number = data.userRatingCount ?? 0;

      // platform_ratings_cache has only a plain index on (store_id, platform),
      // not a unique one, so ON CONFLICT cannot be used — the first scheduled
      // run (2026-11-01) failed every write that way and wasted 300 calls.
      // Delete-then-insert in one transaction, as verify-stores.ts does; it
      // also retires the ~1,000 historical duplicate rows one store at a time.
      await sql.begin(async (tx) => {
        await tx`
          DELETE FROM platform_ratings_cache
          WHERE store_id = ${store.id} AND platform = 'google'
        `;
        await tx`
          INSERT INTO platform_ratings_cache
            (id, store_id, platform, rating, review_count, platform_url, fetched_at, expires_at)
          VALUES (
            gen_random_uuid(), ${store.id}, 'google', ${rating}, ${reviewCount},
            ${data.googleMapsUri ?? ""}, ${now}, ${expiresAt}
          )
        `;
      });

      if (rating == null) {
        console.log(" – no rating (recorded, will not be retried for 30 days)");
        noRating++;
        continue;
      }

      console.log(` ✓ ${rating} (${reviewCount})`);
      updated++;
    } catch (err) {
      console.log(` ✗ ${(err as Error).message}`);
      failed++;
    }

    // Gentle on the API; this is a background job, not a user-facing path.
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`\nUpdated: ${updated}  No rating: ${noRating}  Failed: ${failed}  Calls made: ${stale.length}`);

  if (closed.length > 0) {
    console.log(`\n⚠ Non-operational per Google (${closed.length}) — review before removing anything.`);
    console.log(`  CLOSED_TEMPORARILY in the off-season is normal for ski shops.`);
    for (const c of closed) console.log(`  ${c.status.padEnd(20)} ${c.name}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
