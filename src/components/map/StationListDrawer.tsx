"use client";

import type { StationWithMeta } from "@/lib/types/station";
import { AdSlot } from "@/components/ads/AdSlot";
import { StationCard } from "@/components/station/StationCard";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function StationListDrawer({
  open,
  onClose,
  stations,
  selectedId,
  onSelectStation,
  title,
  onClearFilters,
  hasActiveFilters,
}: {
  open: boolean;
  onClose: () => void;
  stations: StationWithMeta[];
  selectedId: string | null;
  onSelectStation: (station: StationWithMeta) => void;
  title: string;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-3 pb-3">
      <div
        ref={dialogRef}
        className="flex max-h-[min(55vh,520px)] flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15 animate-sheet-up"
        role="dialog"
        aria-modal="true"
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
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            aria-label="Close list"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="grid gap-2 overflow-y-auto p-3">
          {stations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-zinc-500">
                No stations match your filters.
              </p>
              {hasActiveFilters && onClearFilters && (
                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            stations.map((station, index) => (
              <div key={station.id}>
                <StationCard
                  station={station}
                  selected={selectedId === station.id}
                  onSelect={() => onSelectStation(station)}
                />
                {index === 2 && (
                  <div className="mt-2">
                    <AdSlot placement="list" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
