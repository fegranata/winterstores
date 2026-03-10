import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://winterstores.co";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/favorites`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.3 },
  ];

  try {
    const { getDb, schema } = await import("@/lib/db");
    const db = getDb();

    const stores = await db
      .select({
        slug: schema.storesTable.slug,
        updatedAt: schema.storesTable.updatedAt,
      })
      .from(schema.storesTable);

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

    return [...staticPages, ...storePages, ...countryPages];
  } catch {
    // DB not available (e.g. build without DATABASE_URL) — return static pages only
    return staticPages;
  }
}
