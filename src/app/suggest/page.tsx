import type { Metadata } from "next";
import SuggestStoreForm from "@/components/suggest/SuggestStoreForm";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Suggest a Store",
  description:
    "Know a winter sport store that's not listed on WinterStores? Suggest it and help grow our community directory.",
};

export default function SuggestPage() {
  return (
    <div>
      <PageHeader
        width="2xl"
        crumbs={[{ label: "Home", href: "/" }, { label: "Suggest a Store" }]}
        title="Suggest a Store"
        lede={
          <>
            Know a winter sport store that&apos;s not in our directory? Help the
            community by suggesting it below. We&apos;ll review your submission and
            add it if it meets our criteria.
          </>
        }
      />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8">
          <SuggestStoreForm />
        </div>
      </div>
    </div>
  );
}
