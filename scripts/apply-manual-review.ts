/**
 * Apply manual review corrections from user feedback (March 2026).
 *
 * 1. Delete 3 stores whose pages no longer exist
 * 2. Fix Precision Ski Chamonix → Chamonix Ski (completely wrong business)
 * 3. Fix Giovanoli Sport address + name (wrong address, actually in Sils)
 * 4. Fix Niseko Sports Hirafu → Niseko Sports Hirafu Zaka (wrong website + name)
 * 5. Fix Rhythm Japan Niseko → Rhythm Hirafu (wrong name + address)
 * 6. Rename Christy Sports – Vail Village → Christy Sports Vail Bridge Street
 * 7. Rename Pic Negre Grandvalira → Pic Negre 8 Soldeu
 * 8. Rename SkiStar Shop Åre → Skistarshop Åre Torg
 *
 * CASCADE foreign keys handle cleanup of platform_ratings_cache, reviews, user_favorites for deleted stores.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

// ── Stores to delete ─────────────────────────────────────────────────────────
const deletions = [
  { id: "us-ut-002", name: "Jan's Mountain Outfitters" },
  { id: "us-nh-001", name: "Joe Jones Ski & Sports" },
  { id: "fi-la-001", name: "Zero Point Levi" },
];

// ── Stores to update ─────────────────────────────────────────────────────────
const updates: { id: string; label: string; fields: Record<string, unknown> }[] = [
  {
    id: "fr-ra-001",
    label: "Precision Ski Chamonix → Chamonix Ski",
    fields: {
      name: "Chamonix Ski",
      slug: "chamonix-ski",
      description: "Ski and snowboard rental shop in Chamonix-Mont-Blanc. Conveniently located near the slopes with a wide range of equipment for all levels.",
      address: "117 Route des Pècles",
      website: null,
      has_online_shop: false,
      online_shop_url: null,
      phone: null,
      google_place_id: null,
      is_verified: false,
      price_level: 2,
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "ch-gr-001",
    label: "Giovanoli Sport → Giovanoli Sport & Moda (fix address to Sils)",
    fields: {
      name: "Giovanoli Sport & Moda",
      slug: "giovanoli-sport-sils",
      description: "Family-run sport and fashion shop in Sils im Engadin with four generations of Swiss alpine expertise. Ski and snowboard equipment, rentals, and expert service.",
      address: "Via da Marias 35",
      city: "Sils im Engadin",
      postal_code: "7514",
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "jp-hk-002",
    label: "Niseko Sports Hirafu → Niseko Sports Hirafu Zaka (fix website + name)",
    fields: {
      name: "Niseko Sports Hirafu Zaka",
      slug: "niseko-sports-hirafu-zaka",
      address: "3-chome-4-18 Nisekohirafu 1 Jo",
      website: null,
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "jp-hk-001",
    label: "Rhythm Japan Niseko → Rhythm Hirafu (fix name + address)",
    fields: {
      name: "Rhythm Hirafu",
      slug: "rhythm-hirafu-niseko",
      address: "3-chome-7-6 Nisekohirafu 1 Jo",
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "us-co-001",
    label: "Christy Sports – Vail Village → Christy Sports Vail Bridge Street",
    fields: {
      name: "Christy Sports Vail Bridge Street",
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "ad-gc-001",
    label: "Pic Negre Grandvalira → Pic Negre 8 Soldeu",
    fields: {
      name: "Pic Negre 8 Soldeu",
      slug: "pic-negre-8-soldeu",
      address: "Ed. Aspen, Carretera general",
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "se-jl-001",
    label: "SkiStar Shop Åre → Skistarshop Åre Torg (fix address)",
    fields: {
      name: "Skistarshop Åre Torg",
      slug: "skistarshop-are-torg",
      address: "Årevägen 78",
      updated_at: new Date().toISOString(),
    },
  },
];

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Apply Manual Review Corrections");
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. Deletions ─────────────────────────────────────────────
  console.log(`🗑️  Deleting ${deletions.length} dead stores...\n`);
  for (const d of deletions) {
    const deleted = await sql`DELETE FROM stores WHERE id = ${d.id} RETURNING id, name, city`;
    if (deleted.length > 0) {
      console.log(`  ✓ Deleted ${d.id} (${deleted[0].name}, ${deleted[0].city})`);
    } else {
      console.log(`  ⚠ ${d.id} (${d.name}) — not found in DB`);
    }
  }

  // ── 2. Updates ───────────────────────────────────────────────
  console.log(`\n📝 Updating ${updates.length} stores...\n`);
  for (const u of updates) {
    // Build dynamic SET clause
    const cols = Object.keys(u.fields);
    const sets = cols.map((col) => `${col} = ${sql(u.fields[col] as string)}`);

    // Use raw query approach for dynamic columns
    const result = await sql`
      UPDATE stores SET ${sql(u.fields, ...cols)}
      WHERE id = ${u.id}
      RETURNING id, name, slug, city
    `;
    if (result.length > 0) {
      console.log(`  ✓ ${u.label}`);
      console.log(`    → ${result[0].name} (${result[0].slug}) — ${result[0].city}`);
    } else {
      console.log(`  ⚠ ${u.id} — not found in DB`);
    }
  }

  // ── 3. Clear stale cache for Chamonix Ski ────────────────────
  console.log(`\n🔄 Clearing stale platform cache for fr-ra-001 (Chamonix Ski)...`);
  const cleared = await sql`DELETE FROM platform_ratings_cache WHERE store_id = 'fr-ra-001' RETURNING platform`;
  console.log(`  ✓ Cleared ${cleared.length} cached rating(s)`);

  // ── Summary ──────────────────────────────────────────────────
  const [{ count }] = await sql`SELECT COUNT(*) as count FROM stores`;
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  ✅ Done — ${count} stores remaining in database`);
  console.log(`═══════════════════════════════════════════════════`);

  await sql.end();
}

main().catch(console.error);
