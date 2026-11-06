import Link from "next/link";
import { GUIDES } from "@/lib/data/guides";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowRightIcon, BookIcon, ClockIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Winter Sports Guides & Tips",
  description:
    "Practical guides for ski and snowboard enthusiasts. Learn how to choose rental shops, get the right boot fitting, and make smart gear decisions.",
  alternates: { canonical: "https://winterstores.co/guides" },
};

export default function GuidesPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
        ]}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        title="Winter Sports Guides & Tips"
        lede={
          <>
            Practical advice for ski and snowboard enthusiasts — from choosing the
            right rental shop to getting the perfect boot fit.
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {GUIDES.map((guide, i) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className={`group flex flex-col card card-hover p-6 ${i === 0 ? "sm:col-span-2 lg:p-8" : ""}`}
          >
            <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-glow-50 text-glow-700">
              <BookIcon className="h-5 w-5" />
            </span>
            <h2 className={`font-display font-semibold leading-snug text-ink-900 group-hover:text-blue-700 transition-colors ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>
              {guide.title}
            </h2>
            <p className={`mt-3 flex-1 text-slate-500 line-clamp-3 ${i === 0 ? "text-base" : "text-sm"}`}>
              {guide.description}
            </p>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <time dateTime={guide.publishedAt}>
                {new Date(guide.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {guide.sections.length} min read
              </span>
              <ArrowRightIcon className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
      </div>
    </div>
  );
}
