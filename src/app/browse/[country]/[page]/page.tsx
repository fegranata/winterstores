import { notFound } from "next/navigation";
import { getStoresByCountry, getUniqueCountries } from "@/lib/store-search";
import CountryBrowse, {
  COUNTRY_PAGE_SIZE,
  getCountryPageData,
} from "@/components/browse/CountryBrowse";
import type { Metadata } from "next";

export const revalidate = 86400;
export const dynamicParams = false;

/**
 * Pages 2+ only — page 1 lives at /browse/[country]. Enumerating them here
 * means every store stays exactly one internal link from a browse page, which
 * a top-N cap on page 1 would have broken.
 */
export async function generateStaticParams() {
  const countries = await getUniqueCountries();

  const params = await Promise.all(
    countries.map(async (c) => {
      const stores = await getStoresByCountry(c.countryCode);
      const totalPages = Math.ceil(stores.length / COUNTRY_PAGE_SIZE);
      return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        country: c.countryCode.toLowerCase(),
        page: String(i + 2),
      }));
    })
  );

  return params.flat();
}

interface PagedCountryProps {
  params: Promise<{ country: string; page: string }>;
}

/** Rejects "01", "2.5", "-1" and similar so only canonical page URLs resolve. */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  return Number(raw);
}

export async function generateMetadata({ params }: PagedCountryProps): Promise<Metadata> {
  const { country: code, page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (page === null) return { title: "Not Found" };

  const data = await getCountryPageData(code, page);
  if (!data) return { title: "Not Found" };

  const { countryInfo, totalPages } = data;
  return {
    title: `Winter Sport Stores in ${countryInfo.country} — Page ${page} of ${totalPages}`,
    description: `Page ${page} of winter sport stores in ${countryInfo.country}, ranked by WinterStores Score.`,
    // Self-canonical: each page carries a distinct set of stores, so pointing
    // them all at page 1 would hide most of the listings from Google.
    alternates: {
      canonical: `https://winterstores.co/browse/${code.toLowerCase()}/${page}`,
    },
  };
}

export default async function PagedCountryPage({ params }: PagedCountryProps) {
  const { country: code, page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (page === null || page === 1) notFound(); // page 1 canonically lives at /browse/[country]

  const data = await getCountryPageData(code, page);
  if (!data) notFound();

  return <CountryBrowse code={code} page={page} />;
}
