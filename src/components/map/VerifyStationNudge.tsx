"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/hooks/useUser";
import type { StationWithMeta } from "@/lib/types/station";
import { haversineMiles } from "@/lib/utils/geo";
import { isNegativeListingStatus } from "@/lib/utils/listing-status";

export const VERIFICATION_ONBOARDING_GOAL = 5;
const DISMISS_KEY = "e0-verify-nudge-dismissed";
const MAX_DISTANCE_MILES = 25;

function findNearestStaleStation(
  stations: StationWithMeta[],
  location: { lat: number; lng: number }
): StationWithMeta | null {
  let best: StationWithMeta | null = null;
  let bestDist = Infinity;

  for (const station of stations) {
    if (isNegativeListingStatus(station.listing_status ?? "unknown")) continue;
    if (!station.verification_stale && station.listing_status !== "unknown") {
      continue;
    }

    const dist = haversineMiles(
      location.lat,
      location.lng,
      station.lat,
      station.lng
    );
    if (dist <= MAX_DISTANCE_MILES && dist < bestDist) {
      best = station;
      bestDist = dist;
    }
  }

  return best;
}

export function VerifyStationNudge({
  stations,
  userLocation,
  verificationCount,
}: {
  stations: StationWithMeta[];
  userLocation: { lat: number; lng: number } | null;
  verificationCount: number | null;
}) {
  const { user } = useUser();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const until = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    setDismissed(Date.now() < until);
  }, []);

  const target = useMemo(() => {
    if (!userLocation) return null;
    return findNearestStaleStation(stations, userLocation);
  }, [stations, userLocation]);

  if (
    !user ||
    dismissed ||
    verificationCount == null ||
    verificationCount >= VERIFICATION_ONBOARDING_GOAL ||
    !target
  ) {
    return null;
  }

  const distance =
    userLocation &&
    haversineMiles(userLocation.lat, userLocation.lng, target.lat, target.lng);

  function dismiss() {
    const until = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
    setDismissed(true);
  }

  const remaining = VERIFICATION_ONBOARDING_GOAL - verificationCount;

  return (
    <div
      className="pointer-events-auto rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 shadow-lg ring-1 ring-orange-100"
      role="status"
    >
      <p className="text-sm font-semibold text-orange-950">
        Help verify E0 near you
      </p>
      <p className="mt-1 text-xs text-orange-900">
        {target.name}
        {distance != null && ` · ${distance.toFixed(1)} mi away`} needs a
        community check. {remaining} more verification
        {remaining === 1 ? "" : "s"} unlocks contributor progress.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={`/station/${target.id}`}
          className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
        >
          Verify this station
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-orange-800 hover:bg-orange-100"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
