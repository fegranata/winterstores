import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const renames = [
    { id: "us-vt-002", name: "Northern Ski Works Killington" },
    { id: "us-vt-003", name: "Northern Ski Works Okemo" },
  ];

  for (const { id, name } of renames) {
    const result = await sql`
      UPDATE stores SET name = ${name}, updated_at = NOW() WHERE id = ${id}
    `;
    console.log(`${id} → "${name}" (${result.count} row updated)`);
  }

  // Verify
  const rows = await sql`
    SELECT id, slug, name FROM stores WHERE id IN ('us-vt-002', 'us-vt-003') ORDER BY id
  `;
  console.log("\nVerification:");
  for (const r of rows) console.log(`  ${r.id} | ${r.slug} | ${r.name}`);

  await sql.end();
}
main();
