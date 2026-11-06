import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreBySlug, getNearbyStores, getPlatformRatings, getStoreReviews } from "@/lib/store-search";
import { getDb, schema } from "@/lib/db";
import { SPORT_LABELS, SERVICE_LABELS } from "@/types/store";
import RatingStars from "@/components/store/RatingStars";
import StoreCard from "@/components/store/StoreCard";
import StoreJsonLd from "@/components/seo/StoreJsonLd";
import StoreActions from "@/components/store/StoreActions";
import RecentlyViewedTracker from "@/components/store/RecentlyViewedTracker";
import PhotoGallery from "@/components/store/PhotoGallery";
import ReportForm from "@/components/store/ReportForm";
import PlatformRatings from "@/components/store/PlatformRatings";
import ReviewSection from "@/components/store/ReviewSection";
import RelatedGuides from "@/components/store/RelatedGuides";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  ServiceIcon,
  ShoppingBagIcon,
  SportIcon,
  TagIcon,
  VerifiedIcon,
} from "@/components/ui/Icons";
import { getGuidesForStore } from "@/lib/data/guides";
import { getNearestResort } from "@/lib/data/resorts";
import { resolveStoreDescription } from "@/lib/store-description";
import { isIndexableStore } from "@/lib/store-quality";
import type { Store } from "@/types/store";

/** Nearest-resort context for the description, shared by metadata and the page. */
function describeContext(store: Store) {
  const nearest = getNearestResort(store.latitude, store.longitude);
  return nearest
    ? {
        nearestResort: {
          name: nearest.resort.name,
          distanceKm: nearest.distanceKm,
        },
      }
    : {};
}
import AdSlot from "@/components/ui/AdSlot";
import type { Metadata } from "next";

// 7 days. Store data only changes when discovery or verify-stores runs, and
// both are manual and followed by a deploy that rebuilds every page anyway —
// so daily regeneration was buying nothing.
//
// This is the dominant term in Vercel's ISR Writes quota: 1,377 pages is by far
// the largest route. The "unexplained ~8x" (12,000 observed units/day vs ~1,550
// expected regenerations) is resolved: Vercel bills ISR Writes in 8KB units,
// not per write, so one ~60-100KB page regeneration costs ~8-13 units. Not
// region multiplication. The levers are therefore regeneration frequency
// (this TTL) and payload size.
//
// Cost of this choice: a newly posted review takes up to 7 days to appear,
// because getStoreReviews is server-rendered into the page. Acceptable at
// current volume (786 page views last month, zero reviews). If reviews become
// active, move that section to a client fetch against
// /api/stores/[slug]/ratings rather than shortening this back.
export const revalidate = 604800;

// Without this, an unknown slug renders a "Store Not Found" page with HTTP 200
// instead of a 404, and each unique bogus URL a crawler probes becomes its own
// ISR cache entry — i.e. a billable write. generateStaticParams below already
// enumerates every store, and nothing inserts into storesTable at runtime
// (suggestions land in storeSuggestionsTable), so the set is complete at build.
export const dynamicParams = false;

export async function generateStaticParams() {
  const db = getDb();
  const rows = await db
    .select({ slug: schema.storesTable.slug })
    .from(schema.storesTable);
  return rows.map((r) => ({ slug: r.slug }));
}

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Store Not Found" };

  const title = `${store.name} — Winter Sport Store in ${store.city}, ${store.country}`;
  // Prefer the real (or composed) description over the old generic fallback,
  // which was identical for every store and made a poor search snippet.
  const description =
    resolveStoreDescription(store, describeContext(store))?.slice(0, 300) ||
    `Find reviews, services, and details for ${store.name} in ${store.city}, ${store.country}.`;

  return {
    title,
    description,
    // Only pages with distinguishing substance ask to be indexed (see
    // store-quality.ts); the rest stay usable for humans and keep linking
    // outward, but no longer compete for crawl budget.
    ...(!isIndexableStore(store) && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      type: "website",
      images: store.coverPhoto ? [{ url: store.coverPhoto, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: store.coverPhoto ? [store.coverPhoto] : undefined,
    },
    alternates: {
      canonical: `https://winterstores.co/store/${slug}`,
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  // Run all independent queries in parallel
  const [nearby, platformRatings, reviews] = await Promise.all([
    getNearbyStores(store, 4),
    getPlatformRatings(store.id),
    getStoreReviews(store.id),
  ]);

  const description = resolveStoreDescription(store, describeContext(store));

  const priceDollars = "$".repeat(store.priceLevel);

  // Extract Google Maps URL from platform ratings cache
  const googleEntry = platformRatings.find((r) => r.platform === "google");
  const googleMapsUrl =
    googleEntry?.platformUrl ||
    `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;

  // Format platform ratings for the component
  const ratingsData: Record<string, { platform: string; rating: number; reviewCount: number; platformUrl: string } | null> = {};
  for (const p of ["google", "facebook", "foursquare"] as const) {
    const row = platformRatings.find((r) => r.platform === p);
    ratingsData[p] = row && row.rating != null
      ? { platform: p, rating: row.rating, reviewCount: row.reviewCount ?? 0, platformUrl: row.platformUrl ?? "" }
      : null;
  }

  const scoreValue = Number.isFinite(store.winterstoresScore)
    ? store.winterstoresScore.toFixed(1)
    : "—";
  const scorePct = Number.isFinite(store.winterstoresScore)
    ? Math.max(0, Math.min(100, (store.winterstoresScore / 5) * 100))
    : 0;

  return (
    <div>
      <StoreJsonLd store={store} />
      <RecentlyViewedTracker slug={store.slug} />

      {/* ── Header band: name, place, score ─────────────── */}
      <section className="border-b border-slate-200 bg-white bg-header-wash">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 sm:pb-10 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Search", href: "/search" },
              { label: store.country, href: `/search?country=${store.countryCode}` },
              { label: store.name },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h1 className="heading-display text-3xl text-ink-900 sm:text-4xl lg:text-5xl">
                  {store.name}
                </h1>
                <div className="flex shrink-0 items-center gap-2 pt-1">
                  <StoreActions slug={store.slug} name={store.name} />
                </div>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-slate-600">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  {store.address}, {store.city}, {store.region}, {store.country}
                </span>
              </p>
              {store.isVerified && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                      <VerifiedIcon className="h-4 w-4" />
                      Verified
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* WinterStores Score block */}
            <div className="flex items-center gap-5 rounded-2xl bg-ink-900 p-4 pr-6 text-white shadow-lg sm:p-5 sm:pr-8">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
                style={{
                  background: `conic-gradient(#3b82f6 ${scorePct}%, rgb(255 255 255 / 0.12) 0)`,
                }}
              >
                <span className="absolute inset-[5px] rounded-full bg-ink-900" aria-hidden="true" />
                <span className="relative font-display text-3xl font-semibold tabular-nums sm:text-4xl">
                  {scoreValue}
                </span>
              </div>
              <div>
                <RatingStars rating={store.winterstoresScore} size="lg" showValue={false} />
                <span className="mt-2 block text-sm text-white/70">
                  Based on <span className="font-semibold text-white">{store.totalReviewCount}</span> reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About — falls back to a composed summary when no copy was written */}
            {description && (
              <section className="card p-6 sm:p-8">
                <h2 className="heading-display text-2xl text-ink-900 mb-4">About</h2>
                <div className="prose-editorial">
                  <p>{description}</p>
                </div>
              </section>
            )}

            {/* Services — the visual star alongside the score */}
            {store.services.length > 0 && (
              <section>
                <h2 className="heading-display text-2xl text-ink-900 mb-4">Services</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {store.services.map((service) => (
                    <li
                      key={service}
                      className="flex items-center gap-3 card px-4 py-3.5"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <ServiceIcon service={service} className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-ink-900">
                        {SERVICE_LABELS[service]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Platform Ratings */}
            <section>
              <h2 className="heading-display text-2xl text-ink-900 mb-4">
                Ratings Across Platforms
              </h2>
              <PlatformRatings ratings={ratingsData} />
            </section>

            {/* Photo Gallery */}
            <PhotoGallery photos={store.photos} storeName={store.name} />

            {/* Reviews */}
            <ReviewSection storeId={store.id} storeSlug={store.slug} initialReviews={reviews} />

            {/* Report incorrect info */}
            <div className="border-t border-slate-200 pt-6">
              <ReportForm storeName={store.name} storeSlug={store.slug} />
            </div>

            {/* Ad placement — store detail */}
            <AdSlot slot="store-detail-content" format="banner" />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Quick Info Card */}
            <div className="card p-6">
              <h2 className="eyebrow text-slate-500">Details</h2>
              <dl className="mt-4 divide-y divide-slate-100">
                {/* Price Level */}
                <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <dt className="flex items-center gap-2 text-sm text-slate-500">
                    <TagIcon className="h-4 w-4 text-slate-400" />
                    Price Level
                  </dt>
                  <dd className="text-sm font-semibold tracking-wide text-ink-900">{priceDollars}</dd>
                </div>

                {/* Phone */}
                {store.phone && (
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="flex items-center gap-2 text-sm text-slate-500">
                      <PhoneIcon className="h-4 w-4 text-slate-400" />
                      Phone
                    </dt>
                    <dd>
                      <a
                        href={`tel:${store.phone}`}
                        className="text-sm font-medium text-blue-700 hover:text-blue-900"
                      >
                        {store.phone}
                      </a>
                    </dd>
                  </div>
                )}

                {/* Website */}
                {store.website && (
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
                      <GlobeIcon className="h-4 w-4 text-slate-400" />
                      Website
                    </dt>
                    <dd className="min-w-0">
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-medium text-blue-700 hover:text-blue-900 max-w-[200px]"
                      >
                        {store.website.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Online Shop */}
              {store.hasOnlineShop && store.onlineShopUrl && (
                <a
                  href={store.onlineShopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  Visit Online Shop
                </a>
              )}
            </div>

            {/* Location Card */}
            <div className="card p-6">
              <h2 className="eyebrow text-slate-500 mb-3">Location</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {store.address}<br />
                {store.city}, {store.region}<br />
                {store.country} {store.postalCode}
              </p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 btn-secondary w-full"
              >
                <MapPinIcon className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>

            {/* Sports */}
            {store.sportTypes.length > 0 && (
              <div className="card p-6">
                <h2 className="eyebrow text-slate-500 mb-3">Sports</h2>
                <div className="flex flex-wrap gap-2">
                  {store.sportTypes.map((sport) => (
                    <Link
                      key={sport}
                      href={`/search?sport=${sport}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 transition-colors"
                    >
                      <SportIcon sport={sport} className="h-4 w-4" />
                      {SPORT_LABELS[sport]}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ad placement — sidebar */}
            <AdSlot slot="store-detail-sidebar" format="rectangle" />
          </aside>
        </div>

        {/* Nearby Stores */}
        {nearby.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-6">Nearby Stores</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {nearby.map((ns) => (
                <StoreCard key={ns.id} store={ns} />
              ))}
            </div>
          </section>
        )}

        <RelatedGuides
          guides={getGuidesForStore(store)}
          storeName={store.name}
        />
      </div>
    </div>
  );
}
