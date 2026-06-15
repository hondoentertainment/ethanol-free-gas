"use client";

import type { StationWithMeta } from "@/lib/types/station";
import { StationCard } from "@/components/station/StationCard";

export function StationListDrawer({
  open,
  onClose,
  stations,
  selectedId,
  onSelectStation,
  title,
}: {
  open: boolean;
  onClose: () => void;
  stations: StationWithMeta[];
  selectedId: string | null;
  onSelectStation: (station: StationWithMeta) => void;
  title: string;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-3 pb-3">
      <div
        className="flex max-h-[min(55vh,520px)] flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15"
        role="dialog"
        aria-label="Station list"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{title}</p>
            <p className="text-xs text-zinc-500">
              {stations.length} station{stations.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
            aria-label="Close list"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-3 grid gap-2">
          {stations.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              No stations match your filters.
            </p>
          ) : (
            stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                selected={selectedId === station.id}
                onSelect={() => onSelectStation(station)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
