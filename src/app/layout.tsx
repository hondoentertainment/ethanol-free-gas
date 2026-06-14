import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethanol-Free Fuel Finder",
  description:
    "Find ethanol-free (E0) gasoline stations for boats, classic cars, and small engines across the US and Canada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <Header />
        <main className="flex flex-1 min-h-0 flex-col">{children}</main>
      </body>
    </html>
  );
}
