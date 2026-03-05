import Link from "next/link";
import type { Metadata } from "next";
import SuggestStoreForm from "@/components/suggest/SuggestStoreForm";

export const metadata: Metadata = {
  title: "Suggest a Store",
  description:
    "Know a winter sport store that's not listed on WinterStores? Suggest it and help grow our community directory.",
};

export default function SuggestPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Suggest a Store</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Suggest a Store
      </h1>
      <p className="mt-2 text-slate-600">
        Know a winter sport store that&apos;s not in our directory? Help the
        community by suggesting it below. We&apos;ll review your submission and
        add it if it meets our criteria.
      </p>

      <div className="mt-8">
        <SuggestStoreForm />
      </div>
    </div>
  );
}
