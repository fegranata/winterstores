import type { Resort } from "@/lib/data/resorts";

const BASE_URL = "https://winterstores.co";

interface Props {
  resort: Resort;
  storeCount: number;
}

export default function ResortJsonLd({ resort, storeCount }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: resort.name,
    description: `Ski resort in ${resort.region}, ${resort.country}. ${storeCount} winter sport stores nearby.`,
    url: `${BASE_URL}/resorts/${resort.slug}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: resort.lat,
      longitude: resort.lng,
    },
    containedInPlace: {
      "@type": "Country",
      name: resort.country,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
