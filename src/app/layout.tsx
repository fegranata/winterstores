import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/ui/Providers";
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
  metadataBase: new URL("https://winterstores.com"),
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
    canonical: "https://winterstores.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
