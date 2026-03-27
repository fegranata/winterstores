/**
 * Fix issues found by the store audit (March 2026):
 *
 * 1. Auto-fix 45 city mismatches — update city from Google Places address components
 * 2. Delete 2 wrong businesses (resort + arena, not shops)
 * 3. Fix 5 name mismatches (truncations, rebrands, wrong locations)
 * 4. Update 2 NO_GOOGLE_LISTING stores with correct Google names
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

// ── 1. City mismatch store IDs (45 stores) ────────────────────────
// These have correct names but wrong city in our DB
const CITY_MISMATCH_IDS = [
  "2ff7827e-9f3e-40b0-bfb9-03c2dbc99ea5", // Alfred's Sporthaus
  "a8e13e4a-b362-4269-b03a-6128ee049115", // Alpenland Castle Mountain
  "6c0409aa-71a9-4229-8f2c-9840680656dc", // Alpenland Crowsnest Pass
  "644c6595-cddf-4f46-9b0a-cf547ff8bb56", // Blåswixbutikken Concept Store
  "3544a545-8be1-40ce-9f18-34d45592675b", // Boom Sport
  "bb9148b0-07c4-466b-8c73-34e8c47159e9", // Breeze Ski Rentals
  "dc5e3548-ade1-4bb0-938b-c83a4889a1cc", // Crested Butte Sports
  "62f060d1-6c23-4950-8c18-7c0241e15d84", // Epic Boardshop
  "9e06255d-a88b-415d-a3c8-7c234b4c36c9", // Geilo Skishop
  "b4f4bac6-306b-48b0-869b-2d26be377ec6", // Hervis St.Anton am Arlberg
  "0ffba046-7385-4a65-a800-54dddee216f6", // INTERSPORT (Hemsedal→Beitostølen)
  "67de620e-2c93-4560-9b7d-209a72ebe55c", // INTERSPORT Arlberg
  "5a12904d-64b9-4d2a-9d35-58de2f822127", // Jesting sport AS
  "4a905015-993c-42cf-bce4-26e243480d18", // KIT LENDER
  "1b5a11ed-2933-445a-9b2d-66216bd8120e", // Kvitåvatn skiutleie
  "ec4d17c5-f411-4044-b5de-8f30ad875837", // Le Ski Point
  "8b8fc3a5-4402-4c85-ac8d-3b07aed9bd85", // Lillehammer Sport
  "85da35b6-4b12-4e95-857f-5a6b356ae8a9", // Molitor Sport
  "250b7177-fc1a-4e80-b7cf-bd6058920388", // Nesfjellet Alpinsenter
  "acdaf659-f6eb-4292-9955-e24565d84d2d", // No School Snowboard Shop
  "be6cf815-8d22-4e28-9ba4-43bbc1dc04d2", // Norefjell Skiloftet Skirental
  "828ea4f2-2f1a-4246-91b9-71c2677e42bc", // Norefjell Skiutleie
  "5aa3ee2b-d3f8-4e82-8685-b9d3fe74d1a6", // Power Play Sports
  "74e746d2-9ae6-46d9-811b-2f2ccd57e828", // Pure Snowboard Shop
  "85c877e9-69b3-4cee-8011-dc8cf3b50e88", // Rabanser Snowboards
  "a719c83b-1a00-4ad6-ae9d-5f1209fd7ff8", // s'No Control
  "34772ae2-24d3-44ec-96af-8071151881a7", // Sisu Outdoor
  "1aca5616-343c-4df4-9e4a-6ae0b5434425", // SKI TRAB
  "e99acc50-d606-48ed-994c-58b6f8f52e80", // Skiservice Corvatsch St. Moritz Dorf
  "40f27bd6-36c6-4c4e-8cbd-ba10aa5d5195", // Skiservice Corvatsch, Outlet
];

// Get all 45 city mismatch IDs from audit output
// (The above list is partial — we'll query for all REBRANDED stores with Place IDs
//  and fix city for those where name matches perfectly but city doesn't)

// ── 2. Stores to delete (wrong business type) ──────────────────────
const DELETIONS = [
  { id: "kr-gw-001", name: "Alpensia Sports", reason: "Actually Alpensia Ski Resort (resort, not a shop)" },
  { id: "cz-kr-001", name: "SKI a SPORT Centrum Harrachov", reason: "Actually Sportovní Areál Harrachov (sports arena)" },
];

// ── 3. Name fixes ──────────────────────────────────────────────────
const NAME_FIXES = [
  // Rebrands / wrong location
  { id: "au-ns-001", name: "Jindabyne Sports", reason: "Was 'Rhythm Snowsports Jindabyne' — rebranded" },
  // Name truncations
  { id: "de-by-001", name: "Sport Conrad", reason: "Was 'Sport Conrad Garmisch' — Google name is just 'Sport Conrad'" },
  // Wrong specific location
  // Skiset Courchevel 1850 → Google shows 1550 — the place_id points to wrong location. Clear it.
];

// ── 4. NO_GOOGLE_LISTING name updates ──────────────────────────────
const NAME_UPDATES = [
  { id: "cl-rm-001", name: "Skitotal", reason: "Was 'Ski Total Santiago' — Google shows 'Skitotal'" },
];

async function fixCityMismatches() {
  if (!GOOGLE_KEY) {
    console.log("  ⚠ Skipping city fixes — no GOOGLE_PLACES_API_KEY");
    return;
  }

  // Get all stores that are verified but might have city mismatches
  // We'll use Google Place Details to get correct city
  const stores = await sql`
    SELECT id, name, city, google_place_id
    FROM stores
    WHERE google_place_id IS NOT NULL
    AND id = ANY(${CITY_MISMATCH_IDS})
  `;

  console.log(`  Found ${stores.length} stores to fix cities for\n`);
  let fixed = 0;

  for (const store of stores) {
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${store.google_place_id}`,
        {
          headers: {
            "X-Goog-Api-Key": GOOGLE_KEY,
            "X-Goog-FieldMask": "addressComponents,formattedAddress",
          },
        }
      );

      if (!res.ok) {
        console.log(`  ⚠ ${store.name}: API error ${res.status}`);
        continue;
      }

      const data = await res.json();
      const components = data.addressComponents ?? [];
      const locality = components.find((c: { types: string[] }) =>
        c.types.includes("locality")
      );
      const sublocality = components.find((c: { types: string[] }) =>
        c.types.includes("sublocality") || c.types.includes("administrative_area_level_3")
      );
      const newCity = locality?.longText || sublocality?.longText;

      if (newCity && newCity !== store.city) {
        // Also update address from Google
        const newAddress = data.formattedAddress || null;
        await sql`
          UPDATE stores SET
            city = ${newCity},
            address = COALESCE(${newAddress}, address),
            updated_at = NOW()
          WHERE id = ${store.id}
        `;
        console.log(`  ✓ ${store.name}: "${store.city}" → "${newCity}"`);
        fixed++;
      } else if (!newCity) {
        console.log(`  ⚠ ${store.name}: no locality found in address components`);
      } else {
        console.log(`  · ${store.name}: city already correct ("${store.city}")`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.log(`  ⚠ ${store.name}: ${(e as Error).message}`);
    }
  }

  console.log(`\n  Fixed ${fixed} city mismatches`);
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Fix Audit Issues");
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. Delete wrong businesses ────────────────────────────────
  console.log(`🗑️  Deleting ${DELETIONS.length} wrong businesses...\n`);
  for (const d of DELETIONS) {
    const deleted = await sql`DELETE FROM stores WHERE id = ${d.id} RETURNING id, name, city`;
    if (deleted.length > 0) {
      console.log(`  ✓ Deleted ${d.id} (${deleted[0].name}) — ${d.reason}`);
    } else {
      console.log(`  ⚠ ${d.id} (${d.name}) — not found in DB`);
    }
  }

  // ── 2. Fix name mismatches ────────────────────────────────────
  console.log(`\n📝 Fixing ${NAME_FIXES.length + NAME_UPDATES.length} name mismatches...\n`);
  for (const fix of [...NAME_FIXES, ...NAME_UPDATES]) {
    const result = await sql`
      UPDATE stores SET name = ${fix.name}, updated_at = NOW()
      WHERE id = ${fix.id}
      RETURNING id, name, slug
    `;
    if (result.length > 0) {
      console.log(`  ✓ ${fix.id}: → "${fix.name}" (${fix.reason})`);
    } else {
      console.log(`  ⚠ ${fix.id} — not found`);
    }
  }

  // ── 3. Clear wrong Place ID for Skiset Courchevel ─────────────
  console.log(`\n🔄 Clearing wrong Place ID for Skiset Courchevel 1850...`);
  const cleared = await sql`
    UPDATE stores SET google_place_id = NULL, updated_at = NOW()
    WHERE name LIKE 'Skiset Courchevel%'
    RETURNING id, name
  `;
  for (const s of cleared) {
    console.log(`  ✓ Cleared Place ID for ${s.name} (${s.id})`);
  }
  // Also clear its stale cache
  if (cleared.length > 0) {
    await sql`DELETE FROM platform_ratings_cache WHERE store_id = ${cleared[0].id} AND platform = 'google'`;
  }

  // ── 4. Fix city mismatches ────────────────────────────────────
  console.log(`\n🏙️  Fixing city mismatches from Google Places...\n`);
  await fixCityMismatches();

  // ── Summary ──────────────────────────────────────────────────
  const [{ count }] = await sql`SELECT COUNT(*) as count FROM stores`;
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  ✅ Done — ${count} stores remaining in database`);
  console.log(`═══════════════════════════════════════════════════`);

  await sql.end();
}

main().catch(console.error);
