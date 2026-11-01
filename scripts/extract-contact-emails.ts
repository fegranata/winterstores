/**
 * Build the shop-outreach list: find a contact email for every store that has
 * a website, by reading the homepage and (when linked from it) the contact or
 * Impressum page. Output is a CSV under outreach/ — which is git-ignored,
 * because a list of a thousand business emails does not belong in the repo.
 *
 * Why: Search Console still reports zero external links (2026-11-01). The
 * standard directory lever is asking the listed shops to link to their own
 * page with a badge (see /for-shops). That needs addresses, and Google Places
 * does not provide them.
 *
 * Cost: one or two polite HTTP fetches per store, no APIs. Manual, never per
 * render. Usage:
 *   npx tsx scripts/extract-contact-emails.ts            # all stores with a site
 *   npx tsx scripts/extract-contact-emails.ts --limit 50
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { mkdirSync, writeFileSync } from "node:fs";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 2 });
const limitIdx = process.argv.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? Number(process.argv[limitIdx + 1]) : null;
const CONCURRENCY = 8;
const TIMEOUT_MS = 12_000;
const MAX_BYTES = 600_000;
const UA = "WinterStoresBot/1.0 (+https://winterstores.co; listing contact lookup)";

const CONTACT_LINK = /href=["']([^"']*(?:contact|kontakt|contatti|contacto|impressum|imprint|about|ueber-uns|%C3%BCber-uns|chi-siamo|qui-sommes)[^"']*)["']/i;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const JUNK = /(sentry|wixpress|example\.|\.png|\.jpg|\.svg|\.gif|\.webp|noreply|no-reply|donotreply|godaddy|cloudflare|schema\.org|w3\.org|@2x|jquery|bootstrap|react|domain\.com|email\.com|yourdomain|test\.|@sentry)/i;
const PREFERRED = /^(info|contact|kontakt|contatti|contacto|office|hello|hallo|shop|rent|rental|verleih|location|booking|mail|service)@/i;

async function fetchText(url: string): Promise<string | null> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: c.signal, redirect: "follow" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.includes("html") && !type.includes("text")) return null;
    const buf = await res.arrayBuffer();
    return new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, MAX_BYTES));
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function emailsIn(html: string): string[] {
  // Decode the common obfuscations before matching.
  const text = html
    .replace(/&#64;|&#x40;|\[at\]|\(at\)|\s@\s/gi, "@")
    .replace(/&#46;|\[dot\]|\(dot\)/gi, ".")
    .replace(/mailto:/gi, " ");
  const found = new Set<string>();
  for (const m of text.match(EMAIL) ?? []) {
    const e = m.toLowerCase();
    if (!JUNK.test(e) && e.length < 60) found.add(e);
  }
  return [...found];
}

function pick(emails: string[], site: string): string | null {
  if (emails.length === 0) return null;
  const host = site.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
  const sameDomain = emails.filter((e) => e.endsWith("@" + host) || e.endsWith("." + host));
  const pool = sameDomain.length > 0 ? sameDomain : emails;
  return pool.find((e) => PREFERRED.test(e)) ?? pool[0];
}

interface Row { slug: string; name: string; city: string; country: string; website: string; total_review_count: number; }

async function main() {
  const rows: Row[] = await sql`
    SELECT slug, name, city, country, website, total_review_count
    FROM stores
    WHERE website IS NOT NULL AND website <> ''
    ORDER BY total_review_count DESC
    ${LIMIT ? sql`LIMIT ${LIMIT}` : sql``}`;
  console.log(`Stores with a website: ${rows.length}`);

  const out: string[] = ["slug,name,city,country,website,reviews,email,source"];
  let found = 0, failed = 0, cursor = 0;

  async function worker() {
    while (cursor < rows.length) {
      const r = rows[cursor++];
      const base = /^https?:\/\//i.test(r.website) ? r.website : `https://${r.website}`;
      const home = await fetchText(base);
      if (!home) { failed++; continue; }
      let email = pick(emailsIn(home), base);
      let source = "homepage";
      if (!email) {
        const link = home.match(CONTACT_LINK)?.[1];
        if (link) {
          let target: string | null = null;
          try { target = new URL(link, base).toString(); } catch { /* ignore */ }
          if (target && new URL(target).host === new URL(base).host) {
            const page = await fetchText(target);
            if (page) { email = pick(emailsIn(page), base); source = "contact-page"; }
          }
        }
      }
      if (email) {
        found++;
        const q = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
        out.push([q(r.slug), q(r.name), q(r.city), q(r.country), q(r.website), r.total_review_count, q(email), source].join(","));
      }
      if ((found + failed) % 100 === 0) console.log(`  … ${cursor}/${rows.length} processed, ${found} emails`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  mkdirSync("outreach", { recursive: true });
  const path = `outreach/shop-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  writeFileSync(path, out.join("\n") + "\n");
  console.log(`\nEmails found: ${found} of ${rows.length} (fetch failures: ${failed})`);
  console.log(`Written: ${path}`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
