import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { sql, or } from "drizzle-orm";

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
