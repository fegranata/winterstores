/**
 * Fix broken store URLs in the database.
 * Researched via web search on 2026-03-11.
 *
 * Run: npx tsx scripts/fix-store-urls.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

interface UrlFix {
  id: string;
  name: string;
  website: string | null;
  hasOnlineShop: boolean;
  onlineShopUrl: string | null;
  reason: string;
}

const fixes: UrlFix[] = [
  // ── Category A: Completely broken websites (fetch failed) ───────────

  // Alpine Sports Aspen — no such business found at that URL; likely fabricated seed data.
  // No real "Alpine Sports" in Aspen exists. Remove website.
  {
    id: "us-co-004",
    name: "Alpine Sports Aspen",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Bansko Sport Rental — fabricated URL. No specific shop by that exact name.
  // There are many ski rental shops in Bansko but none at banskosportrental.com.
  {
    id: "bg-bl-001",
    name: "Bansko Sport Rental",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Bariloche Ski Shop — fabricated URL. No web presence found.
  {
    id: "ar-rn-001",
    name: "Bariloche Ski Shop",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Bernet Sport — actually in Grindelwald, not Andermatt. Real URL is bernet-sport.ch
  {
    id: "ch-be-001",
    name: "Bernet Sport",
    website: "https://www.bernet-sport.ch",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Corrected domain: bernetsport.ch → bernet-sport.ch (real site in Grindelwald)",
  },

  // Breeze Ski Rentals — now part of Vail Resorts / Epic Mountain Rentals
  {
    id: "us-co-003",
    name: "Breeze Ski Rentals",
    website: "https://www.vailresortsretail.com/pages/breeze-breckenridge",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Original domain gone; now a Vail Resorts Retail page. No standalone online shop.",
  },

  // Cairngorm Mountain Sports — part of Braemar Mountain Sports chain
  {
    id: "gb-sc-001",
    name: "Cairngorm Mountain Sports",
    website: "https://www.braemarmountainsports.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Corrected domain: cairngormsports.co.uk → braemarmountainsports.com (parent chain)",
  },

  // CAN-SKI Whistler — no standalone website; listed under Whistler Blackcomb
  {
    id: "ca-bc-001",
    name: "CAN-SKI Whistler",
    website: "https://www.whistlerblackcomb.com/explore-the-resort/the-village/shopping/can-ski.aspx",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No standalone site; official page is on Whistler Blackcomb website",
  },

  // Colorado Ski & Golf — rebranded to Epic Mountain Gear by Vail Resorts in 2018
  {
    id: "us-co-002",
    name: "Colorado Ski & Golf",
    website: "https://www.epicmountaingear.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Rebranded to Epic Mountain Gear by Vail Resorts in 2018",
  },

  // Deportes Formigal — fabricated URL. No such shop found.
  {
    id: "es-ar-001",
    name: "Deportes Formigal",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Giovanoli Sport — real domain is giovanoli-sils.ch (not giovanolisport.ch)
  {
    id: "ch-gr-001",
    name: "Giovanoli Sport",
    website: "https://www.giovanoli-sils.ch",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Corrected domain: giovanolisport.ch → giovanoli-sils.ch",
  },

  // Intersport Arlberg — real domain uses hyphens: intersport-arlberg.com
  {
    id: "at-ti-001",
    name: "Intersport Arlberg",
    website: "https://www.intersport-arlberg.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Corrected domain: intersportarlberg.com → intersport-arlberg.com. No online shop (rental booking only).",
  },

  // Ski Service Zakopane — fabricated URL. No such specific shop found.
  {
    id: "pl-mp-001",
    name: "Ski Service Zakopane",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Small Planet Sports — real domain is smallplanetsports.com (not .co.nz)
  {
    id: "nz-ot-001",
    name: "Small Planet Sports Queenstown",
    website: "https://smallplanetsports.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Corrected domain: smallplanetsports.co.nz → smallplanetsports.com",
  },

  // Sport Brunner Cortina — no web presence found at all
  {
    id: "it-aa-002",
    name: "Sport Brunner Cortina",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Sport Nörz — no web presence found
  {
    id: "at-ti-002",
    name: "Sport Nörz",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Steamboat Ski & Bike Kare — real domain is steamboatskiandbike.com (not skibikekare.com)
  {
    id: "us-co-005",
    name: "Steamboat Ski & Bike Kare",
    website: "https://www.steamboatskiandbike.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Corrected domain: skibikekare.com → steamboatskiandbike.com. No online shop.",
  },

  // Sunalp Hakuba — no web presence found for this specific business
  {
    id: "jp-ng-001",
    name: "Sunalp Hakuba",
    website: null,
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No real website found; seed URL was fabricated",
  },

  // Zero Point Levi — not an independent shop; it's part of Levi Ski Resort
  {
    id: "fi-la-001",
    name: "Zero Point Levi",
    website: "https://www.levi.fi/en/services/zero-point-rental/",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Not a standalone site; official page is on levi.fi resort website",
  },

  // ── Category B: Working website but broken online shop URL (404) ───────

  // Alpensia Sports — resort website, no separate online ski shop
  {
    id: "kr-gw-001",
    name: "Alpensia Sports",
    website: "https://www.alpensia.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "Resort site has no online shop; /shop path is 404",
  },

  // Christy Sports — main site IS the shop (no separate /shop path)
  {
    id: "us-co-001",
    name: "Christy Sports",
    website: "https://www.christysports.com",
    hasOnlineShop: true,
    onlineShopUrl: "https://www.christysports.com",
    reason: "Online shop is the main website itself, not /shop",
  },

  // Oslo Sportslager — nettbutikk is the main site itself
  {
    id: "no-vi-001",
    name: "Oslo Sportslager",
    website: "https://www.oslosportslager.no",
    hasOnlineShop: true,
    onlineShopUrl: "https://www.oslosportslager.no",
    reason: "Online shop (nettbutikk) is the main website itself, not /nettbutikk",
  },

  // Pic Negre — booking page is at /en/node/401, not /en/book
  {
    id: "ad-gc-001",
    name: "Pic Negre Grandvalira",
    website: "https://www.picnegre.com",
    hasOnlineShop: true,
    onlineShopUrl: "https://www.picnegre.com/en/node/401",
    reason: "Booking page is at /en/node/401, not /en/book",
  },

  // Precision Ski — online shop is at precisionski.fr (the main site), not /shop
  {
    id: "fr-ra-001",
    name: "Precision Ski Chamonix",
    website: "https://www.precisionski.fr",
    hasOnlineShop: true,
    onlineShopUrl: "https://www.precisionski.fr/en/",
    reason: "Online shop is the main website; /shop is 404",
  },

  // Rhythm Japan — retail page is at /retail, not /shop
  {
    id: "jp-hk-001",
    name: "Rhythm Japan Niseko",
    website: "https://www.rhythmjapan.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No e-commerce online shop; /shop is 404. In-store retail only.",
  },

  // Ski Total Santiago — /reservas is 404; main site is the booking portal
  {
    id: "cl-rm-001",
    name: "Ski Total Santiago",
    website: "https://www.skitotal.cl",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "/reservas is 404; primarily a transport/rental service, not retail",
  },

  // Tahoe Dave's — no online shop; website is tahoedaves.com (rental reservations only)
  {
    id: "us-ca-001",
    name: "Tahoe Dave's Skis & Boards",
    website: "https://www.tahoedaves.com",
    hasOnlineShop: false,
    onlineShopUrl: null,
    reason: "No e-commerce shop; /shop is 404. Rental reservations only.",
  },

  // ── Category C: Redirect warnings ──────────────────────────────────

  // Monod Sports — monods.com redirects to monodsports.com
  {
    id: "ca-ab-001",
    name: "Monod Sports",
    website: "https://www.monodsports.com",
    hasOnlineShop: true,
    onlineShopUrl: "https://www.monodsports.com",
    reason: "Updated from monods.com → monodsports.com (redirect). Shop is the main site.",
  },

  // SkiStar Shop — skistar.com/shop redirects to skistarshop.com/se
  {
    id: "se-jl-001",
    name: "SkiStar Shop Åre",
    website: "https://www.skistar.com",
    hasOnlineShop: true,
    onlineShopUrl: "https://www.skistarshop.com/se",
    reason: "Updated shop URL from skistar.com/shop → skistarshop.com/se (redirect target)",
  },
];

async function main() {
  console.log(`\n🔧 Fixing ${fixes.length} store URLs...\n`);

  let success = 0;
  let failed = 0;

  for (const fix of fixes) {
    try {
      await sql`
        UPDATE stores SET
          website = ${fix.website},
          has_online_shop = ${fix.hasOnlineShop},
          online_shop_url = ${fix.onlineShopUrl},
          updated_at = NOW()
        WHERE id = ${fix.id}
      `;
      console.log(`  ✅ ${fix.name} (${fix.id}) — ${fix.reason}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${fix.name} (${fix.id}) — ${err}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${success} updated, ${failed} failed\n`);
  await sql.end();
}

main();
