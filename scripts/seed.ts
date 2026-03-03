/**
 * Seed script — populates the SQLite database with our store data.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// We import the raw data directly
import { stores } from "../src/lib/data/stores";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "stores.db");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Remove old database if it exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("🗑️  Removed old database");
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("📦 Creating tables...");

db.exec(`
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    postal_code TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    sport_types TEXT NOT NULL DEFAULT '[]',
    services TEXT NOT NULL DEFAULT '[]',
    price_level INTEGER NOT NULL DEFAULT 2,
    website TEXT,
    has_online_shop INTEGER NOT NULL DEFAULT 0,
    online_shop_url TEXT,
    phone TEXT,
    email TEXT,
    composite_rating REAL NOT NULL DEFAULT 0,
    total_review_count INTEGER NOT NULL DEFAULT 0,
    review_sources TEXT NOT NULL DEFAULT '[]',
    photos TEXT NOT NULL DEFAULT '[]',
    cover_photo TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    source TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT 'Anonymous',
    rating REAL NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en'
  );

  -- Indexes for common queries
  CREATE INDEX IF NOT EXISTS idx_stores_country_code ON stores(country_code);
  CREATE INDEX IF NOT EXISTS idx_stores_composite_rating ON stores(composite_rating);
  CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
  CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
  CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON reviews(store_id);
`);

console.log("🌱 Seeding stores...");

const insertStore = db.prepare(`
  INSERT INTO stores (
    id, slug, name, description,
    address, city, region, country, country_code, postal_code,
    latitude, longitude,
    sport_types, services, price_level,
    website, has_online_shop, online_shop_url, phone, email,
    composite_rating, total_review_count, review_sources,
    photos, cover_photo,
    is_verified, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?,
    ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?,
    ?, ?, ?
  )
`);

const insertMany = db.transaction(() => {
  for (const store of stores) {
    insertStore.run(
      store.id,
      store.slug,
      store.name,
      store.description,
      store.address,
      store.city,
      store.region,
      store.country,
      store.countryCode,
      store.postalCode,
      store.latitude,
      store.longitude,
      JSON.stringify(store.sportTypes),
      JSON.stringify(store.services),
      store.priceLevel,
      store.website,
      store.hasOnlineShop ? 1 : 0,
      store.onlineShopUrl,
      store.phone,
      store.email,
      store.compositeRating,
      store.totalReviewCount,
      JSON.stringify(store.reviewSources),
      JSON.stringify(store.photos),
      store.coverPhoto,
      store.isVerified ? 1 : 0,
      store.createdAt,
      store.updatedAt
    );
  }
});

insertMany();

const count = db.prepare("SELECT COUNT(*) as count FROM stores").get() as { count: number };
console.log(`✅ Seeded ${count.count} stores into ${DB_PATH}`);

db.close();
console.log("🎉 Done!");
