/**
 * Enrich store service tags by reading each store's own website.
 *
 * Why: 97.7% of stores carry no service tag beyond rentals, while the
 * product's core pitch is filtering by service. The evidence is sitting on
 * the shops' homepages ("Bootfitting", "Skiservice", "Atelier", "Fartage",
 * "Ski Depot") in half a dozen languages — this script reads it once and
 * merges the findings into `services`.
 *
 * Multiplier check (HANDOVER.md rule): runs manually, never per render or
 * per build. Cost is one polite HTTP fetch per store website (~1,000 sites,
 * no paid APIs) plus one small select and at most one update per store.
 *
 * Matching is evidence-tiered to keep precision:
 *   - strong keywords tag on a single hit ("bootfitting", "skiverleih")
 *   - weak keywords need two hits ("occasion" also means "special occasion"
 *     in English; "ski school" is often just a link to the local school)
 * Tags are only ever ADDED, never removed — a hand-set tag always survives.
 *
 * Usage:
 *   npx tsx scripts/enrich-services.ts                 (dry run, full corpus)
 *   npx tsx scripts/enrich-services.ts --limit 50      (dry run, first 50)
 *   npx tsx scripts/enrich-services.ts --country FR    (one country)
 *   npx tsx scripts/enrich-services.ts --commit        (write the tags)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 3 });
const COMMIT = process.argv.includes("--commit");
const limitIdx = process.argv.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? Number(process.argv[limitIdx + 1]) : null;
const countryIdx = process.argv.indexOf("--country");
const COUNTRY = countryIdx !== -1 ? process.argv[countryIdx + 1] : null;

const CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_BODY_BYTES = 600_000;
const USER_AGENT =
  "WinterStoresBot/1.0 (+https://winterstores.co; service-tag enrichment)";

type ServiceType =
  | "rentals"
  | "repairs"
  | "lessons"
  | "custom-fitting"
  | "boot-fitting"
  | "waxing"
  | "storage"
  | "used-gear";

/**
 * Keywords are matched against diacritic-stripped, lowercased page text with
 * a "no word character immediately before" guard, so "rental" also matches
 * "rentals" but "wax" does not match inside "Bienenwachskerzen". German
 * compounds get their own entries because the guard hides them otherwise
 * ("skiverleih" has no boundary before "verleih").
 */
const VOCAB: Record<ServiceType, { strong: string[]; weak: string[] }> = {
  rentals: {
    strong: [
      "rental", "ski hire", "board hire", "hire ski",
      "verleih", "skiverleih", "snowboardverleih", "leihmaterial",
      "noleggio", "alquiler", "aluguer",
      "location de ski", "location ski", "location de snowboard", "location materiel",
      "skiuthyrning", "uthyrning", "skiutleie", "utleie", "vuokraamo", "vuokraus",
      "pujcovna", "wypozyczalnia", "izposoja",
    ],
    weak: ["rent equipment", "rent skis", "rent a ski"],
  },
  repairs: {
    strong: [
      "repair", "ski repair", "board repair",
      "reparatur", "werkstatt", "servicewerkstatt",
      "reparation", "atelier de reparation",
      "riparazion", "reparacion",
      "skiservice", "ski service", "board service", "serviceverksted",
      "base repair", "edge repair", "ptex", "p-tex",
    ],
    weak: ["atelier", "service center", "servicecenter"],
  },
  lessons: {
    strong: [
      "our ski school", "unsere skischule", "notre ecole de ski",
      "ski lessons with us", "book a lesson",
    ],
    weak: [
      "ski school", "skischule", "ecole de ski", "scuola sci", "scuola di sci",
      "ski lesson", "skikurs", "cours de ski", "ski instructor", "skilehrer",
      "clases de esqui", "skidskola", "hiihtokoulu", "lekcje",
    ],
  },
  "custom-fitting": {
    strong: [
      "custom fitting", "custom insole", "custom footbed", "custom-fit",
      "semelles sur mesure", "semelle sur mesure",
      "fussanalyse", "fussbett", "einlagen",
      "plantari su misura", "plantillas personalizadas",
      "foot analysis", "foot scan", "footscan",
    ],
    weak: ["sur mesure", "massanfertigung", "custom fit"],
  },
  "boot-fitting": {
    strong: [
      "bootfitting", "boot fitting", "boot-fitting", "bootfitter", "boot fitter",
      "skischuhanpassung", "schuhanpassung", "skischuh-fitting", "skischuh fitting",
      "bootfit",
    ],
    weak: ["boot specialist", "boot doctor"],
  },
  waxing: {
    strong: [
      "waxing", "wax service", "hot wax", "hotwax",
      "fartage", "sciolinatura", "encerado",
      "wachsservice", "skiwachs", "heisswachs", "wachsen und schleifen",
      "kantenschliff", "steinschliff", "belagsservice", "belagservice",
      "edge tuning", "stone grind", "skidvalla", "vallning", "tuning service",
    ],
    weak: ["tuning", "wax"],
  },
  storage: {
    strong: [
      "ski storage", "board storage", "gear storage", "overnight storage",
      "skidepot", "ski depot", "skiaufbewahrung", "depotservice",
      "consigne", "gardiennage", "deposito sci", "skideponering",
      "storage locker",
    ],
    weak: ["depot", "locker"],
  },
  "used-gear": {
    strong: [
      "used gear", "used ski", "used snowboard", "second hand", "second-hand",
      "secondhand", "ex rental", "ex-rental", "demo sale",
      "ski occasion", "skis d'occasion", "materiel d'occasion",
      "gebrauchte ski", "gebrauchtmaterial", "sci usati", "usato garantito",
      "segunda mano", "begagnat", "brukt utstyr",
    ],
    weak: ["occasion", "gebraucht", "usato", "demo ski"],
  },
};

/** Compile once: keyword -> RegExp with a leading non-word guard. */
function compile(kw: string): RegExp {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9])${escaped}`, "g");
}
const COMPILED: Record<
  ServiceType,
  { strong: [string, RegExp][]; weak: [string, RegExp][] }
> = Object.fromEntries(
  Object.entries(VOCAB).map(([svc, { strong, weak }]) => [
    svc,
    {
      strong: strong.map((k) => [k, compile(k)]),
      weak: weak.map((k) => [k, compile(k)]),
    },
  ])
) as never;

function normalize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.includes("html") && !type.includes("text")) return null;
    const buf = await res.arrayBuffer();
    return new TextDecoder("utf-8", { fatal: false }).decode(
      buf.slice(0, MAX_BODY_BYTES)
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface Detection {
  services: ServiceType[];
  evidence: Record<string, string[]>;
}

function detect(text: string): Detection {
  const services: ServiceType[] = [];
  const evidence: Record<string, string[]> = {};
  for (const svc of Object.keys(COMPILED) as ServiceType[]) {
    const { strong, weak } = COMPILED[svc];
    const hits: string[] = [];
    let strongHits = 0;
    let weakHits = 0;
    for (const [kw, re] of strong) {
      const n = (text.match(re) ?? []).length;
      if (n > 0) {
        strongHits += n;
        hits.push(`${kw}×${n}`);
      }
    }
    for (const [kw, re] of weak) {
      const n = (text.match(re) ?? []).length;
      if (n > 0) {
        weakHits += n;
        hits.push(`${kw}×${n}(w)`);
      }
    }
    if (strongHits >= 1 || weakHits >= 2) {
      services.push(svc);
      evidence[svc] = hits;
    }
  }
  return { services, evidence };
}

interface StoreRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  website: string;
  services: ServiceType[];
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Service-Tag Enrichment from Store Websites");
  console.log("═══════════════════════════════════════════════════\n");

  const rows: StoreRow[] = await sql`
    SELECT id, slug, name, city, website, services
    FROM stores
    WHERE website IS NOT NULL AND website != ''
      ${COUNTRY ? sql`AND country_code = ${COUNTRY}` : sql``}
    ORDER BY country_code, city, name
    ${LIMIT ? sql`LIMIT ${LIMIT}` : sql``}
  `;

  console.log(`Stores with a website: ${rows.length}`);
  if (COUNTRY) console.log(`Country filter: ${COUNTRY}`);
  console.log(`Mode: ${COMMIT ? "COMMIT (writing tags)" : "DRY RUN (no writes)"}\n`);

  let fetched = 0;
  let failed = 0;
  let updated = 0;
  const gained: Record<ServiceType, number> = {
    rentals: 0, repairs: 0, lessons: 0, "custom-fitting": 0,
    "boot-fitting": 0, waxing: 0, storage: 0, "used-gear": 0,
  };
  const samples: string[] = [];

  let cursor = 0;
  async function worker() {
    while (cursor < rows.length) {
      const store = rows[cursor++];
      const url = /^https?:\/\//i.test(store.website)
        ? store.website
        : `https://${store.website}`;
      const html = await fetchPage(url);
      if (!html) {
        failed++;
        continue;
      }
      fetched++;
      const { services: found, evidence } = detect(normalize(html));
      const existing = new Set<ServiceType>(store.services ?? []);
      const added = found.filter((s) => !existing.has(s));
      if (added.length === 0) continue;

      for (const s of added) gained[s]++;
      if (samples.length < 60) {
        samples.push(
          `  ${store.name} (${store.city}): +${added.join(", +")}\n` +
            added
              .map((s) => `      ${s}: ${evidence[s].slice(0, 4).join(", ")}`)
              .join("\n")
        );
      }

      if (COMMIT) {
        const merged = [...existing, ...added];
        await sql`
          UPDATE stores
          SET services = ${sql.json(merged)}, updated_at = NOW()
          WHERE id = ${store.id}
        `;
      }
      updated++;
      if (updated % 50 === 0) {
        console.log(`  … ${updated} stores gained tags (${cursor}/${rows.length} processed)`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Results ${COMMIT ? "(written)" : "(dry run)"}:`);
  console.log(`    Sites fetched:     ${fetched}`);
  console.log(`    Fetch failures:    ${failed}`);
  console.log(`    Stores gaining tags: ${updated}`);
  console.log(`  Tags gained by service:`);
  for (const [svc, n] of Object.entries(gained)) {
    if (n > 0) console.log(`    ${svc.padEnd(16)} ${n}`);
  }
  console.log(`\n  Sample evidence (first ${Math.min(60, samples.length)}):`);
  console.log(samples.join("\n"));
  console.log(`═══════════════════════════════════════════════════`);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
