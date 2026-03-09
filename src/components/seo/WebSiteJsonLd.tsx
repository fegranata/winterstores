const BASE_URL = "https://winterstores.vercel.app";

export default function WebSiteJsonLd() {
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WinterStores",
    url: BASE_URL,
    description:
      "Discover and compare winter sport stores worldwide. Filter by sport type, distance, online shop availability, and find the best gear with our WinterStores Score.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WinterStores",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    description:
      "WinterStores is a free, community-powered directory that helps you find and compare winter sport stores worldwide using aggregated ratings from Google, Yelp, Facebook, and Foursquare.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${BASE_URL}/contact`,
    },
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
