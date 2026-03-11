import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { getStoreBySlug, getNearbyStores } from "@/lib/store-search";
import { getDb, schema } from "@/lib/db";
import { SPORT_ICONS, SPORT_LABELS, SERVICE_LABELS } from "@/types/store";
import RatingStars from "@/components/store/RatingStars";
import StoreCard from "@/components/store/StoreCard";
import StoreJsonLd from "@/components/seo/StoreJsonLd";
import StoreActions from "@/components/store/StoreActions";
import RecentlyViewedTracker from "@/components/store/RecentlyViewedTracker";
import PhotoGallery from "@/components/store/PhotoGallery";
import ReportForm from "@/components/store/ReportForm";
import PlatformRatings from "@/components/store/PlatformRatings";
import ReviewSection from "@/components/store/ReviewSection";
import AdSlot from "@/components/ui/AdSlot";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Store Not Found" };

  const title = `${store.name} — Winter Sport Store in ${store.city}, ${store.country}`;
  const description = store.description || `Find reviews, services, and details for ${store.name} in ${store.city}, ${store.country}.`;

  return {
    title,
    description,
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

  const nearby = await getNearbyStores(store, 4);
  const priceDollars = "$".repeat(store.priceLevel);

  // Get cached Google Maps URL for consistent location linking
  const db = getDb();
  const [googleCache] = await db
    .select({ platformUrl: schema.platformRatingsCacheTable.platformUrl })
    .from(schema.platformRatingsCacheTable)
    .where(
      and(
        eq(schema.platformRatingsCacheTable.storeId, store.id),
        eq(schema.platformRatingsCacheTable.platform, "google")
      )
    )
    .limit(1);
  const googleMapsUrl =
    googleCache?.platformUrl ||
    `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <StoreJsonLd store={store} />
      <RecentlyViewedTracker slug={store.slug} />

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-slate-600 transition-colors">Search</Link>
        <span>/</span>
        <Link
          href={`/search?country=${store.countryCode}`}
          className="hover:text-slate-600 transition-colors"
        >
          {store.country}
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate">{store.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {store.name}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <StoreActions slug={store.slug} name={store.name} />
                {store.isVerified && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-slate-500">
              {store.address}, {store.city}, {store.region}, {store.country}
            </p>
          </div>

          {/* Photo Gallery */}
          <PhotoGallery photos={store.photos} storeName={store.name} />

          {/* WinterStores Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              WinterStores Score
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-blue-50">
                <span className="text-3xl font-bold text-blue-700">
                  {store.winterstoresScore.toFixed(1)}
                </span>
              </div>
              <div>
                <RatingStars rating={store.winterstoresScore} size="lg" showValue={false} />
                <p className="mt-1 text-sm text-slate-500">
                  Based on <span className="font-semibold text-slate-700">{store.totalReviewCount}</span> reviews
                </p>
              </div>
            </div>
          </div>

          {/* Platform Ratings */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Ratings Across Platforms
            </h2>
            <PlatformRatings slug={store.slug} />
          </div>

          {/* About */}
          {store.description && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
              <p className="text-slate-600 leading-relaxed">{store.description}</p>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection storeId={store.id} storeSlug={store.slug} />

          {/* Report incorrect info */}
          <ReportForm storeName={store.name} storeSlug={store.slug} />

          {/* Ad placement — store detail */}
          <AdSlot slot="store-detail-content" format="banner" />
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 lg:self-start space-y-6">
          {/* Quick Info Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>

            {/* Price Level */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Price Level</span>
              <span className="text-sm font-semibold text-slate-700">{priceDollars}</span>
            </div>

            {/* Phone */}
            {store.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Phone</span>
                <a
                  href={`tel:${store.phone}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {store.phone}
                </a>
              </div>
            )}

            {/* Website */}
            {store.website && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">Website</span>
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate max-w-[200px]"
                >
                  {store.website.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            )}

            {/* Online Shop */}
            {store.hasOnlineShop && store.onlineShopUrl && (
              <a
                href={store.onlineShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Visit Online Shop
              </a>
            )}
          </div>

          {/* Location Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Location</h2>
            <p className="text-sm text-slate-600">
              {store.address}<br />
              {store.city}, {store.region}<br />
              {store.country} {store.postalCode}
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Open in Google Maps
            </a>
          </div>

          {/* Sports */}
          {store.sportTypes.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Sports</h2>
              <div className="flex flex-wrap gap-2">
                {store.sportTypes.map((sport) => (
                  <Link
                    key={sport}
                    href={`/search?sport=${sport}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {SPORT_ICONS[sport]} {SPORT_LABELS[sport]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {store.services.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Services</h2>
              <div className="flex flex-wrap gap-2">
                {store.services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
                  >
                    {SERVICE_LABELS[service]}
                  </span>
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
        <section className="mt-12 pt-12 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Nearby Stores</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((ns) => (
              <StoreCard key={ns.id} store={ns} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
