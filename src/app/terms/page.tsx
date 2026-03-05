import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "WinterStores terms of service — rules and guidelines for using our winter sport store directory.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Terms of Service</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: March 2026
      </p>

      <div className="mt-8 space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using WinterStores, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not
            use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            2. Description of Service
          </h2>
          <p>
            WinterStores is a free online directory that helps users discover,
            compare, and review winter sport stores worldwide. We aggregate
            publicly available information from third-party platforms (Google,
            Yelp, Facebook, Foursquare) and combine it with user-generated
            reviews to provide a comprehensive view of each store.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            3. User Accounts
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              You may sign in using Google OAuth. You are responsible for
              maintaining the security of your account.
            </li>
            <li>
              You must provide accurate information and not impersonate others.
            </li>
            <li>
              You may delete your account at any time from your{" "}
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                profile settings
              </Link>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            4. User-Generated Content
          </h2>
          <p className="mb-3">
            When you submit reviews, ratings, or store suggestions, you agree
            that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your content is truthful and based on genuine experience</li>
            <li>
              You will not post defamatory, abusive, hateful, or discriminatory
              content
            </li>
            <li>You will not submit spam, fake reviews, or misleading information</li>
            <li>
              You grant WinterStores a non-exclusive, worldwide license to
              display your content on the platform
            </li>
            <li>
              If you delete your account, your reviews will be anonymized (the
              content remains but is no longer associated with your profile)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            5. Store Listings
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Store information is compiled from public sources and user
              contributions. While we strive for accuracy, we cannot guarantee
              that all details (hours, prices, services) are current.
            </li>
            <li>
              The WinterStores Score is an aggregated metric and should be used
              as a general guide, not a definitive ranking.
            </li>
            <li>
              If you are a store owner and want to correct or update your
              listing, please{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                contact us
              </Link>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            6. Prohibited Conduct
          </h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use automated tools to scrape or collect data from the site</li>
            <li>Attempt to disrupt or interfere with the service</li>
            <li>Create multiple accounts to manipulate reviews or ratings</li>
            <li>Use the service for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            7. Intellectual Property
          </h2>
          <p>
            The WinterStores name, logo, and original content are our
            intellectual property. Store data aggregated from third-party
            platforms remains subject to those platforms&apos; respective terms
            of service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            8. Disclaimer of Warranties
          </h2>
          <p>
            WinterStores is provided &ldquo;as is&rdquo; without warranties of
            any kind. We do not guarantee the accuracy, completeness, or
            reliability of any store listing, rating, or review. Use the
            information at your own discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            9. Limitation of Liability
          </h2>
          <p>
            WinterStores shall not be liable for any direct, indirect,
            incidental, or consequential damages arising from your use of the
            service, including but not limited to reliance on store information,
            ratings, or reviews.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            10. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            11. Contact
          </h2>
          <p>
            If you have questions about these terms, please{" "}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
