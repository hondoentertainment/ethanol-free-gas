import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { OnboardingModal } from "@/components/layout/OnboardingModal";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getSiteUrl();
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: {
    default: "Ethanol-Free Fuel Finder | E0 Gas Stations",
    template: "%s | E0 Finder",
  },
  description:
    "Find ethanol-free (E0) gasoline stations for boats, classic cars, and small engines across the US and Canada.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Ethanol-Free Fuel Finder",
    description:
      "Map of ethanol-free (E0) gas stations across North America.",
    url: siteUrl,
    siteName: "E0 Finder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethanol-Free Fuel Finder",
    description: "Find E0 gasoline stations near you.",
  },
  appleWebApp: {
    capable: true,
    title: "E0 Finder",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom for accessibility — do not cap maximumScale or disable zoom.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#fafafa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <OfflineBanner />
        <InstallPrompt />
        <OnboardingModal />
        <Header />
        <main className="flex flex-1 min-h-0 flex-col">{children}</main>
        <Footer />
        <ServiceWorkerRegistration />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
