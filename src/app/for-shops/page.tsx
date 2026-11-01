import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "For Shop Owners — Your Listing, Your Badge",
  description:
    "Your ski or snowboard shop is listed on WinterStores. Find your page, fix anything that's wrong, and add a 'Listed on WinterStores' badge to your website.",
  alternates: { canonical: "https://winterstores.co/for-shops" },
};

const BADGE_URL = "https://winterstores.co/badge/listed-on-winterstores.svg";

function embedSnippet(slug: string) {
  return `<a href="https://winterstores.co/store/${slug}" title="See our listing and reviews on WinterStores">
  <img src="${BADGE_URL}" alt="Listed on WinterStores" width="220" height="48" />
</a>`;
}

export default function ForShopsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "For Shops", href: "/for-shops" },
        ]}
      />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">For Shops</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Your shop is on WinterStores
      </h1>
      <p className="mt-3 text-lg text-slate-500">
        WinterStores lists 1,400+ ski and snowboard shops near 80+ resorts so
        skiers can compare them before a trip. Listing is free, permanent, and
        does not require an account. This page is for the people who run those
        shops.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">1. Find your page</h2>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Search for your shop by name or town. Every listing shows your
          address, website, services, and a score built from your public
          reviews — weighted by how many reviews you have, so an established
          shop with hundreds of reviews is never outranked by a handful of
          five-star ratings somewhere else.
        </p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Search for your shop
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">2. Fix what&apos;s wrong</h2>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Opening hours, services, website, a shop that moved or closed — use
          the <strong>Report</strong> link at the bottom of your listing and
          tell us what to change. Shops that do boot fitting, repairs, waxing
          or offer storage get those services shown as filters, which is how
          most visitors narrow their search. If yours are missing, say so.
        </p>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Not listed at all?{" "}
          <Link href="/suggest" className="text-blue-600 hover:underline">
            Suggest your shop
          </Link>{" "}
          — it takes a minute.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">3. Add the badge to your website</h2>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Many shops link to their review profiles. A{" "}
          <em>Listed on WinterStores</em> badge on your site lets visitors see
          your listing and how you compare with other shops at your resort.
          Paste the snippet below anywhere in your site&apos;s HTML (a footer,
          a sidebar, or your &ldquo;about&rdquo; page), replacing{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">your-shop-slug</code>{" "}
          with the last part of your listing&apos;s address.
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <img
            src={BADGE_URL}
            alt="Listed on WinterStores"
            width={220}
            height={48}
          />
        </div>

        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          <code>{embedSnippet("your-shop-slug")}</code>
        </pre>

        <p className="mt-3 text-sm text-slate-500">
          Example: a listing at{" "}
          <span className="font-mono">winterstores.co/store/matterhorn-sport-zermatt</span>{" "}
          uses <span className="font-mono">matterhorn-sport-zermatt</span> as
          the slug. The badge is a plain SVG image; it loads nothing else and
          tracks nothing.
        </p>
      </section>

      <section className="mt-10 rounded-xl bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-blue-900">Questions?</h2>
        <p className="mt-1 text-sm text-blue-800">
          Use the Report link on your listing, or the suggestion form — both
          reach a human. WinterStores is independent and ad-supported; shops
          never pay for placement and listings are never removed for not
          linking back.
        </p>
      </section>
    </div>
  );
}
