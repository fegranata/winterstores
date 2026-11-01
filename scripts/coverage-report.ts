/**
 * Report resorts with thin store coverage, so the maintenance routine (and
 * humans) know where to run discovery next.
 *
 * Usage:
 *   npx tsx scripts/coverage-report.ts                # threshold 5, radius 30km
 *   npx tsx scripts/coverage-report.ts --threshold 3
 *   npx tsx scripts/coverage-report.ts --max 5        # cap the THIN line to 5
 *
 * The last line of output is machine-readable:
 *   THIN: Resort A,Resort B,...
 * (empty after the colon when nothing is thin). Resorts are listed thinnest
 * first so a capped run spends its budget where it matters most.
 *
 * Cost: one small select (lat/lng only) — no API calls.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { RESORTS } from "../src/lib/data/resorts";
import { haversineDistance } from "../src/lib/geo";

const arg = (name: string, fallback: number) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? Number(process.argv[i + 1]) : fallback;
};
const THRESHOLD = arg("--threshold", 5);
const RADIUS_KM = arg("--radius", 30);
const MAX = arg("--max", Number.MAX_SAFE_INTEGER);

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
  try {
    const rows: { latitude: number; longitude: number }[] =
      await sql`select latitude, longitude from stores`;

    const thin = RESORTS.map((resort) => ({
      name: resort.name,
      count: rows.filter(
        (r) =>
          haversineDistance(resort.lat, resort.lng, r.latitude, r.longitude) <=
          RADIUS_KM
      ).length,
    }))
      .filter((r) => r.count < THRESHOLD)
      .sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));

    console.log(`Stores: ${rows.length}  Resorts: ${RESORTS.length}  Radius: ${RADIUS_KM}km  Threshold: <${THRESHOLD}`);
    console.log(`Thin resorts: ${thin.length}`);
    for (const r of thin) console.log(`  ${String(r.count).padStart(2)}  ${r.name}`);
    console.log(`THIN: ${thin.slice(0, MAX).map((r) => r.name).join(",")}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
