import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { recalculateScore } from "@/lib/scoring";

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId required" }, { status: 400 });
  }

  const db = getDb();
  const reviews = await db
    .select({
      id: schema.reviewsTable.id,
      authorName: schema.reviewsTable.authorName,
      rating: schema.reviewsTable.rating,
      title: schema.reviewsTable.title,
      text: schema.reviewsTable.text,
      date: schema.reviewsTable.date,
      source: schema.reviewsTable.source,
    })
    .from(schema.reviewsTable)
    .where(eq(schema.reviewsTable.storeId, storeId))
    .orderBy(desc(schema.reviewsTable.createdAt))
    .limit(50);

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { storeId, rating, title, text } = body;

  if (!storeId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "storeId and rating (1-5) are required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Anonymous";

  await db.insert(schema.reviewsTable).values({
    id,
    storeId,
    userId: user.id,
    source: "winterstores",
    authorName: displayName,
    rating,
    title: title || null,
    text: text || "",
    date: new Date().toISOString().split("T")[0],
  });

  // Upsert profile
  await db
    .insert(schema.profilesTable)
    .values({
      id: user.id,
      displayName,
      avatarUrl: user.user_metadata?.avatar_url || null,
    })
    .onConflictDoUpdate({
      target: schema.profilesTable.id,
      set: {
        displayName,
        avatarUrl: user.user_metadata?.avatar_url || null,
        updatedAt: new Date(),
      },
    });

  // Recalculate WinterStores Score
  await recalculateScore(storeId);

  return NextResponse.json({ success: true, id }, { status: 201 });
}
