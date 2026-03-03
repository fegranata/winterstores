/**
 * Store Detail Enrichment — visits each store's website to extract:
 * - Whether they have an online shop
 * - What sports they serve
 * - What services they offer
 * - Store description
 *
 * Usage: npx tsx scripts/scrape/enrich-details.ts
 *
 * For full JS rendering, install puppeteer: npm install puppeteer
 * This basic version uses fetch + cheerio for static pages.
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "stores.db");

// Keywords to classify sport types
const SPORT_KEYWORDS: Record<string, string[]> = {
  skiing: ["ski", "alpin", "downhill", "piste", "carving"],
  snowboarding: ["snowboard", "board", "freestyle", "halfpipe"],
  "cross-country": ["cross-country", "langlauf", "nordic", "xc ski", "fond"],
  "ice-skating": ["ice skat", "figure skat", "hockey"],
  sledding: ["sled", "toboggan", "bob", "luge", "schlitten"],
  snowshoeing: ["snowshoe", "schneeschuh", "raquette"],
  "ice-climbing": ["ice climb", "eisklettern"],
  biathlon: ["biathlon"],
};

// Keywords to classify services
const SERVICE_KEYWORDS: Record<string, string[]> = {
  rentals: ["rent", "hire", "locat", "mieten", "noleggio"],
  repairs: ["repair", "service", "tuning", "tune", "reparatur"],
  lessons: ["lesson", "school", "course", "instruction", "kurs"],
  "custom-fitting": ["custom fit", "bespoke", "personali"],
  "boot-fitting": ["boot fit", "boot lab", "bootfitt"],
  waxing: ["wax", "wachs"],
  storage: ["storage", "locker", "garde"],
  "used-gear": ["used", "second hand", "occasion", "gebraucht"],
};

// Keywords indicating an online shop
const SHOP_KEYWORDS = [
  "add to cart",
  "add to basket",
  "buy now",
  "shop online",
  "online store",
  "online shop",
  "webshop",
  "e-shop",
  "/shop",
  "/store",
  "/products",
  "checkout",
  "warenkorb",
  "panier",
];

interface StoreRow {
  id: string;
  name: string;
  website: string | null;
  sport_types: string;
  services: string;
  description: string;
  has_online_shop: number;
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    // Strip HTML tags to get text content
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").toLowerCase();
  } catch {
    return null;
  }
}

function detectSports(text: string): string[] {
  const found: string[] = [];
  for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      found.push(sport);
    }
  }
  // Default to skiing + snowboarding if nothing detected
  return found.length > 0 ? found : ["skiing", "snowboarding"];
}

function detectServices(text: string): string[] {
  const found: string[] = [];
  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      found.push(service);
    }
  }
  return found.length > 0 ? found : ["rentals"];
}

function detectOnlineShop(text: string): boolean {
  return SHOP_KEYWORDS.some((kw) => text.includes(kw));
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const stores = db
    .prepare(
      "SELECT id, name, website, sport_types, services, description, has_online_shop FROM stores WHERE website IS NOT NULL"
    )
    .all() as StoreRow[];

  console.log(`📋 Found ${stores.length} stores with websites to analyze\n`);

  let enrichedCount = 0;

  for (const store of stores) {
    console.log(`🌐 Fetching: ${store.name} — ${store.website}`);

    const pageText = await fetchPageText(store.website!);

    if (!pageText) {
      console.log(`   ⏭️  Could not fetch page`);
      continue;
    }

    const sports = detectSports(pageText);
    const services = detectServices(pageText);
    const hasOnlineShop = detectOnlineShop(pageText) ? 1 : 0;

    console.log(`   Sports: ${sports.join(", ")}`);
    console.log(`   Services: ${services.join(", ")}`);
    console.log(`   Online shop: ${hasOnlineShop ? "Yes" : "No"}`);

    const now = new Date().toISOString().slice(0, 10);

    db.prepare(
      `UPDATE stores
       SET sport_types = ?,
           services = ?,
           has_online_shop = ?,
           updated_at = ?
       WHERE id = ?`
    ).run(JSON.stringify(sports), JSON.stringify(services), hasOnlineShop, now, store.id);

    enrichedCount++;

    // Rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Enriched ${enrichedCount} stores with website data`);
  db.close();
}

main().catch(console.error);
