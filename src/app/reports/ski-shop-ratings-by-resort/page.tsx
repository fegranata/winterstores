import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  LayersIcon,
  MountainIcon,
  StarIcon,
} from "@/components/ui/Icons";
import {
  FAMOUS_OUTSIDE_TOP_TEN,
  FAMOUS_RANKED,
  RANKED_RESORTS,
  REPORT_PATHS,
  RESORT_RATINGS,
  UNRANKED_RESORTS,
  formatSnapshotDate,
  ordinal,
} from "@/lib/data/resort-ratings";
import type { GroupRating } from "@/lib/resort-ratings";

/*
 * Everything on this page is derived from the frozen snapshot
 * (src/lib/data/resort-ratings.json). The prose under "Key findings" is
 * composed from the numbers rather than written by hand, so regenerating the
 * snapshot can never leave a sentence contradicting the table below it.
 * No database access, no revalidation: the page changes only with a deploy.
 */

const BASE_URL = "https://winterstores.co";
const { totals, method, season, generatedAt } = RESORT_RATINGS;
const n = (v: number) => v.toLocaleString("en-US");
const pct = (v: number) => `${Math.round(v * 100)}%`;

const TITLE = `Ski Shop Ratings by Resort ${season}: ${RANKED_RESORTS.length} Resorts Ranked`;
const DESCRIPTION =
  `Which ski resorts have the best-rated rental and gear shops? ${RANKED_RESORTS.length} resorts ranked ` +
  `on ${n(totals.reviews)} public reviews of ${n(totals.storesRated)} ski shops, with full method and a free CSV.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}${REPORT_PATHS.ratings}` },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    publishedTime: generatedAt,
  },
};

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Position of a score on the 4.0–5.0 track used by the table, as a percentage. */
function trackPosition(score: number): number {
  return Math.min(100, Math.max(0, (score - 4) * 100));
}

function buildFindings(): { title: string; body: string }[] {
  const first = RANKED_RESORTS[0];
  const last = RANKED_RESORTS[RANKED_RESORTS.length - 1];
  const findings: { title: string; body: string }[] = [];

  findings.push({
    title: `${first.name} has the best-rated ski shops of any resort we cover`,
    body:
      `Its ${first.shops} rated shops average ${first.score!.toFixed(2)} out of 5 across ${n(first.reviews)} reviews. ` +
      `${RANKED_RESORTS[1].name} (${RANKED_RESORTS[1].score!.toFixed(2)}) and ${RANKED_RESORTS[2].name} ` +
      `(${RANKED_RESORTS[2].score!.toFixed(2)}) follow.`,
  });

  const gap = first.score! - last.score!;
  findings.push({
    title: `Only ${gap.toFixed(2)} stars separate first place from last`,
    body:
      `${last.name} is lowest of the ${RANKED_RESORTS.length} ranked resorts at ${last.score!.toFixed(2)}, which is still a good score. ` +
      `Ski shops are well reviewed almost everywhere: the average across all ${n(totals.storesRated)} rated shops is ${totals.meanScore.toFixed(2)}. ` +
      `Read this table as a guide to where a good shop is easiest to find, not as a list of places to avoid.`,
  });

  if (FAMOUS_OUTSIDE_TOP_TEN) {
    findings.push({
      title: "The most famous resorts are not where shops are rated best",
      body:
        `${list(FAMOUS_RANKED.map((r) => `${r.name} (${ordinal(r.rank!)})`))} all sit outside the top ten. ` +
        `The top of the table is mostly smaller or less expensive resorts, where a handful of shops serve a loyal clientele.`,
    });
  }

  const areas = RESORT_RATINGS.areas.filter((a) => a.resorts >= 2);
  if (areas.length >= 2) {
    const best = areas[0];
    const worst = areas[areas.length - 1];
    const between = areas
      .filter((a) => a !== best && a !== worst)
      .slice(0, 2)
      .map((a) => `${a.name} averages ${a.score.toFixed(2)}`)
      .join(" and ");
    findings.push({
      title: `${best.name} leads by area, ${worst.name} trails`,
      body:
        `Shops around resorts in ${best.name} average ${best.score.toFixed(2)} (${n(best.shops)} shops), ` +
        `against ${worst.score.toFixed(2)} in ${worst.name} (${n(worst.shops)} shops). ` +
        (between ? `${between}.` : ""),
    });
  }

  const flawless = RANKED_RESORTS.filter((r) => r.shareHigh === 1);
  if (flawless.length > 0) {
    findings.push({
      title:
        flawless.length === 1
          ? `In ${flawless[0].name}, every rated shop scores 4.5 or higher`
          : `In ${flawless.length} resorts, every rated shop scores 4.5 or higher`,
      body:
        `${list(flawless.map((r) => r.name))} ${flawless.length === 1 ? "has" : "have"} no rated shop below 4.5. ` +
        `Across all ranked resorts, the typical share of shops at 4.5 or above is ` +
        `${pct(RANKED_RESORTS.map((r) => r.shareHigh).sort((a, b) => a - b)[Math.floor(RANKED_RESORTS.length / 2)])}.`,
    });
  }

  return findings;
}

function GroupTable({ caption, label, rows }: { caption: string; label: string; rows: GroupRating[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th scope="col" className="eyebrow px-4 py-3 text-slate-500">{label}</th>
            <th scope="col" className="eyebrow px-4 py-3 text-right text-slate-500">Score</th>
            <th scope="col" className="eyebrow px-4 py-3 text-right text-slate-500">Shops</th>
            <th scope="col" className="eyebrow hidden px-4 py-3 text-right text-slate-500 sm:table-cell">Reviews</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((g) => (
            <tr key={g.name}>
              <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink-900">{g.name}</th>
              <td className="px-4 py-2.5 text-right font-display text-base font-semibold tabular-nums text-ink-900">
                {g.score.toFixed(2)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{n(g.shops)}</td>
              <td className="hidden px-4 py-2.5 text-right tabular-nums text-slate-600 sm:table-cell">{n(g.reviews)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SkiShopRatingsReport() {
  const findings = buildFindings();
  const published = formatSnapshotDate();
  const countries = RESORT_RATINGS.countries.filter((c) => c.shops >= method.minShops);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Ski Shop Ratings by Resort ${season}`,
    description: DESCRIPTION,
    url: `${BASE_URL}${REPORT_PATHS.ratings}`,
    datePublished: generatedAt,
    dateModified: generatedAt,
    temporalCoverage: generatedAt,
    keywords: ["ski rental", "ski shops", "ski resorts", "customer ratings", "snowboard rental"],
    creator: { "@type": "Organization", name: "WinterStores", url: BASE_URL },
    publisher: { "@type": "Organization", name: "WinterStores", url: BASE_URL },
    isAccessibleForFree: true,
    variableMeasured: [
      "Average customer rating of ski shops per resort (1–5)",
      "Number of rated ski shops per resort",
      "Number of customer reviews per resort",
      "Share of shops rated 4.5 or higher",
    ],
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${BASE_URL}${REPORT_PATHS.csv}`,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Reports", href: REPORT_PATHS.index },
          { name: "Ski Shop Ratings by Resort", href: REPORT_PATHS.ratings },
        ]}
      />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative bg-ink-900 bg-contours text-white">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/30" aria-hidden="true">/</span>
            <Link href={REPORT_PATHS.index} className="transition-colors hover:text-white">Reports</Link>
            <span className="text-white/30" aria-hidden="true">/</span>
            <span className="font-medium text-white" aria-current="page">Ski Shop Ratings by Resort</span>
          </nav>

          <p className="eyebrow mt-10 text-blue-300">WinterStores report · {season} season</p>
          <h1 className="mt-3 max-w-4xl heading-display text-4xl text-white sm:text-5xl lg:text-6xl">
            Ski Shop Ratings by Resort
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/80">
            Where are ski rental and gear shops rated best? We grouped {n(totals.storesRated)} shops by
            the resort they serve and ranked {RANKED_RESORTS.length} resorts on {n(totals.reviews)} public
            customer reviews.
          </p>

          <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Resorts ranked", value: String(RANKED_RESORTS.length) },
              { label: "Shops rated", value: n(totals.storesRated) },
              { label: "Reviews counted", value: n(totals.reviews) },
              { label: "Average rating", value: totals.meanScore.toFixed(2) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <dd className="font-display text-3xl font-semibold tabular-nums text-white sm:text-4xl">{s.value}</dd>
                <dt className="mt-1 text-sm text-white/70">{s.label}</dt>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm text-white/60">
            Data as of <time dateTime={generatedAt}>{published}</time>.{" "}
            <a href="#method" className="font-medium text-white underline underline-offset-4 hover:text-blue-200">
              How we ranked
            </a>{" "}
            ·{" "}
            <a href={REPORT_PATHS.csv} className="font-medium text-white underline underline-offset-4 hover:text-blue-200">
              Download the CSV
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ── Key findings ─────────────────────────────── */}
        <section aria-labelledby="findings">
          <h2 id="findings" className="heading-display text-3xl text-ink-900 sm:text-4xl">Key findings</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {findings.map((f, i) => (
              <li key={i} className="card p-6">
                <span className="font-display text-sm font-semibold tabular-nums text-glow-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-ink-900">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{f.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Full ranking ─────────────────────────────── */}
        <section aria-labelledby="ranking" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="ranking" className="heading-display text-3xl text-ink-900 sm:text-4xl">The full ranking</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Score is the average customer rating of the shops closest to each resort, out of 5.
                The bar shows where it falls between 4.0 and 5.0.
              </p>
            </div>
            <Link href={REPORT_PATHS.topResorts} className="btn-secondary">
              Read about the top 10
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 card overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <caption className="sr-only">
                {RANKED_RESORTS.length} ski resorts ranked by the average customer rating of nearby ski shops, {season} season
              </caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th scope="col" className="eyebrow w-12 px-4 py-3 text-slate-500">#</th>
                  <th scope="col" className="eyebrow px-4 py-3 text-slate-500">Resort</th>
                  <th scope="col" className="eyebrow px-4 py-3 text-slate-500">
                    Score <span className="font-normal normal-case tracking-normal text-slate-400">(4.0 to 5.0)</span>
                  </th>
                  <th scope="col" className="eyebrow px-4 py-3 text-right text-slate-500">Shops</th>
                  <th scope="col" className="eyebrow px-4 py-3 text-right text-slate-500">Reviews</th>
                  <th scope="col" className="eyebrow px-4 py-3 text-right text-slate-500">Rated 4.5+</th>
                  <th scope="col" className="eyebrow hidden px-4 py-3 text-slate-500 lg:table-cell">Top-rated shop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RANKED_RESORTS.map((r) => (
                  <tr key={r.slug} id={r.slug} className="scroll-mt-24 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-display text-base font-semibold tabular-nums text-slate-500">
                      {r.rank! <= 3 ? <span className="text-glow-700">{r.rank}</span> : r.rank}
                    </td>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <Link href={`/resorts/${r.slug}`} className="font-semibold text-ink-900 hover:text-blue-700">
                        {r.name}
                      </Link>
                      <span className="block text-xs text-slate-500">{r.country}</span>
                    </th>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 font-display text-lg font-semibold tabular-nums text-ink-900">
                          {r.score!.toFixed(2)}
                        </span>
                        <span className="relative hidden h-2 w-28 rounded-full bg-slate-100 sm:block xl:w-40" aria-hidden="true">
                          <span
                            className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                            style={{ width: `${trackPosition(r.score!)}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{r.shops}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{n(r.reviews)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{pct(r.shareHigh)}</td>
                    <td className="hidden max-w-[16rem] px-4 py-3 lg:table-cell">
                      {r.topShops[0] && (
                        <Link
                          href={`/store/${r.topShops[0].slug}`}
                          className="line-clamp-1 text-slate-600 hover:text-blue-700"
                          title={r.topShops[0].name}
                        >
                          {r.topShops[0].name}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {UNRANKED_RESORTS.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-display text-lg font-semibold text-ink-900">
                Not ranked: {UNRANKED_RESORTS.length} resorts without enough data
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                A resort needs at least {method.minShops} rated shops and {n(method.minResortReviews)} reviews
                between them to be ranked. These fall short, usually because our directory does not yet list
                enough of their shops, so we publish no score for them rather than a misleading one.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {UNRANKED_RESORTS.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/resorts/${r.slug}`} className="chip hover:border-blue-300 hover:text-blue-700">
                      {r.name}
                      <span className="text-xs text-slate-400">
                        {r.shops} shop{r.shops === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── By area and country ──────────────────────── */}
        <section aria-labelledby="areas" className="mt-16">
          <h2 id="areas" className="heading-display text-3xl text-ink-900 sm:text-4xl">By area and country</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            The same shops, grouped more broadly. Countries with fewer than {method.minShops} rated shops are left out.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GroupTable caption="Average ski shop rating by area" label="Area" rows={RESORT_RATINGS.areas.filter((a) => a.shops >= method.minShops)} />
            <GroupTable caption="Average ski shop rating by country" label="Country" rows={countries} />
          </div>
        </section>

        {/* ── Method ───────────────────────────────────── */}
        <section aria-labelledby="method" className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="method" className="scroll-mt-24 heading-display text-3xl text-ink-900 sm:text-4xl">How we ranked</h2>
            <ol className="mt-6 space-y-5">
              {[
                {
                  title: "The shops",
                  body: `WinterStores lists ${n(totals.stores)} ski and snowboard shops: rental shops, gear retailers, boot fitters and workshops. Each carries its public customer rating and review count, taken predominantly from Google reviews and re-checked on a rolling schedule.`,
                },
                {
                  title: "One shop, one resort",
                  body: `Every shop is counted once, for the nearest of the ${totals.resorts} resorts we cover, and only if it lies within ${method.radiusKm} km of it. ${n(totals.storesAssigned)} shops qualify. Neighbouring resorts therefore never share a shop, which is why this table can differ from the longer shop lists on our resort pages.`,
                },
                {
                  title: "Enough reviews to trust",
                  body: `A shop needs at least ${method.minShopReviews} reviews to count. Listings whose name identifies them only as a ski school are left out (${totals.schoolsExcluded} of them). That leaves ${n(totals.storesRated)} rated shops with ${n(totals.reviews)} reviews.`,
                },
                {
                  title: "The resort score",
                  body: `A resort's score is the average rating of its rated shops, weighted by each shop's number of reviews. A shop's weight is capped at ${method.reviewWeightCap} reviews so that one very large store cannot decide a resort's result on its own.`,
                },
                {
                  title: "Who gets ranked",
                  body: `Only resorts with at least ${method.minShops} rated shops and ${n(method.minResortReviews)} reviews are ranked: ${RANKED_RESORTS.length} of ${totals.resorts}. Ties are broken by review count.`,
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 font-display text-sm font-semibold text-blue-700">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink-900">{step.title}</h3>
                    <p className="mt-1 leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h3 className="mt-10 font-display text-xl font-semibold text-ink-900">What this does not tell you</h3>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li className="leading-relaxed">
                <strong className="font-semibold text-ink-900">It is not a test of the shops.</strong>{" "}
                We did not rent skis in {RANKED_RESORTS.length} resorts. The scores summarise what customers wrote publicly.
              </li>
              <li className="leading-relaxed">
                <strong className="font-semibold text-ink-900">Small gaps mean little.</strong>{" "}
                Resorts a few hundredths apart are effectively level. The top and bottom of the table are the robust part.
              </li>
              <li className="leading-relaxed">
                <strong className="font-semibold text-ink-900">Reviews cover the whole shop.</strong>{" "}
                A rating reflects rental, retail, repairs and service together, and some listed businesses also run a ski school.
              </li>
              <li className="leading-relaxed">
                <strong className="font-semibold text-ink-900">Coverage is not complete.</strong>{" "}
                We do not list every shop in every resort, and review habits differ between countries.
              </li>
            </ul>
          </div>

          {/* ── Use this data ──────────────────────────── */}
          <aside className="lg:col-span-5">
            <div className="card p-6 lg:sticky lg:top-24">
              <LayersIcon className="h-6 w-6 text-blue-600" />
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900">Use this data</h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                Journalists, bloggers and tourism offices are welcome to quote, chart and republish these
                figures. Please credit WinterStores with a link to this page.
              </p>
              <a href={REPORT_PATHS.csv} className="btn-primary mt-5" download>
                Download the CSV
              </a>
              <h3 className="eyebrow mt-6 text-slate-500">Suggested credit</h3>
              <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                Source: WinterStores, <em>Ski Shop Ratings by Resort {season}</em>,{" "}
                <span className="break-all">winterstores.co{REPORT_PATHS.ratings}</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Questions, corrections or a figure for a resort not shown here:{" "}
                <span className="font-medium text-slate-700">hello@winterstores.co</span>
              </p>
            </div>
          </aside>
        </section>

        {/* ── Onward links ─────────────────────────────── */}
        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              href: REPORT_PATHS.topResorts,
              icon: <StarIcon className="h-5 w-5" />,
              title: "The 10 best resorts for ski shops",
              body: "The top of this table in detail, with the shops behind each score.",
            },
            {
              href: "/resorts",
              icon: <MountainIcon className="h-5 w-5" />,
              title: "All resorts",
              body: `Every shop near each of the ${totals.resorts} resorts we cover.`,
            },
            {
              href: "/best-ski-shops",
              icon: <ArrowUpRightIcon className="h-5 w-5" />,
              title: "Best ski shops by country",
              body: "The highest-rated individual shops, country by country.",
            },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group card card-hover p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                {c.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 group-hover:text-blue-700">{c.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{c.body}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
