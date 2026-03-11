/**
 * Delete 8 confirmed ghost stores (fabricated, no web presence).
 * CASCADE foreign keys handle dependent rows in platform_ratings_cache, reviews, user_favorites.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const ghosts = [
  { id: "us-co-004", name: "Alpine Sports Aspen" },
  { id: "bg-bl-001", name: "Bansko Sport Rental" },
  { id: "ar-rn-001", name: "Bariloche Ski Shop" },
  { id: "it-aa-002", name: "Sport Brunner Cortina" },
  { id: "at-ti-002", name: "Sport Nörz" },
  { id: "pl-mp-001", name: "Ski Service Zakopane" },
  { id: "jp-ng-001", name: "Sunalp Hakuba" },
  { id: "es-ar-001", name: "Deportes Formigal" },
];

async function main() {
  console.log(`Deleting ${ghosts.length} ghost stores...\n`);

  for (const g of ghosts) {
    const deleted = await sql`DELETE FROM stores WHERE id = ${g.id} RETURNING id, name, city`;
    if (deleted.length > 0) {
      console.log(`  ✓ Deleted ${g.id} (${deleted[0].name}, ${deleted[0].city})`);
    } else {
      console.log(`  ⚠ ${g.id} (${g.name}) — not found in DB`);
    }
  }

  // Count remaining stores
  const [{ count }] = await sql`SELECT COUNT(*) as count FROM stores`;
  console.log(`\n✅ Done — ${count} stores remaining in database`);
  await sql.end();
}

main().catch(console.error);
