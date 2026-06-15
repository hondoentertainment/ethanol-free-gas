"use client";

export function AdSlot({ placement }: { placement: "list" | "footer" }) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    if (placement === "footer") return null;
    return (
      <div
        className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs text-zinc-500"
        aria-hidden="true"
      >
        Local ad space — marinas, boat dealers, repair shops
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={placement === "list" ? "0000000001" : "0000000002"}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
