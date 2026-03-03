/**
 * Seed script for Supabase Postgres — migrates store data from the static file.
 *
 * Usage:
 *   1. Create a Supabase project and grab the DATABASE_URL
 *   2. Copy .env.example to .env.local and fill in DATABASE_URL
 *   3. Run: npx drizzle-kit push         (creates tables)
 *   4. Run: npx tsx scripts/seed-postgres.ts   (inserts data)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { stores as rawStores } from "../src/lib/data/stores";
import * as schema from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not set. Copy .env.example → .env.local and fill it in.");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🗑️  Clearing existing store data...");
  await db.delete(schema.reviewsTable);
  await db.delete(schema.platformRatingsCacheTable);
  await db.delete(schema.storesTable);

  console.log(`🌱 Seeding ${rawStores.length} stores...`);

  // Map the old static data format to the new Postgres schema
  const storeRows = rawStores.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    address: s.address,
    city: s.city,
    region: s.region,
    country: s.country,
    countryCode: s.countryCode,
    postalCode: s.postalCode,
    latitude: s.latitude,
    longitude: s.longitude,
    sportTypes: s.sportTypes,
    services: s.services,
    priceLevel: s.priceLevel,
    website: s.website,
    hasOnlineShop: s.hasOnlineShop,
    onlineShopUrl: s.onlineShopUrl,
    phone: s.phone,
    email: s.email,
    // Use the old compositeRating as the initial WinterStores Score
    winterstoresScore: (s as Record<string, unknown>).compositeRating as number ?? 0,
    totalReviewCount: s.totalReviewCount,
    googlePlaceId: null,
    yelpBusinessId: null,
    photos: s.photos,
    coverPhoto: s.coverPhoto,
    isVerified: s.isVerified,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  }));

  // Insert in batches of 25 to avoid hitting param limits
  const batchSize = 25;
  for (let i = 0; i < storeRows.length; i += batchSize) {
    const batch = storeRows.slice(i, i + batchSize);
    await db.insert(schema.storesTable).values(batch);
    console.log(`  ✓ Inserted stores ${i + 1}–${Math.min(i + batchSize, storeRows.length)}`);
  }

  // Verify
  const [{ count }] = await db
    .select({ count: schema.storesTable.id })
    .from(schema.storesTable);
  // count is actually just the id of last row, let's do a proper count
  const rows = await db.select().from(schema.storesTable);
  console.log(`✅ Seeded ${rows.length} stores into Supabase Postgres`);

  await client.end();
  console.log("🎉 Done!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
