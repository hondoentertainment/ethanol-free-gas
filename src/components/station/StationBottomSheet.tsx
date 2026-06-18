"use client";

import Link from "next/link";
import type { StationWithMeta } from "@/lib/types/station";
import { ClassificationBadge } from "./ClassificationBadge";
import { DirectionsLinks } from "./DirectionsLinks";
import { ListingStatusBadge, ListingStatusBanner } from "./ListingStatus";
import { PremiumBadge } from "./PremiumBadge";
import { ShareStationButton } from "./ShareStationButton";
import { VerificationBadge } from "./VerificationBadge";
import { VerificationForm } from "./VerificationForm";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function StationBottomSheet({
  station,
  onClose,
  onVerified,
}: {
  station: StationWithMeta | null;
  onClose: () => void;
  onVerified?: () => void;
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(Boolean(station), onClose);

  if (!station) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-3 pb-3">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="station-sheet-title"
        className="flex max-h-[min(75vh,640px)] flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10 animate-sheet-up"
      >
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="min-w-0">
            <h2
              id="station-sheet-title"
              className="text-lg font-semibold text-zinc-900"
            >
              {station.name}
            </h2>
            <p className="text-sm text-zinc-600">
              {station.address}, {station.city}, {station.state}{" "}
              {station.zip ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            aria-label="Close station details"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-4">
          <div className="flex flex-wrap gap-2">
          <ClassificationBadge classification={station.classification} />
          <ListingStatusBadge status={station.listing_status} />
          <VerificationBadge
            label={station.verification_label}
            stale={station.verification_stale}
          />
          <PremiumBadge
            isPremium={station.is_premium}
            isSponsored={station.is_sponsored}
          />
        </div>

        <div className="mt-3">
          <ListingStatusBanner
            status={station.listing_status}
            reportedAt={station.latest_report?.created_at}
          />
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Fuel</dt>
            <dd className="font-medium text-zinc-900">
              {station.fuel_type} ({station.ethanol_percent}% ethanol)
            </dd>
          </div>
          {station.phone && (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Phone</dt>
              <dd>
                <a
                  href={`tel:${station.phone}`}
                  className="font-medium text-sky-700"
                >
                  {station.phone}
                </a>
              </dd>
            </div>
          )}
          {station.distance_miles != null && (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Distance</dt>
              <dd className="font-medium text-zinc-900">
                {station.distance_miles.toFixed(1)} miles
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-700">Directions</p>
          <DirectionsLinks
            lat={station.lat}
            lng={station.lng}
            label={station.name}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/station/${station.id}`}
            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            View full details
          </Link>
          <ShareStationButton
            stationId={station.id}
            stationName={station.name}
          />
        </div>

        <div className="mt-4">
          <VerificationForm
            stationId={station.id}
            stationName={station.name}
            onVerified={onVerified}
          />
        </div>
        </div>
      </div>
    </div>
  );
}
