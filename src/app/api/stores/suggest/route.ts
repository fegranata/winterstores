import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { sql, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const db = getDb();
  const pattern = `%${q}%`;
  const { storesTable } = schema;

  const results = await db
    .select({
      slug: storesTable.slug,
      name: storesTable.name,
      city: storesTable.city,
      country: storesTable.country,
      countryCode: storesTable.countryCode,
      winterstoresScore: storesTable.winterstoresScore,
    })
    .from(storesTable)
    .where(
      or(
        sql`${storesTable.name} ILIKE ${pattern}`,
        sql`${storesTable.city} ILIKE ${pattern}`,
        sql`${storesTable.region} ILIKE ${pattern}`,
        sql`${storesTable.country} ILIKE ${pattern}`
      )!
    )
    .limit(8);

  return NextResponse.json(
    { suggestions: results },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeName, city, country, website, sportTypes, notes, submitterEmail } = body;

    if (!storeName?.trim() || !city?.trim() || !country?.trim()) {
      return NextResponse.json(
        { error: "Store name, city, and country are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const { storeSuggestionsTable } = schema;

    await db.insert(storeSuggestionsTable).values({
      id: randomUUID(),
      storeName: storeName.trim(),
      city: city.trim(),
      country: country.trim(),
      website: website?.trim() || null,
      sportTypes: Array.isArray(sportTypes) ? sportTypes : [],
      notes: notes?.trim() || "",
      submitterEmail: submitterEmail?.trim() || null,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to save store suggestion:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
