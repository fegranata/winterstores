/**
 * Aggregate Ratings — recalculates composite ratings for all stores
 * based on a weighted average across all review sources.
 *
 * Usage: npx tsx scripts/scrape/aggregate.ts
 *
 * Weighting: Each source is weighted by its review count, so platforms
 * with more reviews have more influence on the composite score.
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "stores.db");

interface ReviewSource {
  platform: string;
  rating: number;
  reviewCount: number;
  url: string;
  lastScraped: string;
}

interface StoreRow {
  id: string;
  name: string;
  review_sources: string;
}

function computeComposite(sources: ReviewSource[]): {
  compositeRating: number;
  totalReviewCount: number;
} {
  if (sources.length === 0) {
    return { compositeRating: 0, totalReviewCount: 0 };
  }

  const totalReviewCount = sources.reduce(
    (sum, s) => sum + (s.reviewCount || 0),
    0
  );

  if (totalReviewCount === 0) {
    // Simple average if no review counts
    const avg =
      sources.reduce((sum, s) => sum + (s.rating || 0), 0) / sources.length;
    return { compositeRating: Math.round(avg * 10) / 10, totalReviewCount: 0 };
  }

  // Weighted average by review count
  const weightedSum = sources.reduce(
    (sum, s) => sum + (s.rating || 0) * (s.reviewCount || 0),
    0
  );
  const compositeRating = Math.round((weightedSum / totalReviewCount) * 10) / 10;

  return { compositeRating, totalReviewCount };
}

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const stores = db
    .prepare("SELECT id, name, review_sources FROM stores")
    .all() as StoreRow[];

  console.log(`📊 Recalculating ratings for ${stores.length} stores...\n`);

  const updateStmt = db.prepare(
    `UPDATE stores
     SET composite_rating = ?,
         total_review_count = ?,
         updated_at = ?
     WHERE id = ?`
  );

  const now = new Date().toISOString().slice(0, 10);
  let updatedCount = 0;

  const updateAll = db.transaction(() => {
    for (const store of stores) {
      const sources: ReviewSource[] = JSON.parse(store.review_sources);
      const { compositeRating, totalReviewCount } = computeComposite(sources);

      updateStmt.run(compositeRating, totalReviewCount, now, store.id);
      updatedCount++;

      if (sources.length > 0) {
        const sourceLabels = sources
          .map((s) => `${s.platform}:${s.rating}`)
          .join(", ");
        console.log(
          `  ${store.name}: ${compositeRating}/5 (${totalReviewCount} reviews) [${sourceLabels}]`
        );
      }
    }
  });

  updateAll();

  console.log(`\n✅ Updated ${updatedCount} stores`);
  db.close();
}

main();
