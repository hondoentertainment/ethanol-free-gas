import Link from "next/link";
import { HeaderAuth } from "./HeaderAuth";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="min-w-0">
        <Link href="/" className="block">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
            E0 Finder
          </p>
          <h1 className="truncate text-base font-semibold text-zinc-900">
            Ethanol-Free Fuel
          </h1>
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <MobileNav />
        <Link
          href="/guides"
          className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:inline"
        >
          Guides
        </Link>
        <Link
          href="/leaderboard"
          className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:inline"
        >
          Leaders
        </Link>
        <Link
          href="/alerts"
          className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:inline"
        >
          Alerts
        </Link>
        <Link
          href="/station/add"
          className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:inline"
        >
          Add station
        </Link>
        <NotificationBell />
        <HeaderAuth />
      </div>
    </header>
  );
}
