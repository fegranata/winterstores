import type { MetadataRoute } from "next";
import { RESORTS } from "@/lib/data/resorts";
import { GUIDES } from "@/lib/data/guides";
import { isGhostStore } from "@/lib/store-quality";

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

    const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
      url: `${baseUrl}/browse/${c.countryCode.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

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
