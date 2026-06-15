"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/leaderboard", label: "Leaders" },
  { href: "/alerts", label: "Alerts" },
  { href: "/states", label: "By state" },
  { href: "/about", label: "About" },
  { href: "/station/add", label: "Add station" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700"
        aria-expanded={open}
        aria-label="Menu"
      >
        Menu
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/20"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            className="absolute right-4 top-full z-40 mt-2 w-48 rounded-2xl border border-zinc-200 bg-white py-2 shadow-lg"
            aria-label="Mobile navigation"
          >
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
