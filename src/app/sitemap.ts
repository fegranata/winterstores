import type { MetadataRoute } from "next";
import { RESORTS } from "@/lib/data/resorts";
import { GUIDES } from "@/lib/data/guides";
import { isGhostStore } from "@/lib/store-quality";
import { COUNTRY_PAGE_SIZE } from "@/components/browse/CountryBrowse";

// Shorter TTL than the page routes: the catch below degrades to a partial
// sitemap if the DB is briefly unavailable, so limit how long that can stick.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://winterstores.co";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/resorts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/best-ski-shops`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const resortPages: MetadataRoute.Sitemap = RESORTS.map((r) => ({
    url: `${baseUrl}/resorts/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified: new Date(g.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  try {
    const { getDb, schema } = await import("@/lib/db");
    const db = getDb();

    const allStores = await db
      .select({
        slug: schema.storesTable.slug,
        updatedAt: schema.storesTable.updatedAt,
        website: schema.storesTable.website,
        totalReviewCount: schema.storesTable.totalReviewCount,
        countryCode: schema.storesTable.countryCode,
      })
      .from(schema.storesTable);

    // Keep the sitemap consistent with the noindex on those same pages —
    // advertising a URL we tell Google not to index wastes crawl budget.
    const stores = allStores.filter((s) => !isGhostStore(s));

    const countries = await db
      .selectDistinct({ countryCode: schema.storesTable.countryCode })
      .from(schema.storesTable);

    const storePages: MetadataRoute.Sitemap = stores.map((s) => ({
      url: `${baseUrl}/store/${s.slug}`,
      lastModified: s.updatedAt instanceof Date ? s.updatedAt : new Date(s.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Browse pages, including pagination — each paginated page lists a distinct
    // set of stores, so leaving them out would hide most listings from crawlers
    // that don't follow the pager.
    const storeCountByCountry = new Map<string, number>();
    for (const s of allStores) {
      if (isGhostStore(s)) continue;
      const key = s.countryCode.toLowerCase();
      storeCountByCountry.set(key, (storeCountByCountry.get(key) ?? 0) + 1);
    }

    const countryPages: MetadataRoute.Sitemap = countries.flatMap((c) => {
      const code = c.countryCode.toLowerCase();
      const totalPages = Math.max(
        1,
        Math.ceil((storeCountByCountry.get(code) ?? 0) / COUNTRY_PAGE_SIZE)
      );

      return Array.from({ length: totalPages }, (_, i) => ({
        url: i === 0 ? `${baseUrl}/browse/${code}` : `${baseUrl}/browse/${code}/${i + 1}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: i === 0 ? 0.6 : 0.4,
      }));
    });

    const bestShopsPages: MetadataRoute.Sitemap = countries.map((c) => ({
      url: `${baseUrl}/best-ski-shops/${c.countryCode.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...resortPages, ...guidePages, ...bestShopsPages, ...storePages, ...countryPages];
  } catch {
    // DB not available (e.g. build without DATABASE_URL) — return static pages only
    return [...staticPages, ...resortPages, ...guidePages];
  }
}
