import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RatingStars from "@/components/store/RatingStars";
import { ArrowRightIcon, BookIcon, MapPinIcon, SearchIcon } from "@/components/ui/Icons";
import {
  FAMOUS_OUTSIDE_TOP_TEN,
  RANKED_RESORTS,
  REPORT_PATHS,
  RESORT_RATINGS,
  formatSnapshotDate,
  ordinal,
} from "@/lib/data/resort-ratings";
import type { ResortRating } from "@/lib/resort-ratings";
import type { ServiceType } from "@/types/store";

/*
 * The reader-facing companion to the ratings report: the top of the table,
 * with the shops behind each score.
 *
 * Which resorts appear, their numbers and their shops all come from the
 * frozen snapshot, so the list re-orders itself when the snapshot is rebuilt.
 * The only hand-written part is RESORT_CONTEXT: one sentence of general
 * knowledge per resort, deliberately free of anything that changes between
 * seasons (no prices, lift counts or snowfall figures). A resort that enters
 * the top ten without an entry simply renders without that sentence.
 */

const BASE_URL = "https://winterstores.co";
const TOP_N = 10;
const { season, generatedAt, totals, method } = RESORT_RATINGS;
const n = (v: number) => v.toLocaleString("en-US");

const TOP = RANKED_RESORTS.slice(0, TOP_N);

const TITLE = `The ${TOP.length} Ski Resorts With the Best-Rated Ski Shops (${season})`;
const DESCRIPTION =
  `${TOP[0].name}, ${TOP[1].name} and ${TOP[2].name} lead our ${season} ranking of ski resorts by rental and gear shop ratings. ` +
  `See the top ${TOP.length}, the shops behind each score, and the best resort in every region.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}${REPORT_PATHS.topResorts}` },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    publishedTime: generatedAt,
  },
};

const RESORT_CONTEXT: Record<string, string> = {
  "crested-butte":
    "A former mining town in Colorado's Elk Mountains, known for steep terrain and a compact, walkable centre.",
  bansko:
    "Bulgaria's largest ski resort, at the foot of the Pirin Mountains, and long one of Europe's best-value destinations.",
  fernie:
    "A powder town in the Canadian Rockies of British Columbia, with a historic main street a short drive from the lifts.",
  revelstoke:
    "Home to the biggest lift-served vertical drop in North America, in British Columbia's Selkirk Mountains.",
  lech: "A village on Austria's Arlberg, part of the country's largest linked ski area.",
  furano:
    "A resort in central Hokkaido, known for light, dry powder and a working town at its base.",
  tignes:
    "A high-altitude French resort sharing one ski area with Val d'Isère, with glacier skiing on the Grande Motte.",
  "poiana-brasov":
    "Romania's best-known ski resort, in the Carpathians above the city of Brașov.",
  verbier:
    "The main resort of Switzerland's 4 Vallées, with a long-standing reputation for off-piste terrain.",
  "crans-montana":
    "A sunny plateau resort in the Swiss canton of Valais, high above the Rhône valley.",
  mayrhofen: "The largest resort in Austria's Zillertal, popular with snowboarders and freestyle skiers.",
  kitzbuhel: "A medieval Tyrolean town and home of the Hahnenkamm downhill race.",
  "cortina-dampezzo": "The best-known resort in the Italian Dolomites, in the Ampezzo valley.",
};

/** Services worth naming: everything except the near-universal rentals tag. */
const NAMED_SERVICES: ServiceType[] = [
  "boot-fitting",
  "repairs",
  "waxing",
  "custom-fitting",
  "storage",
  "lessons",
  "used-gear",
];

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "3 of the 6 rated shops offer boot fitting, 3 do repairs and 2 sell used gear." */
function servicesSentence(r: ResortRating): string | null {
  const verbs: Partial<Record<ServiceType, string>> = {
    "boot-fitting": "offer boot fitting",
    repairs: "do repairs",
    waxing: "wax and tune",
    "custom-fitting": "do custom fitting",
    storage: "offer overnight storage",
    lessons: "also run lessons",
    "used-gear": "sell used gear",
  };
  const present = NAMED_SERVICES.filter((s) => (r.services[s] ?? 0) > 0)
    .sort((a, b) => (r.services[b] ?? 0) - (r.services[a] ?? 0))
    .slice(0, 3);
  if (present.length === 0) return null;

  const [first, ...rest] = present;
  const parts = [
    `${r.services[first]} of the ${r.shops} rated shops ${verbs[first]}`,
    ...rest.map((s) => `${r.services[s]} ${verbs[s]}`),
  ];
  return `${list(parts)}.`;
}

function ShopList({ resort }: { resort: ResortRating }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {resort.topShops.map((s) => (
        <li key={s.slug}>
          <Link
            href={`/store/${s.slug}`}
            className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-50"
          >
            <span className="min-w-0">
              <span className="line-clamp-1 font-medium text-ink-900 group-hover:text-blue-700" title={s.name}>
                {s.name}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPinIcon className="h-3 w-3" />
                {s.city} · {n(s.reviews)} reviews
              </span>
            </span>
            <span className="shrink-0">
              <RatingStars rating={s.score} size="sm" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function BestResortsForSkiShops() {
  const published = formatSnapshotDate();
  const last = RANKED_RESORTS[RANKED_RESORTS.length - 1];

  // Best resorts per area, for areas with a real field to choose from.
  const areas = RESORT_RATINGS.areas
    .filter((a) => a.resorts >= 2)
    .map((a) => ({
      ...a,
      best: RANKED_RESORTS.filter((r) => r.area === a.name).slice(0, 3),
    }));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: generatedAt,
    dateModified: generatedAt,
    author: { "@type": "Organization", name: "WinterStores", url: BASE_URL },
    publisher: { "@type": "Organization", name: "WinterStores", url: BASE_URL },
    mainEntityOfPage: `${BASE_URL}${REPORT_PATHS.topResorts}`,
    isBasedOn: `${BASE_URL}${REPORT_PATHS.ratings}`,
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: TITLE,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: TOP.length,
    itemListElement: TOP.map((r) => ({
      "@type": "ListItem",
      position: r.rank,
      name: r.name,
      url: `${BASE_URL}/resorts/${r.slug}`,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Reports", href: REPORT_PATHS.index },
          { name: "Best Resorts for Ski Shops", href: REPORT_PATHS.topResorts },
        ]}
      />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white bg-header-wash">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Reports", href: REPORT_PATHS.index },
              { label: "Best Resorts for Ski Shops" },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow text-blue-700">{season} season</p>
            <h1 className="mt-3 heading-display text-4xl text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              The {TOP.length} Ski Resorts With the Best-Rated Ski Shops
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
              A good rental shop saves a ski trip, and a bad boot fit ruins one. These are the resorts
              where customers rate the local rental and gear shops highest, based on{" "}
              {n(totals.reviews)} public reviews.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BookIcon className="h-4 w-4 text-blue-600" />
                <time dateTime={generatedAt}>{published}</time>
              </span>
              <span className="text-slate-300">·</span>
              <Link href={REPORT_PATHS.ratings} className="font-medium text-blue-700 hover:underline">
                Full ranking of {RANKED_RESORTS.length} resorts
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Intro */}
        <div className="max-w-[68ch] prose-editorial">
          <p>
            Most resort rankings measure the mountain: vertical drop, snowfall, lift queues. This one
            measures something you deal with before the first run, which is the shop that fits your
            boots and hands you your skis. We grouped {n(totals.storesRated)} ski and snowboard shops
            by the resort they serve and averaged their customer ratings.
          </p>
          <p>
            {FAMOUS_OUTSIDE_TOP_TEN &&
              "The result favours smaller and less expensive resorts over the famous names. "}
            {TOP[0].name} comes first with {TOP[0].score!.toFixed(2)} out of 5. The gap to{" "}
            {ordinal(last.rank!)} place is only {(TOP[0].score! - last.score!).toFixed(2)} stars, so
            a low position is not a warning. A high one does mean a well-reviewed shop is easy to find.
          </p>
        </div>

        {/* The top ten */}
        <ol className="mt-12 space-y-6">
          {TOP.map((r) => {
            const services = servicesSentence(r);
            return (
              <li key={r.slug} id={r.slug} className="card scroll-mt-24 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="p-6 sm:p-8 lg:col-span-7">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 font-display text-xl font-semibold tabular-nums text-white">
                        {r.rank}
                      </span>
                      <div className="min-w-0">
                        <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl">{r.name}</h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {r.country}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-slate-50 px-2 py-3">
                        <dd className="font-display text-2xl font-semibold tabular-nums text-ink-900">{r.score!.toFixed(2)}</dd>
                        <dt className="mt-0.5 text-xs text-slate-500">average rating</dt>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-3">
                        <dd className="font-display text-2xl font-semibold tabular-nums text-ink-900">{r.shops}</dd>
                        <dt className="mt-0.5 text-xs text-slate-500">rated shops</dt>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-3">
                        <dd className="font-display text-2xl font-semibold tabular-nums text-ink-900">{n(r.reviews)}</dd>
                        <dt className="mt-0.5 text-xs text-slate-500">reviews</dt>
                      </div>
                    </dl>

                    <div className="mt-6 space-y-3 leading-relaxed text-slate-600">
                      {RESORT_CONTEXT[r.slug] && <p>{RESORT_CONTEXT[r.slug]}</p>}
                      <p>
                        {r.shareHigh === 1
                          ? `Every one of its ${r.shops} rated shops scores 4.5 or higher.`
                          : `${Math.round(r.shareHigh * r.shops)} of its ${r.shops} rated shops score 4.5 or higher.`}
                        {services && ` ${services.charAt(0).toUpperCase()}${services.slice(1)}`}
                      </p>
                    </div>

                    <Link
                      href={`/resorts/${r.slug}`}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
                    >
                      All ski shops near {r.name}
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:col-span-5 lg:border-t-0 lg:border-l">
                    <h3 className="eyebrow text-slate-500">Top-rated shops</h3>
                    <div className="mt-3">
                      <ShopList resort={r} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Best by area */}
        <section aria-labelledby="by-area" className="mt-16">
          <h2 id="by-area" className="heading-display text-3xl text-ink-900 sm:text-4xl">The best resort in every region</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Not travelling to the top ten? These are the highest-ranked resorts in each part of the world we cover.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <div key={a.name} className="card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink-900">{a.name}</h3>
                  <span className="text-xs text-slate-500">area average {a.score.toFixed(2)}</span>
                </div>
                <ol className="mt-3 space-y-2">
                  {a.best.map((r) => (
                    <li key={r.slug} className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/resorts/${r.slug}`} className="min-w-0 truncate font-medium text-slate-800 hover:text-blue-700">
                        {r.name}
                        <span className="font-normal text-slate-400"> · {ordinal(r.rank!)} overall</span>
                      </Link>
                      <span className="shrink-0 font-display font-semibold tabular-nums text-ink-900">{r.score!.toFixed(2)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Method, briefly */}
        <section aria-labelledby="how" className="mt-16 max-w-[68ch]">
          <h2 id="how" className="heading-display text-2xl text-ink-900 sm:text-[1.75rem]">How the ranking works</h2>
          <div className="mt-4 prose-editorial">
            <p>
              Each shop counts once, for the nearest resort within {method.radiusKm} km, and only if it
              has at least {method.minShopReviews} reviews. A resort&apos;s score is the average rating of
              those shops, weighted by review count with a cap so one very large store cannot dominate.
              Resorts need {method.minShops} rated shops and {n(method.minResortReviews)} reviews to be
              ranked, which {RANKED_RESORTS.length} of the {totals.resorts} resorts we cover achieve.
            </p>
            <p>
              The scores summarise public customer reviews. They are not our own test of the shops, and
              resorts a few hundredths apart are effectively level. The{" "}
              <Link href={`${REPORT_PATHS.ratings}#method`} className="font-medium text-blue-700 hover:underline">
                full report
              </Link>{" "}
              has the complete table, the method in detail and a CSV download.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-ink-900 bg-contours p-8 text-center sm:p-10">
          <h2 className="heading-display text-2xl text-white sm:text-3xl">Going somewhere else?</h2>
          <p className="mt-2 text-sm text-white/70 sm:text-base">
            Compare the shops near any of {totals.resorts} resorts, or search by town.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/resorts"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 shadow-sm transition-colors hover:bg-blue-50"
            >
              Browse resorts
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <SearchIcon className="h-4 w-4" strokeWidth={2.25} />
              Search shops
            </Link>
          </div>
        </div>

        {/* Related guides */}
        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="eyebrow text-slate-500">Before you rent</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { href: "/guides/how-to-choose-ski-rental-shop", label: "How to choose a ski rental shop" },
              { href: "/guides/pre-booking-ski-rentals-guide", label: "Should you pre-book ski rentals online?" },
              { href: "/guides/boot-fitting-guide", label: "The boot fitting guide" },
            ].map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="group card card-hover flex items-center justify-between gap-3 p-4 text-sm font-medium text-ink-900">
                  <span className="group-hover:text-blue-700">{g.label}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-600" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

