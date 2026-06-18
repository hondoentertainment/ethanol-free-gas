"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const LINKS = [
  { href: "/docs", label: "Help" },
  { href: "/guides", label: "Guides" },
  { href: "/leaderboard", label: "Leaders" },
  { href: "/alerts", label: "Alerts" },
  { href: "/states", label: "By state" },
  { href: "/about", label: "About" },
  { href: "/station/add", label: "Add station" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), []);
  const menuRef = useFocusTrap<HTMLDivElement>(open, close);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu"
      >
        <span aria-hidden="true">☰</span>
        Menu
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/20 animate-fade-in"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            ref={menuRef}
            role="menu"
            aria-label="Mobile navigation"
            className="absolute right-4 top-full z-40 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white py-2 shadow-lg animate-sheet-up"
          >
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  onClick={close}
                  className={`block px-4 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-sky-50 text-sky-700"
                      : "text-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
