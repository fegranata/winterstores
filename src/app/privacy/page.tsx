import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "WinterStores privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: March 2026
      </p>

      <div className="mt-8 space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            1. Information We Collect
          </h2>
          <p className="mb-3">
            We collect information to provide and improve WinterStores. The types
            of information we collect include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account information:</strong> When you sign in with Google
              OAuth, we receive your name, email address, and profile picture
              from Google. We store this in your WinterStores profile.
            </li>
            <li>
              <strong>Reviews and contributions:</strong> Content you submit,
              including store reviews, ratings, and store suggestions.
            </li>
            <li>
              <strong>Usage data:</strong> We use Vercel Analytics to collect
              anonymized page view data and Web Vitals performance metrics. This
              data does not personally identify you.
            </li>
            <li>
              <strong>Favorites:</strong> Your saved favorite stores are stored
              locally in your browser (localStorage) and are not sent to our
              servers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To display your reviews and profile information</li>
            <li>To improve our directory and search results</li>
            <li>To aggregate ratings from multiple platforms (Google, Facebook, Foursquare)</li>
            <li>To analyze usage patterns and improve site performance</li>
            <li>To respond to your inquiries and store suggestions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            3. Third-Party Services
          </h2>
          <p className="mb-3">WinterStores integrates with the following services:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Supabase:</strong> Authentication and database hosting.
              See{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Supabase Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Google OAuth:</strong> For sign-in functionality. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Google Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel:</strong> Hosting and analytics. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Vercel Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Google Places, Facebook, Foursquare APIs:</strong>{" "}
              We fetch publicly available store ratings and review counts from
              these platforms. We do not share your personal data with them.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            4. Cookies &amp; Consent
          </h2>
          <p className="mb-3">
            When you first visit WinterStores, we show a cookie consent banner
            where you can accept or reject non-essential cookies. Your
            preferences are stored in your browser and can be changed at any
            time by clearing your browser&apos;s local storage. We use the
            following categories of cookies:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Essential:</strong> Required for authentication (Supabase
              session tokens) and core site functionality. These cannot be
              disabled.
            </li>
            <li>
              <strong>Analytics:</strong> We use Vercel Analytics which collects
              anonymized page view data and performance metrics without
              personally identifying you. Enabled only with your consent.
            </li>
            <li>
              <strong>Marketing:</strong> If advertising is enabled on the site,
              ad providers may use cookies for personalized ads. These are only
              loaded with your explicit consent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            5. Your Rights
          </h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Access your data:</strong> View your profile and reviews at
              any time from your{" "}
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                profile page
              </Link>
              .
            </li>
            <li>
              <strong>Update your data:</strong> Edit your display name and
              language preferences in profile settings.
            </li>
            <li>
              <strong>Delete your account:</strong> You can permanently delete
              your account from your profile settings. This anonymizes your
              reviews and removes your personal data.
            </li>
            <li>
              <strong>Request data export:</strong> Contact us to request an
              export of your data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            6. Data Security
          </h2>
          <p>
            We use industry-standard security measures including encrypted
            connections (HTTPS), secure authentication via OAuth 2.0, and
            database-level access controls through Supabase. However, no method
            of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            7. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            users of significant changes by updating the &ldquo;Last
            updated&rdquo; date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            8. Contact
          </h2>
          <p>
            If you have questions about this privacy policy, please{" "}
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
