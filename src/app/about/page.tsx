import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { CheckIcon } from "@/components/ui/Icons";

const FAQ_ITEMS = [
  {
    question: "What is the WinterStores Score?",
    answer:
      "The WinterStores Score condenses a store's aggregated reviews into one comparable number, weighted by review volume — so a 4.8 from a dozen reviews doesn't outrank a 4.4 from four hundred. It gives you a single, reliable number to compare winter sport stores at a glance.",
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
      "Ratings are refreshed on a rolling schedule, with every store's score periodically re-checked against its source platform so the numbers stay representative.",
  },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about WinterStores — the free directory helping you find and compare winter sport stores worldwide using our aggregated WinterStores Score.",
};

export default function AboutPage() {
  return (
    <div>
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
      <PageHeader
        width="3xl"
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title="About WinterStores"
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-12 text-[1.0625rem] text-slate-700 leading-relaxed">
        <section>
          <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-4">
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
          <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-4">
            The WinterStores Score
          </h2>
          <p>
            Every store on our platform receives a WinterStores Score — an
            aggregated rating that condenses the store&apos;s reviews into one
            number, weighted by review volume. This gives you a single,
            reliable number to compare stores at a glance, rather than
            weighing up each store&apos;s rating and review count yourself.
          </p>
        </section>

        <section>
          <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-4">
            What You Can Do
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Search and filter stores by sport type, services, and location",
              "Compare review-volume-weighted scores across 1,300+ stores",
              "Save your favorite stores for quick access",
              "Leave your own reviews to help the community",
              "Discover stores near popular ski resorts worldwide",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 card p-4 text-[0.9375rem]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <CheckIcon className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-4">
            Community Powered
          </h2>
          <p>
            WinterStores grows with the help of its users. You can{" "}
            <Link
              href="/suggest"
              className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-700"
            >
              suggest a store
            </Link>{" "}
            that we haven&apos;t listed yet, leave reviews to share your
            experience, and report incorrect information so we can keep our
            directory accurate and up to date.
          </p>
        </section>

        <section>
          <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-4">
            Frequently Asked Questions
          </h2>
          <dl className="divide-y divide-slate-200 border-y border-slate-200">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="py-5">
                <dt className="font-semibold text-ink-900">{item.question}</dt>
                <dd className="mt-2 text-slate-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl mb-4">
            Get in Touch
          </h2>
          <p>
            Have a question, feedback, or partnership inquiry? Visit our{" "}
            <Link
              href="/contact"
              className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-700"
            >
              contact page
            </Link>{" "}
            to reach out.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}
