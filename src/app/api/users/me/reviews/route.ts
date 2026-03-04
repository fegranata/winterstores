import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

// GET /api/users/me/reviews — Return current user's reviews with store info
export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Auth not configured" },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  // Get user's reviews joined with store info
  const reviews = await db
    .select({
      id: schema.reviewsTable.id,
      rating: schema.reviewsTable.rating,
      title: schema.reviewsTable.title,
      text: schema.reviewsTable.text,
      date: schema.reviewsTable.date,
      createdAt: schema.reviewsTable.createdAt,
      storeName: schema.storesTable.name,
      storeSlug: schema.storesTable.slug,
      storeCity: schema.storesTable.city,
      storeCountry: schema.storesTable.country,
    })
    .from(schema.reviewsTable)
    .innerJoin(
      schema.storesTable,
      eq(schema.reviewsTable.storeId, schema.storesTable.id)
    )
    .where(eq(schema.reviewsTable.userId, user.id))
    .orderBy(desc(schema.reviewsTable.createdAt));

  return NextResponse.json({ reviews });
}
