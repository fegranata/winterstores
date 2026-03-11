/**
 * Store Mapping Audit Framework
 *
 * Validates all store listings against Google Places to detect:
 * - Wrong Google Place IDs (e.g., Place ID points to a different business)
 * - Ghost entries (fabricated stores with no website + no Google listing)
 * - Missing Place IDs (real stores without a linked Google listing)
 *
 * Usage:
 *   npx tsx scripts/audit-stores.ts              # Report only
 *   npx tsx scripts/audit-stores.ts --fix        # Report + apply fixes
 *   npx tsx scripts/audit-stores.ts --store us-co-001   # Audit single store
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import * as readline from "readline";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const args = process.argv.slice(2);
const FIX_MODE = args.includes("--fix");
const SINGLE_STORE = args.find((a) => a.startsWith("--store"))
  ? args[args.indexOf("--store") + 1]
  : undefined;

// ─── Types ────────────────────────────────────────────────
interface StoreRow {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  website: string | null;
  has_online_shop: boolean;
  online_shop_url: string | null;
  phone: string | null;
  google_place_id: string | null;
  facebook_page_id: string | null;
  foursquare_venue_id: string | null;
  is_verified: boolean;
}

type AuditCategory =
  | "VERIFIED"
  | "WRONG_PLACE_ID"
  | "MISSING_PLACE_ID"
  | "NO_GOOGLE_LISTING"
  | "GHOST"
  | "REBRANDED"
  | "WEBSITE_BROKEN"
  | "NEEDS_INVESTIGATION";

interface GooglePlaceInfo {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
}

interface AuditResult {
  store: StoreRow;
  category: AuditCategory;
  websiteStatus: "working" | "broken" | "null" | "skipped";
  googleStatus: "matches" | "mismatch" | "missing" | "not_found" | "skipped";
  googleDetails?: GooglePlaceInfo;
  suggestedPlaceId?: string;
  suggestedPlaceName?: string;
  nameMatchScore?: number;
  notes: string[];
  recommendedAction: "KEEP" | "DELETE" | "UPDATE_PLACE_ID" | "SET_PLACE_ID" | "INVESTIGATE";
}

// ─── Fuzzy Name Matching ──────────────────────────────────
const STOP_WORDS = new Set([
  "the", "and", "&", "of", "in", "at", "de", "la", "le", "les",
  "el", "di", "del", "das", "der", "die", "und", "och", "et",
]);

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[''`]/g, "'")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(name: string): string[] {
  return normalize(name)
    .split(" ")
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

function bigrams(str: string): Set<string> {
  const s = normalize(str);
  const result = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    result.add(s.slice(i, i + 2));
  }
  return result;
}

function jaccardTokens(a: string, b: string): number {
  const tokA = new Set(tokenize(a));
  const tokB = new Set(tokenize(b));
  if (tokA.size === 0 && tokB.size === 0) return 1;
  let intersection = 0;
  for (const t of tokA) if (tokB.has(t)) intersection++;
  const union = new Set([...tokA, ...tokB]).size;
  return union === 0 ? 0 : intersection / union;
}

function diceBigrams(a: string, b: string): number {
  const bgA = bigrams(a);
  const bgB = bigrams(b);
  if (bgA.size === 0 && bgB.size === 0) return 1;
  let intersection = 0;
  for (const bg of bgA) if (bgB.has(bg)) intersection++;
  const total = bgA.size + bgB.size;
  return total === 0 ? 0 : (2 * intersection) / total;
}

function computeNameSimilarity(dbName: string, googleName: string): number {
  const jaccard = jaccardTokens(dbName, googleName);
  const dice = diceBigrams(dbName, googleName);
  // Weighted average: tokens matter more for business names
  return jaccard * 0.6 + dice * 0.4;
}

function cityMatches(dbCity: string, googleAddress: string): boolean {
  const addr = normalize(googleAddress);
  const city = normalize(dbCity);
  return addr.includes(city);
}

// ─── URL Checking ─────────────────────────────────────────
async function checkUrl(
  url: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (res.ok) return { ok: true };

    // HEAD might be blocked, try GET
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 8000);
    const res2 = await fetch(url, {
      method: "GET",
      signal: controller2.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId2);

    return res2.ok
      ? { ok: true }
      : { ok: false, error: `HTTP ${res2.status}` };
  } catch (err: any) {
    return { ok: false, error: err.message?.slice(0, 80) || "unknown" };
  }
}

// ─── Google Places API ────────────────────────────────────
async function fetchPlaceDetails(
  placeId: string
): Promise<GooglePlaceInfo | null> {
  if (!GOOGLE_KEY) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask":
            "displayName,formattedAddress,rating,userRatingCount",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      placeId,
      displayName: data.displayName?.text ?? "",
      formattedAddress: data.formattedAddress ?? "",
      rating: data.rating,
      userRatingCount: data.userRatingCount,
    };
  } catch {
    return null;
  }
}

async function searchForPlace(
  store: StoreRow
): Promise<
  { placeId: string; displayName: string; address: string; score: number } | null
> {
  if (!GOOGLE_KEY) return null;
  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress",
        },
        body: JSON.stringify({
          textQuery: `${store.name} ${store.city} ${store.country}`,
          locationBias: {
            circle: {
              center: {
                latitude: store.latitude,
                longitude: store.longitude,
              },
              radius: 5000,
            },
          },
          maxResultCount: 3,
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const places = data.places ?? [];
    if (places.length === 0) return null;

    // Find best match by name similarity
    let best: (typeof places)[0] | null = null;
    let bestScore = -1;
    for (const p of places) {
      const name = p.displayName?.text ?? "";
      const score = computeNameSimilarity(store.name, name);
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }

    if (!best) return null;
    return {
      placeId: best.id,
      displayName: best.displayName?.text ?? "",
      address: best.formattedAddress ?? "",
      score: bestScore,
    };
  } catch {
    return null;
  }
}

// ─── Per-Store Audit ──────────────────────────────────────
async function auditStore(store: StoreRow): Promise<AuditResult> {
  const notes: string[] = [];
  let websiteStatus: AuditResult["websiteStatus"] = "skipped";
  let googleStatus: AuditResult["googleStatus"] = "skipped";
  let googleDetails: GooglePlaceInfo | undefined;
  let suggestedPlaceId: string | undefined;
  let suggestedPlaceName: string | undefined;
  let nameMatchScore: number | undefined;

  // ── A. Website check ──
  if (store.website === null) {
    websiteStatus = "null";
    notes.push("No website URL in database");
  } else {
    const result = await checkUrl(store.website);
    websiteStatus = result.ok ? "working" : "broken";
    if (!result.ok) {
      notes.push(`Website broken: ${result.error}`);
    }
  }

  // ── B. Google Place ID validation ──
  if (!GOOGLE_KEY) {
    googleStatus = "skipped";
    notes.push("Google API key not configured");
  } else if (store.google_place_id) {
    // Verify existing Place ID
    const details = await fetchPlaceDetails(store.google_place_id);
    if (!details) {
      googleStatus = "not_found";
      notes.push(
        `Place ID ${store.google_place_id} returned no data (invalid or deleted)`
      );
    } else {
      googleDetails = details;
      nameMatchScore = computeNameSimilarity(store.name, details.displayName);
      const inCity = cityMatches(store.city, details.formattedAddress);

      if (nameMatchScore >= 0.7 && inCity) {
        googleStatus = "matches";
      } else if (nameMatchScore >= 0.7 && !inCity) {
        googleStatus = "mismatch";
        notes.push(
          `Name matches ("${details.displayName}") but city mismatch: expected "${store.city}", got "${details.formattedAddress}"`
        );
      } else if (nameMatchScore >= 0.4) {
        googleStatus = "mismatch";
        notes.push(
          `Possible rebrand: DB="${store.name}" → Google="${details.displayName}" (score=${nameMatchScore.toFixed(2)})`
        );
      } else {
        googleStatus = "mismatch";
        notes.push(
          `WRONG Place ID: DB="${store.name}" → Google="${details.displayName}" at "${details.formattedAddress}" (score=${nameMatchScore.toFixed(2)})`
        );
      }
    }
  } else {
    // No Place ID — search for one
    const result = await searchForPlace(store);
    if (result && result.score >= 0.4) {
      googleStatus = "missing";
      suggestedPlaceId = result.placeId;
      suggestedPlaceName = result.displayName;
      nameMatchScore = result.score;
      notes.push(
        `Found: "${result.displayName}" (${result.placeId}, score=${result.score.toFixed(2)})`
      );
    } else if (result) {
      googleStatus = "not_found";
      nameMatchScore = result.score;
      notes.push(
        `Search returned "${result.displayName}" but poor match (score=${result.score.toFixed(2)})`
      );
    } else {
      googleStatus = "not_found";
      notes.push("No Google Places result found");
    }
  }

  // ── C. Categorize ──
  const category = categorize(websiteStatus, googleStatus, nameMatchScore);
  const recommendedAction = deriveAction(category, suggestedPlaceId);

  return {
    store,
    category,
    websiteStatus,
    googleStatus,
    googleDetails,
    suggestedPlaceId,
    suggestedPlaceName,
    nameMatchScore,
    notes,
    recommendedAction,
  };
}

function categorize(
  websiteStatus: AuditResult["websiteStatus"],
  googleStatus: AuditResult["googleStatus"],
  nameMatchScore?: number
): AuditCategory {
  const noWebsite = websiteStatus === "null";
  const brokenWebsite = websiteStatus === "broken";

  if (googleStatus === "mismatch") {
    if (nameMatchScore !== undefined && nameMatchScore >= 0.4) {
      return "REBRANDED";
    }
    return "WRONG_PLACE_ID";
  }

  if (googleStatus === "matches") return "VERIFIED";

  if (noWebsite && googleStatus === "not_found") return "GHOST";
  if (noWebsite && googleStatus === "missing") return "MISSING_PLACE_ID";

  if (brokenWebsite && googleStatus === "not_found") return "GHOST";
  if (brokenWebsite && googleStatus === "missing") return "MISSING_PLACE_ID";

  if (googleStatus === "missing") return "MISSING_PLACE_ID";
  if (googleStatus === "not_found" && !noWebsite && !brokenWebsite) {
    return "NO_GOOGLE_LISTING";
  }

  return "NEEDS_INVESTIGATION";
}

function deriveAction(
  category: AuditCategory,
  suggestedPlaceId?: string
): AuditResult["recommendedAction"] {
  switch (category) {
    case "VERIFIED":
      return "KEEP";
    case "WRONG_PLACE_ID":
      return "UPDATE_PLACE_ID";
    case "MISSING_PLACE_ID":
      return suggestedPlaceId ? "SET_PLACE_ID" : "INVESTIGATE";
    case "GHOST":
      return "DELETE";
    case "REBRANDED":
      return "INVESTIGATE";
    case "NO_GOOGLE_LISTING":
      return "KEEP";
    case "WEBSITE_BROKEN":
      return "INVESTIGATE";
    case "NEEDS_INVESTIGATION":
      return "INVESTIGATE";
  }
}

// ─── Category Labels ──────────────────────────────────────
const CATEGORY_ICONS: Record<AuditCategory, string> = {
  VERIFIED: "✅",
  WRONG_PLACE_ID: "⚠️ ",
  MISSING_PLACE_ID: "🔍",
  NO_GOOGLE_LISTING: "📍",
  GHOST: "❌",
  REBRANDED: "🔄",
  WEBSITE_BROKEN: "🌐",
  NEEDS_INVESTIGATION: "❓",
};

// ─── Report ───────────────────────────────────────────────
function generateReport(results: AuditResult[]) {
  console.log("\n" + "=".repeat(70));
  console.log("STORE AUDIT REPORT");
  console.log("=".repeat(70));

  // Group by category
  const groups = new Map<AuditCategory, AuditResult[]>();
  for (const r of results) {
    const list = groups.get(r.category) || [];
    list.push(r);
    groups.set(r.category, list);
  }

  // Print order
  const order: AuditCategory[] = [
    "GHOST",
    "WRONG_PLACE_ID",
    "REBRANDED",
    "MISSING_PLACE_ID",
    "NO_GOOGLE_LISTING",
    "WEBSITE_BROKEN",
    "NEEDS_INVESTIGATION",
    "VERIFIED",
  ];

  for (const cat of order) {
    const items = groups.get(cat);
    if (!items || items.length === 0) continue;

    console.log(
      `\n${CATEGORY_ICONS[cat]} ${cat} (${items.length} store${items.length !== 1 ? "s" : ""})`
    );
    console.log("-".repeat(50));

    for (const r of items) {
      const s = r.store;
      console.log(
        `  ${s.name} (${s.id}) — ${s.city}, ${s.country_code}`
      );
      if (r.googleDetails) {
        console.log(
          `    Google: "${r.googleDetails.displayName}" at ${r.googleDetails.formattedAddress}`
        );
        if (r.googleDetails.rating) {
          console.log(
            `    Rating: ${r.googleDetails.rating} (${r.googleDetails.userRatingCount ?? 0} reviews)`
          );
        }
      }
      if (r.nameMatchScore !== undefined) {
        console.log(
          `    Name match: ${r.nameMatchScore.toFixed(2)}`
        );
      }
      for (const note of r.notes) {
        console.log(`    → ${note}`);
      }
      console.log(
        `    Action: ${r.recommendedAction}${r.suggestedPlaceId ? ` (${r.suggestedPlaceId})` : ""}`
      );
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  console.log(`  Total stores: ${results.length}`);
  for (const cat of order) {
    const count = groups.get(cat)?.length || 0;
    if (count > 0) {
      console.log(`  ${CATEGORY_ICONS[cat]} ${cat}: ${count}`);
    }
  }

  // Actionable SQL
  const deletes = results.filter((r) => r.recommendedAction === "DELETE");
  const clearIds = results.filter(
    (r) => r.recommendedAction === "UPDATE_PLACE_ID"
  );
  const setIds = results.filter(
    (r) => r.recommendedAction === "SET_PLACE_ID" && r.suggestedPlaceId
  );

  if (deletes.length > 0 || clearIds.length > 0 || setIds.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("ACTIONABLE SQL");
    console.log("=".repeat(70));
  }

  if (deletes.length > 0) {
    const ids = deletes.map((r) => `'${r.store.id}'`).join(", ");
    console.log(`\n-- DELETE ${deletes.length} ghost stores`);
    console.log(`DELETE FROM stores WHERE id IN (${ids});`);
    console.log("\nStores to delete:");
    for (const r of deletes) {
      console.log(`  - ${r.store.name} (${r.store.id}) — ${r.store.city}`);
    }
  }

  if (clearIds.length > 0) {
    console.log(`\n-- CLEAR ${clearIds.length} wrong Place IDs`);
    for (const r of clearIds) {
      console.log(
        `UPDATE stores SET google_place_id = NULL, updated_at = NOW() WHERE id = '${r.store.id}'; -- ${r.store.name}: was "${r.googleDetails?.displayName}"`
      );
    }
  }

  if (setIds.length > 0) {
    console.log(`\n-- SET ${setIds.length} missing Place IDs`);
    for (const r of setIds) {
      console.log(
        `UPDATE stores SET google_place_id = '${r.suggestedPlaceId}', updated_at = NOW() WHERE id = '${r.store.id}'; -- ${r.store.name}: "${r.suggestedPlaceName}" (score=${r.nameMatchScore?.toFixed(2)})`
      );
    }
  }

  // Seed data sync instructions
  if (deletes.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("SEED DATA SYNC — Remove from src/lib/data/stores.ts:");
    console.log("=".repeat(70));
    for (const r of deletes) {
      console.log(`  Remove: ${r.store.id} (${r.store.name} — ${r.store.city})`);
    }
  }
}

// ─── Fix Mode ─────────────────────────────────────────────
async function applyFixes(results: AuditResult[]) {
  const deletes = results.filter((r) => r.recommendedAction === "DELETE");
  const clearIds = results.filter(
    (r) => r.recommendedAction === "UPDATE_PLACE_ID"
  );
  const setIds = results.filter(
    (r) => r.recommendedAction === "SET_PLACE_ID" && r.suggestedPlaceId
  );

  const total = deletes.length + clearIds.length + setIds.length;
  if (total === 0) {
    console.log("\nNo fixes to apply.");
    return;
  }

  console.log("\n" + "=".repeat(70));
  console.log("APPLYING FIXES");
  console.log("=".repeat(70));
  console.log(`  DELETE ${deletes.length} ghost stores`);
  console.log(`  CLEAR  ${clearIds.length} wrong Place IDs`);
  console.log(`  SET    ${setIds.length} missing Place IDs`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await new Promise<string>((resolve) => {
    rl.question("\nProceed? (yes/no): ", resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== "yes") {
    console.log("Aborted.");
    return;
  }

  // Delete ghosts (CASCADE handles dependent rows)
  for (const r of deletes) {
    await sql`DELETE FROM stores WHERE id = ${r.store.id}`;
    console.log(`  ✓ Deleted: ${r.store.name} (${r.store.id})`);
  }

  // Clear wrong Place IDs
  for (const r of clearIds) {
    await sql`
      UPDATE stores SET google_place_id = NULL, updated_at = NOW()
      WHERE id = ${r.store.id}
    `;
    // Also delete stale cache
    await sql`
      DELETE FROM platform_ratings_cache
      WHERE store_id = ${r.store.id} AND platform = 'google'
    `;
    console.log(`  ✓ Cleared Place ID: ${r.store.name} (${r.store.id})`);
  }

  // Set missing Place IDs
  for (const r of setIds) {
    await sql`
      UPDATE stores SET google_place_id = ${r.suggestedPlaceId!}, updated_at = NOW()
      WHERE id = ${r.store.id}
    `;
    console.log(
      `  ✓ Set Place ID: ${r.store.name} (${r.store.id}) → ${r.suggestedPlaceId}`
    );
  }

  console.log(`\n✅ Applied ${total} fixes.`);
  if (deletes.length > 0) {
    console.log(
      `\n⚠️  Remember to remove deleted stores from src/lib/data/stores.ts`
    );
  }
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log("🔍 Store Mapping Audit\n");
  console.log("API keys configured:");
  console.log(`  Google Places: ${GOOGLE_KEY ? "✅" : "❌ (skipping Place ID checks)"}`);
  console.log(`  Mode: ${FIX_MODE ? "FIX (will prompt to apply)" : "REPORT ONLY"}`);

  const whereClause = SINGLE_STORE ? sql`WHERE id = ${SINGLE_STORE}` : sql``;
  const stores = await sql<StoreRow[]>`
    SELECT id, slug, name, address, city, region, country, country_code,
           latitude, longitude, website, has_online_shop, online_shop_url,
           phone, google_place_id, facebook_page_id, foursquare_venue_id,
           is_verified
    FROM stores
    ${whereClause}
    ORDER BY name
  `;

  console.log(`\nAuditing ${stores.length} stores...\n`);

  const results: AuditResult[] = [];

  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    process.stdout.write(
      `[${i + 1}/${stores.length}] ${store.name} (${store.city})...`
    );

    const result = await auditStore(store);
    results.push(result);

    console.log(` ${CATEGORY_ICONS[result.category]} ${result.category}`);

    // Rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  generateReport(results);

  if (FIX_MODE) {
    await applyFixes(results);
  }

  await sql.end();
  console.log("\nDone!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
