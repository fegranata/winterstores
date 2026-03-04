import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/users/me — Return current user's profile
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

  // Get or create profile
  let profiles = await db
    .select()
    .from(schema.profilesTable)
    .where(eq(schema.profilesTable.id, user.id))
    .limit(1);

  if (profiles.length === 0) {
    // Auto-create profile from auth metadata
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    await db.insert(schema.profilesTable).values({
      id: user.id,
      displayName,
      avatarUrl: user.user_metadata?.avatar_url || null,
    });

    profiles = await db
      .select()
      .from(schema.profilesTable)
      .where(eq(schema.profilesTable.id, user.id))
      .limit(1);
  }

  // Count user's reviews
  const reviewCountResult = await db
    .select()
    .from(schema.reviewsTable)
    .where(eq(schema.reviewsTable.userId, user.id));

  const profile = profiles[0];

  return NextResponse.json({
    id: profile.id,
    email: user.email,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    language: profile.language,
    reviewCount: reviewCountResult.length,
    createdAt: profile.createdAt,
  });
}

// PATCH /api/users/me — Update profile settings
export async function PATCH(request: NextRequest) {
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

  const body = await request.json();
  const { displayName, language } = body;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof displayName === "string" && displayName.trim()) {
    updateData.displayName = displayName.trim().slice(0, 100);
  }
  if (typeof language === "string" && language.trim()) {
    updateData.language = language.trim().slice(0, 10);
  }

  const db = getDb();

  // Upsert profile
  await db
    .insert(schema.profilesTable)
    .values({
      id: user.id,
      displayName: (updateData.displayName as string) || "Anonymous",
      avatarUrl: user.user_metadata?.avatar_url || null,
      language: (updateData.language as string) || "en",
    })
    .onConflictDoUpdate({
      target: schema.profilesTable.id,
      set: updateData,
    });

  return NextResponse.json({ success: true });
}

// DELETE /api/users/me — Delete account
export async function DELETE() {
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

  // Anonymize user's reviews (keep content, remove user link)
  await db
    .update(schema.reviewsTable)
    .set({
      userId: null,
      authorName: "Deleted User",
      updatedAt: new Date(),
    })
    .where(eq(schema.reviewsTable.userId, user.id));

  // Delete profile
  await db
    .delete(schema.profilesTable)
    .where(eq(schema.profilesTable.id, user.id));

  // Sign out the user (client will handle redirect)
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
