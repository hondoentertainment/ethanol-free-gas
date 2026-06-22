import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600">
          <Link href="/docs" className="hover:text-zinc-900">Help</Link>
          <Link href="/guides" className="hover:text-zinc-900">Guides</Link>
          <Link href="/about" className="hover:text-zinc-900">About</Link>
          <Link href="/states" className="hover:text-zinc-900">By state</Link>
          <Link href="/sitemap.xml" className="hover:text-zinc-900">Sitemap</Link>
          <Link href="/leaderboard" className="hover:text-zinc-900">Leaders</Link>
          <Link href="/developers" className="hover:text-zinc-900">API</Link>
          <Link href="/premium" className="hover:text-zinc-900">Premium listings</Link>
          <a
            href="https://www.pure-gas.org/"
            className="hover:text-zinc-900"
            rel="noopener noreferrer"
            target="_blank"
          >
            pure-gas.org
          </a>
        </nav>
        <p className="text-xs text-zinc-500">E0 Finder · Ethanol-free fuel map</p>
      </div>
      <div className="mx-auto mt-3 max-w-4xl">
        <AdSlot placement="footer" />
      </div>
    </footer>
  );
}
