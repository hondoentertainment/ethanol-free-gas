"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/docs", label: "Help" },
  { href: "/leaderboard", label: "Leaders" },
  { href: "/alerts", label: "Alerts" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden items-center gap-1 sm:flex"
      aria-label="Primary navigation"
    >
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              active
                ? "bg-sky-50 text-sky-700"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/station/add"
        className="ml-1 inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <span aria-hidden="true">+</span> Add station
      </Link>
    </nav>
  );
}
