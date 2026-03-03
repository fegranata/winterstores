import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { inArray } from "drizzle-orm";
import { rowToStore } from "@/lib/store-search";

export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get("slugs");

  if (!slugsParam) {
    return NextResponse.json({ stores: [] });
  }

  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50); // cap at 50

  if (slugs.length === 0) {
    return NextResponse.json({ stores: [] });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.storesTable)
    .where(inArray(schema.storesTable.slug, slugs));

  const stores = rows.map(rowToStore);

  return NextResponse.json(
    { stores },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
