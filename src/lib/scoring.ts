import { eq, and, avg, count } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Recalculate the WinterStores Score for a store.
 *
 * Blends the original seed score with user review average:
 * - 0 user reviews → keep existing score
 * - As user reviews grow, their weight increases
 * - Formula: seedScore * seedWeight + avgUserRating * userWeight
 * - seedWeight = max(0.2, 1 - userReviewCount / 50)
 */
export async function recalculateScore(storeId: string): Promise<void> {
  const db = getDb();

  // Get current store data
  const [store] = await db
    .select({
      winterstoresScore: schema.storesTable.winterstoresScore,
      totalReviewCount: schema.storesTable.totalReviewCount,
    })
    .from(schema.storesTable)
    .where(eq(schema.storesTable.id, storeId))
    .limit(1);

  if (!store) return;

  // Get user review stats (only winterstores source)
  const [stats] = await db
    .select({
      avgRating: avg(schema.reviewsTable.rating),
      reviewCount: count(),
    })
    .from(schema.reviewsTable)
    .where(
      and(
        eq(schema.reviewsTable.storeId, storeId),
        eq(schema.reviewsTable.source, "winterstores")
      )
    );

  const userReviewCount = Number(stats?.reviewCount ?? 0);
  const userAvgRating = Number(stats?.avgRating ?? 0);

  if (userReviewCount === 0) return; // No user reviews, keep current score

  // Blend: seed weight decreases as user reviews grow
  const seedScore = store.winterstoresScore;
  const seedWeight = Math.max(0.2, 1 - userReviewCount / 50);
  const userWeight = 1 - seedWeight;

  const newScore = seedScore * seedWeight + userAvgRating * userWeight;
  const totalCount = store.totalReviewCount + userReviewCount;

  await db
    .update(schema.storesTable)
    .set({
      winterstoresScore: Math.round(newScore * 10) / 10, // 1 decimal
      totalReviewCount: totalCount,
      updatedAt: new Date(),
    })
    .where(eq(schema.storesTable.id, storeId));
}
