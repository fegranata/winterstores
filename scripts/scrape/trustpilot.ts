/**
 * Trustpilot Enrichment Scraper — searches Trustpilot for stores in our
 * database and adds their ratings/review counts.
 *
 * Usage: npx tsx scripts/scrape/trustpilot.ts
 *
 * Note: Uses Trustpilot's public search. No API key required for basic data.
 * For production, consider Trustpilot's Business API.
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "stores.db");
const TRUSTPILOT_SEARCH = "https://www.trustpilot.com/search?query=";

interface StoreRow {
  id: string;
  name: string;
  city: string;
  country: string;
  website: string | null;
  review_sources: string;
}

async function searchTrustpilot(
  storeName: string,
  storeWebsite: string | null
): Promise<{ rating: number; reviewCount: number; url: string } | null> {
  try {
    // Search by store name
    const query = encodeURIComponent(storeName);
    const res = await fetch(`${TRUSTPILOT_SEARCH}${query}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.warn(`⚠️  HTTP ${res.status} for ${storeName}`);
      return null;
    }

    const html = await res.text();

    // Extract rating from search results page
    // Look for TrustScore pattern in the response
    const ratingMatch = html.match(/TrustScore\s*(\d+\.?\d*)/);
    const reviewMatch = html.match(/(\d[\d,]*)\s*reviews?/i);

    // Try to find the business URL
    const urlMatch = html.match(
      /href="(\/review\/[^"]+)"/
    );

    if (ratingMatch && reviewMatch) {
      const rating = parseFloat(ratingMatch[1]);
      const reviewCount = parseInt(reviewMatch[1].replace(/,/g, ""), 10);
      const tpUrl = urlMatch
        ? `https://www.trustpilot.com${urlMatch[1]}`
        : `https://www.trustpilot.com/search?query=${query}`;

      // Sanity check — Trustpilot uses 1-5 scale
      if (rating >= 1 && rating <= 5 && reviewCount > 0) {
        return { rating, reviewCount, url: tpUrl };
      }
    }

    return null;
  } catch (err) {
    console.warn(`⚠️  Error fetching Trustpilot for ${storeName}:`, err);
    return null;
  }
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const stores = db
    .prepare("SELECT id, name, city, country, website, review_sources FROM stores")
    .all() as StoreRow[];

  console.log(`📋 Found ${stores.length} stores to check on Trustpilot\n`);

  let enrichedCount = 0;

  for (const store of stores) {
    const existingSources = JSON.parse(store.review_sources) as Array<{
      platform: string;
    }>;

    // Skip if already has Trustpilot data
    if (existingSources.some((s) => s.platform === "trustpilot")) {
      continue;
    }

    console.log(`🔍 Searching Trustpilot for: ${store.name} (${store.city})`);

    const tpData = await searchTrustpilot(store.name, store.website);

    if (tpData) {
      console.log(
        `   ✅ Found: ${tpData.rating}/5 (${tpData.reviewCount} reviews)`
      );

      const now = new Date().toISOString().slice(0, 10);
      existingSources.push({
        platform: "trustpilot",
        rating: tpData.rating,
        reviewCount: tpData.reviewCount,
        url: tpData.url,
        lastScraped: now,
      } as typeof existingSources[number]);

      // Recalculate composite rating
      const totalReviews = existingSources.reduce(
        (sum: number, s: Record<string, unknown>) =>
          sum + ((s.reviewCount as number) ?? 0),
        0
      );
      const weightedSum = existingSources.reduce(
        (sum: number, s: Record<string, unknown>) =>
          sum +
          ((s.rating as number) ?? 0) * ((s.reviewCount as number) ?? 0),
        0
      );
      const compositeRating =
        totalReviews > 0 ? weightedSum / totalReviews : 0;

      db.prepare(
        `UPDATE stores
         SET review_sources = ?,
             composite_rating = ?,
             total_review_count = ?,
             updated_at = ?
         WHERE id = ?`
      ).run(
        JSON.stringify(existingSources),
        Math.round(compositeRating * 10) / 10,
        totalReviews,
        now,
        store.id
      );

      enrichedCount++;
    } else {
      console.log(`   ⏭️  Not found on Trustpilot`);
    }

    // Rate limiting — 1 request per second
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n✅ Enriched ${enrichedCount} stores with Trustpilot data`);
  db.close();
}

main().catch(console.error);
