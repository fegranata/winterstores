import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const del = await sql`DELETE FROM stores WHERE id = 'us-vt-001'`;
  console.log("Deleted us-vt-001 from DB:", del.count, "rows");

  const remaining = await sql`
    SELECT id, slug, city FROM stores WHERE slug LIKE 'northern-ski%' ORDER BY id
  `;
  console.log("Remaining Northern Ski Works entries:");
  for (const r of remaining) console.log(" ", r.id, r.slug, r.city);

  await sql.end();
}
main();
