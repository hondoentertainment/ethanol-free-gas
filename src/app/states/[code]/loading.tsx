export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-xl bg-zinc-100"
          />
        ))}
      </div>
    </div>
  );
}
