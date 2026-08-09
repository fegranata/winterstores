import { notFound } from "next/navigation";
import { getUniqueCountries } from "@/lib/store-search";
import CountryBrowse, { getCountryPageData } from "@/components/browse/CountryBrowse";
import type { Metadata } from "next";

export const revalidate = 86400;

// Prerendering these was previously impossible: each page rendered every store
// in the country (327 for the US, 1.1MB of HTML) and blew the build's per-page
// timeout. Now that the list is paginated and the country queries use the
// country_code index instead of a sequential scan, they build cheaply — which
// in turn lets dynamicParams close the soft-404 hole, where an unknown country
// slug answered 200 with a "Country Not Found" body.
export const dynamicParams = false;

export async function generateStaticParams() {
  const countries = await getUniqueCountries();
  return countries.map((c) => ({ country: c.countryCode.toLowerCase() }));
}

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country: code } = await params;
  const data = await getCountryPageData(code, 1);
  if (!data) return { title: "Country Not Found" };

  const { countryInfo } = data;
  return {
    title: `Winter Sport Stores in ${countryInfo.country}`,
    description: `Find ${countryInfo.count} winter sport stores in ${countryInfo.country}. Compare WinterStores Scores, filter by sport type, and find the best gear shops.`,
    alternates: { canonical: `https://winterstores.co/browse/${code.toLowerCase()}` },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country: code } = await params;
  const data = await getCountryPageData(code, 1);
  if (!data) notFound();

  return <CountryBrowse code={code} page={1} />;
}
