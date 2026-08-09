import type { ServiceType, SportType, Store } from "@/types/store";

/**
 * Composes a factual summary for a store that has no written description.
 *
 * Why this exists: 1,021 of 1,053 store pages carried no prose at all, so two
 * shops of the same chain in the same town differed by about ten words out of
 * 288. Google crawled 602 of them and declined to index a single one. The facts
 * to tell them apart already existed in the database — they just never reached
 * the page.
 *
 * This is a render-time fallback, deliberately not a database migration. A
 * hand-written description always wins, new stores are covered automatically
 * with no backfill, and if it turns out not to help it can be removed in one
 * commit rather than unpicked from 1,021 rows.
 *
 * Two guards against this reading as boilerplate:
 *   - every clause is driven by data that genuinely varies between shops
 *     (services, score, review count, price, distance to the nearest resort)
 *   - phrasing is chosen by a stable hash of the slug, so two shops with
 *     near-identical facts still get different sentences
 */

const SPORT_PHRASE: Record<SportType, string> = {
  skiing: "skiing",
  snowboarding: "snowboarding",
  "cross-country": "cross-country skiing",
  "ice-skating": "ice skating",
  sledding: "sledding",
  snowshoeing: "snowshoeing",
  "ice-climbing": "ice climbing",
  biathlon: "biathlon",
};

const SERVICE_PHRASE: Record<ServiceType, string> = {
  rentals: "equipment rental",
  repairs: "repairs",
  lessons: "lessons",
  "custom-fitting": "custom fitting",
  "boot-fitting": "boot fitting",
  waxing: "waxing and tuning",
  storage: "overnight storage",
  "used-gear": "used gear",
};

const PRICE_PHRASE: Record<1 | 2 | 3, string> = {
  1: "budget-friendly",
  2: "mid-range",
  3: "premium",
};

/** Stable, order-independent hash so phrasing is deterministic per store. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** "a, b and c" */
function list(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export interface StoreDescriptionContext {
  /** Nearest known resort, when one is close enough to be worth mentioning. */
  nearestResort?: { name: string; distanceKm: number };
}

export function buildStoreDescription(
  store: Store,
  context: StoreDescriptionContext = {}
): string {
  const seed = hash(store.slug);
  const pick = <T,>(options: T[], offset: number): T =>
    options[(seed + offset) % options.length];

  const sentences: string[] = [];

  // ── What it is, and where ──────────────────────────────
  const sports = store.sportTypes.map((s) => SPORT_PHRASE[s]).filter(Boolean);
  const sportPart = sports.length > 0 ? list(sports.slice(0, 3)) : "winter sports";
  const place = store.region && store.region !== store.city
    ? `${store.city}, ${store.region}`
    : store.city;

  sentences.push(
    pick(
      [
        `${store.name} is a winter sport shop in ${place}, serving ${sportPart}.`,
        `${store.name} serves ${sportPart} from its location in ${place}.`,
        `Based in ${place}, ${store.name} caters to ${sportPart}.`,
      ],
      0
    )
  );

  // ── What it actually does ──────────────────────────────
  const services = store.services.map((s) => SERVICE_PHRASE[s]).filter(Boolean);
  if (services.length > 0) {
    sentences.push(
      pick(
        [
          `The shop offers ${list(services)}.`,
          `Services include ${list(services)}.`,
          `You'll find ${list(services)} here.`,
        ],
        1
      )
    );
  }

  // ── How it's rated, and on what evidence ───────────────
  if (Number.isFinite(store.winterstoresScore) && store.totalReviewCount > 0) {
    const score = store.winterstoresScore.toFixed(1);
    const reviews = store.totalReviewCount.toLocaleString();
    sentences.push(
      pick(
        [
          `It holds a WinterStores Score of ${score} out of 5, aggregated from ${reviews} reviews across Google, Facebook and Foursquare.`,
          `Across ${reviews} reviews on Google, Facebook and Foursquare it scores ${score} out of 5.`,
          `Its WinterStores Score is ${score} out of 5, based on ${reviews} reviews from multiple platforms.`,
        ],
        2
      )
    );
  }

  // ── Practical detail that differs shop to shop ─────────
  const extras: string[] = [];
  if (context.nearestResort && context.nearestResort.distanceKm <= 30) {
    const { name, distanceKm } = context.nearestResort;
    extras.push(
      distanceKm < 1
        ? `It sits right at ${name}`
        : `It's about ${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km from ${name}`
    );
  }
  if (store.hasOnlineShop) extras.push("it also sells online");
  if (store.priceLevel) extras.push(`pricing is ${PRICE_PHRASE[store.priceLevel]}`);

  if (extras.length > 0) {
    const joined = list(extras);
    sentences.push(`${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`);
  }

  return sentences.join(" ");
}

/**
 * The description to render: the hand-written one when it exists, otherwise a
 * composed summary. Returns null only if there is genuinely nothing to say.
 */
export function resolveStoreDescription(
  store: Store,
  context: StoreDescriptionContext = {}
): string | null {
  const written = store.description?.trim();
  if (written) return written;

  const generated = buildStoreDescription(store, context);
  return generated.length > 0 ? generated : null;
}
