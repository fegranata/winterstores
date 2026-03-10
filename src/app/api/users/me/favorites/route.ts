import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// GET /api/users/me/favorites — Return current user's favorite store slugs
export async function GET() {
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

  const db = getDb();
  const rows = await db
    .select({ slug: schema.storesTable.slug })
    .from(schema.userFavoritesTable)
    .innerJoin(
      schema.storesTable,
      eq(schema.userFavoritesTable.storeId, schema.storesTable.id)
    )
    .where(eq(schema.userFavoritesTable.userId, user.id));

  return NextResponse.json({ favorites: rows.map((r) => r.slug) });
}

// POST /api/users/me/favorites — Add a favorite
export async function POST(request: NextRequest) {
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

  const { slug } = await request.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const db = getDb();

  const store = await db
    .select({ id: schema.storesTable.id })
    .from(schema.storesTable)
    .where(eq(schema.storesTable.slug, slug))
    .limit(1);

  if (store.length === 0) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  await db
    .insert(schema.userFavoritesTable)
    .values({ userId: user.id, storeId: store[0].id })
    .onConflictDoNothing();

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/users/me/favorites — Remove a favorite
export async function DELETE(request: NextRequest) {
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

  const { slug } = await request.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const db = getDb();

  const store = await db
    .select({ id: schema.storesTable.id })
    .from(schema.storesTable)
    .where(eq(schema.storesTable.slug, slug))
    .limit(1);

  if (store.length === 0) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  await db
    .delete(schema.userFavoritesTable)
    .where(
      and(
        eq(schema.userFavoritesTable.userId, user.id),
        eq(schema.userFavoritesTable.storeId, store[0].id)
      )
    );

  return NextResponse.json({ success: true });
}
