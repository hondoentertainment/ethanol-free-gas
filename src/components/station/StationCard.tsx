import Link from "next/link";
import type { StationWithMeta } from "@/lib/types/station";
import { ClassificationBadge } from "./ClassificationBadge";
import { ListingStatusBadge } from "./ListingStatus";
import { PremiumBadge } from "./PremiumBadge";
import { VerificationBadge } from "./VerificationBadge";

export function StationCard({
  station,
  selected,
  onSelect,
}: {
  station: StationWithMeta;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-sky-400 bg-sky-50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900">{station.name}</p>
          <p className="truncate text-sm text-zinc-600">
            {station.address}, {station.city}, {station.state}
          </p>
        </div>
        {station.distance_miles != null && (
          <span className="shrink-0 text-sm font-medium text-zinc-500">
            {station.distance_miles.toFixed(1)} mi
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ClassificationBadge classification={station.classification} />
        <ListingStatusBadge status={station.listing_status ?? "unknown"} />
        <VerificationBadge
          label={station.verification_label}
          stale={station.verification_stale}
        />
        <PremiumBadge
          isPremium={station.is_premium}
          isSponsored={station.is_sponsored}
        />
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        {station.fuel_type} · {station.ethanol_percent}% ethanol
        {station.distance_from_route_miles != null && (
          <> · {station.distance_from_route_miles.toFixed(1)} mi from route</>
        )}
      </p>
      <Link
        href={`/station/${station.id}`}
        className="mt-3 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
        onClick={(e) => e.stopPropagation()}
      >
        View details →
      </Link>
    </button>
  );
}
