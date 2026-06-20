import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-5xl font-bold text-sky-600">404</p>
        <h1 className="mt-3 text-xl font-semibold text-zinc-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          We couldn&apos;t find that page. It may have moved, or the station may
          no longer be listed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Back to map
          </Link>
          <Link
            href="/states"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Browse by state
          </Link>
        </div>
      </div>
    </div>
  );
}
