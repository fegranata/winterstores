import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { CodeIcon, PenIcon, SearchIcon } from "@/components/ui/Icons";

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
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "For Shops", href: "/for-shops" },
        ]}
      />

      <PageHeader
        width="3xl"
        crumbs={[{ label: "Home", href: "/" }, { label: "For Shops" }]}
        title="Your shop is on WinterStores"
        lede={
          <>
            WinterStores lists 1,400+ ski and snowboard shops near 80+ resorts so
            skiers can compare them before a trip. Listing is free, permanent, and
            does not require an account. This page is for the people who run those
            shops.
          </>
        }
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <ol className="space-y-6">
      <li className="card p-6 sm:p-8">
      <section>
        <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <SearchIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
        <h2 className="heading-display text-2xl text-ink-900">1. Find your page</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Search for your shop by name or town. Every listing shows your
          address, website, services, and a score built from your public
          reviews — weighted by how many reviews you have, so an established
          shop with hundreds of reviews is never outranked by a handful of
          five-star ratings somewhere else.
        </p>
        <Link
          href="/search"
          className="mt-5 btn-primary"
        >
          Search for your shop
        </Link>
        </div>
        </div>
      </section>
      </li>

      <li className="card p-6 sm:p-8">
      <section>
        <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <PenIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
        <h2 className="heading-display text-2xl text-ink-900">2. Fix what&apos;s wrong</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Opening hours, services, website, a shop that moved or closed — use
          the <strong>Report</strong> link at the bottom of your listing and
          tell us what to change. Shops that do boot fitting, repairs, waxing
          or offer storage get those services shown as filters, which is how
          most visitors narrow their search. If yours are missing, say so.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Not listed at all?{" "}
          <Link href="/suggest" className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-700">
            Suggest your shop
          </Link>{" "}
          — it takes a minute.
        </p>
        </div>
        </div>
      </section>
      </li>

      <li className="card p-6 sm:p-8">
      <section>
        <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <CodeIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
        <h2 className="heading-display text-2xl text-ink-900">3. Add the badge to your website</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Many shops link to their review profiles. A{" "}
          <em>Listed on WinterStores</em> badge on your site lets visitors see
          your listing and how you compare with other shops at your resort.
          Paste the snippet below anywhere in your site&apos;s HTML (a footer,
          a sidebar, or your &ldquo;about&rdquo; page), replacing{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">your-shop-slug</code>{" "}
          with the last part of your listing&apos;s address.
        </p>

        <div className="mt-5 flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <img
            src={BADGE_URL}
            alt="Listed on WinterStores"
            width={220}
            height={48}
          />
        </div>

        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink-950 p-4 text-xs leading-relaxed text-slate-100 ring-1 ring-white/10">
          <code>{embedSnippet("your-shop-slug")}</code>
        </pre>

        <p className="mt-3 text-sm text-slate-500">
          Example: a listing at{" "}
          <span className="font-mono">winterstores.co/store/matterhorn-sport-zermatt</span>{" "}
          uses <span className="font-mono">matterhorn-sport-zermatt</span> as
          the slug. The badge is a plain SVG image; it loads nothing else and
          tracks nothing.
        </p>
        </div>
        </div>
      </section>
      </li>
      </ol>

      <section className="mt-10 rounded-2xl bg-ink-900 bg-contours p-6 sm:p-8">
        <h2 className="heading-display text-2xl text-white">Questions?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Use the Report link on your listing, or the suggestion form — both
          reach a human. WinterStores is independent and ad-supported; shops
          never pay for placement and listings are never removed for not
          linking back.
        </p>
      </section>
      </div>
    </div>
  );
}
