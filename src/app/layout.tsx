import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/ui/Providers";
import CookieConsent from "@/components/ui/CookieConsent";
import "./globals.css";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

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
    title: "WinterStores — Find Winter Sport Shops Near You",
    description:
      "Discover and compare winter sport stores worldwide. Filter by sport, distance, and services.",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: "WinterStores" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WinterStores — Find Winter Sport Shops Near You",
    description:
      "Discover and compare winter sport stores worldwide. Filter by sport, distance, and services.",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://winterstores.co",
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
        {ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
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
