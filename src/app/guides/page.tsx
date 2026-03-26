import Link from "next/link";
import { GUIDES } from "@/lib/data/guides";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winter Sports Guides & Tips",
  description:
    "Practical guides for ski and snowboard enthusiasts. Learn how to choose rental shops, get the right boot fitting, and make smart gear decisions.",
  alternates: { canonical: "https://winterstores.co/guides" },
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
        ]}
      />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Guides</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Winter Sports Guides & Tips
      </h1>
      <p className="mt-2 text-slate-500">
        Practical advice for ski and snowboard enthusiasts — from choosing the
        right rental shop to getting the perfect boot fit.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {guide.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-slate-500 line-clamp-3">
              {guide.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <time dateTime={guide.publishedAt}>
                {new Date(guide.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{guide.sections.length} min read</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
    </div>
  );
}
