import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

const FAQ_ITEMS = [
  {
    question: "What is the WinterStores Score?",
    answer:
      "The WinterStores Score is an aggregated rating we calculate from multiple review platforms including Google, Facebook, and Foursquare. It gives you a single, reliable number to compare winter sport stores at a glance.",
  },
  {
    question: "Is WinterStores free to use?",
    answer:
      "Yes, WinterStores is completely free. You can search, compare, and review stores without any cost. We are a community-powered directory that aims to help winter sport enthusiasts find the best gear shops worldwide.",
  },
  {
    question: "What sports are covered?",
    answer:
      "WinterStores covers a wide range of winter sports including skiing, snowboarding, cross-country skiing, ice skating, sledding, and snowshoeing. You can filter stores by sport type to find exactly what you need.",
  },
  {
    question: "How can I suggest a store that is not listed?",
    answer:
      "Visit our Suggest a Store page and fill out the form with the store details. Our team reviews every submission and adds qualifying stores to the directory.",
  },
  {
    question: "How often are ratings updated?",
    answer:
      "We refresh ratings from external platforms regularly — Google ratings update every 30 minutes, Facebook every 6 hours, and Foursquare every 12 hours to keep scores current.",
  },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about WinterStores — the free directory helping you find and compare winter sport stores worldwide using our aggregated WinterStores Score.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
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
            including Google, Facebook, and Foursquare. This gives you a
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
            <li>Compare ratings from Google, Facebook, and Foursquare in one place</li>
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
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-slate-900">{item.question}</dt>
                <dd className="mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
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
