import {
  pgTable,
  text,
  doublePrecision,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const storesTable = pgTable("stores", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),

  // Location
  address: text("address").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  postalCode: text("postal_code").notNull().default(""),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),

  // Classification (native JSONB)
  sportTypes: jsonb("sport_types").notNull().default([]),
  services: jsonb("services").notNull().default([]),
  priceLevel: integer("price_level").notNull().default(2),

  // Online presence
  website: text("website"),
  hasOnlineShop: boolean("has_online_shop").notNull().default(false),
  onlineShopUrl: text("online_shop_url"),
  phone: text("phone"),
  email: text("email"),

  // Ratings
  winterstoresScore: doublePrecision("winterstores_score").notNull().default(0),
  totalReviewCount: integer("total_review_count").notNull().default(0),

  // Platform linking
  googlePlaceId: text("google_place_id"),
  yelpBusinessId: text("yelp_business_id"),

  // Media (native JSONB)
  photos: jsonb("photos").notNull().default([]),
  coverPhoto: text("cover_photo"),

  // Meta
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_stores_slug").on(table.slug),
  index("idx_stores_country_code").on(table.countryCode),
  index("idx_stores_winterstores_score").on(table.winterstoresScore),
  index("idx_stores_has_online_shop").on(table.hasOnlineShop),
  index("idx_stores_price_level").on(table.priceLevel),
  index("idx_stores_city").on(table.city),
  index("idx_stores_google_place_id").on(table.googlePlaceId),
  index("idx_stores_yelp_business_id").on(table.yelpBusinessId),
]);

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(), // matches Supabase auth.users.id
  displayName: text("display_name").notNull().default("Anonymous"),
  avatarUrl: text("avatar_url"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformRatingsCacheTable = pgTable("platform_ratings_cache", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // "google" | "yelp"
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count"),
  platformUrl: text("platform_url"),
  rawResponse: jsonb("raw_response"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("idx_prc_store_platform").on(table.storeId, table.platform),
  index("idx_prc_expires_at").on(table.expiresAt),
]);

export const reviewsTable = pgTable("reviews", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  source: text("source").notNull().default("winterstores"), // "google", "yelp", "winterstores"
  authorName: text("author_name").notNull().default("Anonymous"),
  rating: doublePrecision("rating").notNull(),
  title: text("title"),
  text: text("text").notNull().default(""),
  date: text("date").notNull(),
  language: text("language").notNull().default("en"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_reviews_store_id").on(table.storeId),
  index("idx_reviews_user_id").on(table.userId),
]);
