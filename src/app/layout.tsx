import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { AdSlot } from "@/components/ads/AdSlot";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethanol-Free Fuel Finder",
  description:
    "Find ethanol-free (E0) gasoline stations for boats, classic cars, and small engines across the US and Canada.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "E0 Finder",
    statusBarStyle: "default",
  },
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
        <Header />
        <main className="flex flex-1 min-h-0 flex-col">{children}</main>
        <footer className="border-t border-zinc-200 bg-white px-4 py-3">
          <AdSlot placement="footer" />
        </footer>
        <ServiceWorkerRegistration />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
