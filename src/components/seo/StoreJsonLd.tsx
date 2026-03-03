import type { Store } from "@/types/store";

interface StoreJsonLdProps {
  store: Store;
}

export default function StoreJsonLd({ store }: StoreJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: store.name,
    description: store.description,
    url: store.website ?? undefined,
    telephone: store.phone ?? undefined,
    email: store.email ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressRegion: store.region,
      postalCode: store.postalCode,
      addressCountry: store.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.latitude,
      longitude: store.longitude,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: store.winterstoresScore,
      bestRating: 5,
      worstRating: 1,
      reviewCount: store.totalReviewCount,
    },
    priceRange: "$".repeat(store.priceLevel),
    ...(store.coverPhoto && { image: store.coverPhoto }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: store.country,
        item: `/search?country=${store.countryCode}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: store.name,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
