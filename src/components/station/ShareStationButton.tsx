"use client";

import { useState } from "react";

export function ShareStationButton({
  stationId,
  stationName,
}: {
  stationId: string;
  stationName: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/station/${stationId}`
      : `/station/${stationId}`;

  async function share() {
    setMessage(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${stationName} — E0 fuel`,
          text: `Ethanol-free gas at ${stationName}`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("Link copied!");
    } catch {
      setMessage("Could not share");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={share}
        className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Share station
      </button>
      {message && (
        <p className="mt-1 text-xs text-zinc-500" role="status">{message}</p>
      )}
    </div>
  );
}
