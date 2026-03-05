import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about WinterStores — the free directory helping you find and compare winter sport stores worldwide using our aggregated WinterStores Score.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        About WinterStores
      </h1>

      <div className="mt-8 space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Our Mission
          </h2>
          <p>
            WinterStores is a free, community-powered directory that helps you
            find and compare the best winter sport stores worldwide. Whether
            you&apos;re looking for a ski shop in the Alps, a snowboard rental
            in Colorado, or an ice skating store in Hokkaido, we&apos;ve got you
            covered.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            The WinterStores Score
          </h2>
          <p>
            Every store on our platform receives a WinterStores Score — an
            aggregated rating based on reviews from multiple trusted platforms
            including Google, Yelp, Facebook, and Foursquare. This gives you a
            single, reliable number to compare stores at a glance, rather than
            checking each platform individually.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            What You Can Do
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Search and filter stores by sport type, services, and location</li>
            <li>Compare ratings from Google, Yelp, Facebook, and Foursquare in one place</li>
            <li>Save your favorite stores for quick access</li>
            <li>Leave your own reviews to help the community</li>
            <li>Discover stores near popular ski resorts worldwide</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Community Powered
          </h2>
          <p>
            WinterStores grows with the help of its users. You can{" "}
            <Link
              href="/suggest"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              suggest a store
            </Link>{" "}
            that we haven&apos;t listed yet, leave reviews to share your
            experience, and report incorrect information so we can keep our
            directory accurate and up to date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Get in Touch
          </h2>
          <p>
            Have a question, feedback, or partnership inquiry? Visit our{" "}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              contact page
            </Link>{" "}
            to reach out.
          </p>
        </section>
      </div>
    </div>
  );
}
