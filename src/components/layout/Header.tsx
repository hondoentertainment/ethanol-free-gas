import Link from "next/link";

export function Header() {
  return (
    <header className="z-20 flex items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm">
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
      <Link
        href="/auth/login"
        className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700"
      >
        Sign in
      </Link>
    </header>
  );
}
