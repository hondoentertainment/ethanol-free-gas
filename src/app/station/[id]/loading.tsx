export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
