/**
 * Clear all 16 wrong Google Place IDs found by the audit.
 * These Place IDs pointed to unrelated businesses.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const wrongIds = [
  "kr-gw-001", // Alpensia Sports → was "Alpensia Ski Jumping Centre"
  "ar-rn-001", // Bariloche Ski Shop → was "Scandinavian"
  "us-co-002", // Colorado Ski & Golf → was "Epic Mountain Gear"
  "es-ar-001", // Deportes Formigal → was "Alquiler Esquís Formigal CaranvaSports"
  "au-ns-001", // Rhythm Snowsports Jindabyne → was "TIME II RIDE"
  "cz-kr-001", // SKI a SPORT Centrum Harrachov → was "Sports area Harrachov, Inc."
  "pl-mp-001", // Ski Service Zakopane → was "Ski Rent & Bike Zakopane"
  "cl-rm-001", // Ski Total Santiago → was "Skitotal"
  "fr-ra-002", // Skiset Courchevel 1850 → was "SKISET Le Chamois"
  "no-tr-001", // Sport 1 Trondheim → was "Axel Bruun Sport / Sport1"
  "at-sb-001", // Sport 2000 Kitzbühel → was "Etz – Mode, Sport und Schuhe"
  "it-aa-002", // Sport Brunner Cortina → was "Centro Boarderline"
  "it-aa-001", // Sport Gardena → was "Sport Gardena Noleggio Sci"
  "at-ti-002", // Sport Nörz → was "Sports and more - Stefan Hörtnagl"
  "jp-ng-001", // Sunalp Hakuba → was "snow peak Land Station Hakuba"
  "fr-ra-003", // Ze Shop Val d'Isère → was "Ze Shop I Magasin de musique Réunion"
];

async function main() {
  console.log(`Clearing ${wrongIds.length} wrong Google Place IDs...\n`);

  for (const id of wrongIds) {
    await sql`UPDATE stores SET google_place_id = NULL, updated_at = NOW() WHERE id = ${id}`;
    const del = await sql`DELETE FROM platform_ratings_cache WHERE store_id = ${id} AND platform = 'google'`;
    const [store] = await sql`SELECT name, city FROM stores WHERE id = ${id}`;
    console.log(`  ✓ ${id} (${store.name}, ${store.city}) — cleared Place ID, ${del.count} cache rows deleted`);
  }

  console.log(`\n✅ Done — cleared ${wrongIds.length} wrong Place IDs`);
  await sql.end();
}

main().catch(console.error);
