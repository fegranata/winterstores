import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";

// POST /api/users/me/favorites/sync — Merge localStorage favorites into DB
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

  const { slugs } = await request.json();
  if (!Array.isArray(slugs)) {
    return NextResponse.json({ error: "slugs array required" }, { status: 400 });
  }

  // Sanitize: cap at 200, strings only
  const localSlugs = slugs
    .filter((s): s is string => typeof s === "string")
    .slice(0, 200);

  const db = getDb();

  // Resolve local slugs to store IDs and insert (union merge)
  if (localSlugs.length > 0) {
    const stores = await db
      .select({ id: schema.storesTable.id })
      .from(schema.storesTable)
      .where(inArray(schema.storesTable.slug, localSlugs));

    if (stores.length > 0) {
      await db
        .insert(schema.userFavoritesTable)
        .values(stores.map((s) => ({ userId: user.id, storeId: s.id })))
        .onConflictDoNothing();
    }
  }

  // Return the full merged set
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
