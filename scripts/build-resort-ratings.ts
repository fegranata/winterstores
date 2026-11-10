/**
 * Freeze the resort-level shop ratings behind /reports into a snapshot.
 *
 * Usage:
 *   npx tsx scripts/build-resort-ratings.ts                    # dry run: prints the table
 *   npx tsx scripts/build-resort-ratings.ts --commit           # writes the two files below
 *   npx tsx scripts/build-resort-ratings.ts --season 2027/28 --commit
 *
 * Writes (with --commit):
 *   src/lib/data/resort-ratings.json            — read by the /reports pages and resort pages
 *   public/data/ski-shop-ratings-by-resort.csv  — the public download
 *
 * Run it deliberately, not on a schedule: a report people cite should not
 * change under them. Once before the season (November) and, at most, once
 * mid-season after a large ratings refresh. The pages print the snapshot date.
 *
 * Cost: one slim select over `stores` (8 columns, ~1,400 rows). No API calls.
 * The method lives in src/lib/resort-ratings.ts; this file only does I/O.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { mkdirSync, writeFileSync } from "fs";
import { RESORTS } from "../src/lib/data/resorts";
import {
  computeResortRatings,
  snapshotToCsv,
  type RatingStoreInput,
} from "../src/lib/resort-ratings";

const COMMIT = process.argv.includes("--commit");
const seasonArg = process.argv.indexOf("--season");
const SEASON = seasonArg !== -1 ? process.argv[seasonArg + 1] : "2026/27";

const JSON_PATH = "src/lib/data/resort-ratings.json";
const CSV_PATH = "public/data/ski-shop-ratings-by-resort.csv";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
  try {
    const rows = await sql<
      {
        slug: string;
        name: string;
        city: string;
        latitude: number;
        longitude: number;
        winterstores_score: number;
        total_review_count: number;
        services: unknown;
      }[]
    >`select slug, name, city, latitude, longitude, winterstores_score, total_review_count, services from stores`;

    const stores: RatingStoreInput[] = rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      city: r.city,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      score: Number(r.winterstores_score),
      reviews: Number(r.total_review_count),
      services: Array.isArray(r.services) ? (r.services as string[]) : [],
    }));

    const snapshot = computeResortRatings(stores, RESORTS, {
      generatedAt: new Date().toISOString().slice(0, 10),
      season: SEASON,
    });

    const t = snapshot.totals;
    console.log(
      `${t.stores} stores, ${t.storesAssigned} within ${snapshot.method.radiusKm}km of a resort, ` +
        `${t.storesRated} rated (${t.reviews.toLocaleString("en-US")} reviews). ` +
        `${t.resortsRanked} of ${t.resorts} resorts ranked. Overall mean ${t.meanScore.toFixed(2)}.\n`
    );
    for (const r of snapshot.resorts) {
      console.log(
        `${r.rank === null ? " —" : String(r.rank).padStart(2)}  ${r.name.padEnd(24)} ` +
          `${r.score === null ? " n/a" : r.score.toFixed(2)}  ` +
          `${String(r.shops).padStart(3)} shops  ${String(r.reviews).padStart(6)} reviews  ` +
          `${Math.round(r.shareHigh * 100)}% ≥4.5`
      );
    }
    console.log("\nBy area:");
    for (const a of snapshot.areas) {
      console.log(`  ${a.name.padEnd(22)} ${a.score.toFixed(2)}  ${a.shops} shops, ${a.resorts} ranked resorts`);
    }

    if (!COMMIT) {
      console.log("\nDry run — nothing written. Re-run with --commit to write the snapshot.");
      return;
    }

    writeFileSync(JSON_PATH, JSON.stringify(snapshot, null, 2) + "\n");
    mkdirSync("public/data", { recursive: true });
    writeFileSync(CSV_PATH, snapshotToCsv(snapshot));
    console.log(`\nWrote ${JSON_PATH} and ${CSV_PATH}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
