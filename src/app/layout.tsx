import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/ui/Providers";
import CookieConsent from "@/components/ui/CookieConsent";
import { AD_PROVIDER, ADSENSE_CLIENT, MEDIANET_CID, EZOIC_SITE_ID, INFOLINKS_PID } from "@/lib/ad-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WinterStores — Find Winter Sport Shops Near You",
    template: "%s — WinterStores",
  },
  description:
    "Discover and compare winter sport stores worldwide. Filter by sport type, distance, online shop availability, and find the best gear with our WinterStores Score.",
  keywords: [
    "winter sports",
    "ski shop",
    "snowboard store",
    "ski rental",
    "winter gear",
    "ski equipment",
  ],
  metadataBase: new URL("https://winterstores.co"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WinterStores",
    title: "WinterStores — Find & Compare Winter Sport Shops Near You",
    description:
      "Discover and compare 1,000+ winter sport stores across 21 countries. Aggregated ratings from Google, Facebook, and Foursquare. Filter by sport, services, and price.",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: "WinterStores" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WinterStores — Find & Compare Winter Sport Shops Near You",
    description:
      "Discover and compare 1,000+ winter sport stores across 21 countries. Aggregated ratings from Google, Facebook, and Foursquare. Filter by sport, services, and price.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Consent Mode v2 — deny all by default until user consents */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
        {AD_PROVIDER === "adsense" && ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {AD_PROVIDER === "medianet" && MEDIANET_CID && (
          <script
            async
            src={`https://contextual.media.net/dmedianet.js?cid=${MEDIANET_CID}`}
            crossOrigin="anonymous"
          />
        )}
        {AD_PROVIDER === "ezoic" && EZOIC_SITE_ID && (
          <script
            async
            src="https://cdn.ezoic.net/ezoic/sa.min.js"
            data-cfasync="false"
          />
        )}
        {AD_PROVIDER === "infolinks" && INFOLINKS_PID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `var infolinks_pid = ${INFOLINKS_PID}; var infolinks_wsid = 0;`,
              }}
            />
            <script async src="//resources.infolinks.com/js/infolinks_main.js" />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  );
}
