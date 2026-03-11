/**
 * Validate all store URLs (website + online shop) for broken links.
 * Checks for SSL errors, DNS failures, timeouts, HTTP errors, and domain mismatches.
 * Usage: npx tsx scripts/validate-store-data.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

interface StoreRow {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  has_online_shop: boolean;
  online_shop_url: string | null;
}

interface UrlCheck {
  store: string;
  slug: string;
  id: string;
  field: "website" | "online_shop_url";
  url: string;
  status: "ok" | "ssl_error" | "dns_error" | "timeout" | "http_error" | "connection_refused" | "redirect_mismatch" | "other_error";
  httpStatus?: number;
  finalUrl?: string;
  error?: string;
}

async function checkUrl(url: string): Promise<{ status: UrlCheck["status"]; httpStatus?: number; finalUrl?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    const finalUrl = res.url;
    const origHost = new URL(url).hostname.replace(/^www\./, "");
    const finalHost = new URL(finalUrl).hostname.replace(/^www\./, "");

    if (!res.ok) {
      // HEAD might be blocked, try GET
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 8000);
      const res2 = await fetch(url, {
        method: "GET",
        signal: controller2.signal,
        redirect: "follow",
      });
      clearTimeout(timeoutId2);

      if (!res2.ok) {
        return { status: "http_error", httpStatus: res2.status, finalUrl: res2.url };
      }

      const finalHost2 = new URL(res2.url).hostname.replace(/^www\./, "");
      if (origHost !== finalHost2) {
        return { status: "redirect_mismatch", finalUrl: res2.url };
      }
      return { status: "ok", httpStatus: res2.status, finalUrl: res2.url };
    }

    if (origHost !== finalHost) {
      return { status: "redirect_mismatch", finalUrl };
    }

    return { status: "ok", httpStatus: res.status, finalUrl };
  } catch (err: any) {
    const msg = err.message?.toLowerCase() || "";
    if (msg.includes("cert") || msg.includes("ssl") || msg.includes("unable_to_verify") || msg.includes("err_tls")) {
      return { status: "ssl_error", error: err.message };
    }
    if (msg.includes("enotfound") || msg.includes("getaddrinfo")) {
      return { status: "dns_error", error: err.message };
    }
    if (msg.includes("abort") || msg.includes("timeout") || msg.includes("etimedout")) {
      return { status: "timeout", error: err.message };
    }
    if (msg.includes("econnrefused")) {
      return { status: "connection_refused", error: err.message };
    }
    return { status: "other_error", error: err.message };
  }
}

async function main() {
  const stores = await sql<StoreRow[]>`
    SELECT id, slug, name, website, has_online_shop, online_shop_url
    FROM stores
    ORDER BY name
  `;

  console.log(`Validating URLs for ${stores.length} stores...\n`);

  const results: UrlCheck[] = [];
  const broken: UrlCheck[] = [];
  const warnings: UrlCheck[] = [];
  const working: UrlCheck[] = [];

  for (const store of stores) {
    const urlsToCheck: { field: "website" | "online_shop_url"; url: string }[] = [];

    if (store.website) {
      urlsToCheck.push({ field: "website", url: store.website });
    }
    if (store.has_online_shop && store.online_shop_url) {
      urlsToCheck.push({ field: "online_shop_url", url: store.online_shop_url });
    }

    for (const { field, url } of urlsToCheck) {
      process.stdout.write(`  Checking ${store.name} [${field}]...`);
      const result = await checkUrl(url);

      const check: UrlCheck = {
        store: store.name,
        slug: store.slug,
        id: store.id,
        field,
        url,
        ...result,
      };

      results.push(check);

      if (result.status === "ok") {
        console.log(` ✓`);
        working.push(check);
      } else if (result.status === "redirect_mismatch") {
        console.log(` ⚠ redirect → ${result.finalUrl}`);
        warnings.push(check);
      } else {
        console.log(` ✗ ${result.status}${result.error ? ` (${result.error.slice(0, 80)})` : ""}`);
        broken.push(check);
      }

      // Small delay between requests
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Report
  console.log("\n" + "=".repeat(70));
  console.log("VALIDATION REPORT");
  console.log("=".repeat(70));

  if (broken.length > 0) {
    console.log(`\n❌ BROKEN URLs (${broken.length}):\n`);
    for (const b of broken) {
      console.log(`  ${b.store} (${b.id})`);
      console.log(`    Field: ${b.field}`);
      console.log(`    URL: ${b.url}`);
      console.log(`    Error: ${b.status}${b.httpStatus ? ` (HTTP ${b.httpStatus})` : ""}${b.error ? ` — ${b.error.slice(0, 100)}` : ""}`);
      console.log(`    -- UPDATE stores SET ${b.field === "website" ? "website" : "online_shop_url"} = 'NEW_URL', updated_at = NOW() WHERE id = '${b.id}';`);
      console.log("");
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  REDIRECT WARNINGS (${warnings.length}):\n`);
    for (const w of warnings) {
      console.log(`  ${w.store} (${w.id})`);
      console.log(`    Field: ${w.field}`);
      console.log(`    Original: ${w.url}`);
      console.log(`    Redirects to: ${w.finalUrl}`);
      console.log("");
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`  Total stores: ${stores.length}`);
  console.log(`  URLs checked: ${results.length}`);
  console.log(`  Working: ${working.length}`);
  console.log(`  Broken: ${broken.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Stores with no website: ${stores.filter((s) => !s.website).length}`);
  console.log(`  Stores with no online shop: ${stores.filter((s) => !s.has_online_shop).length}`);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
