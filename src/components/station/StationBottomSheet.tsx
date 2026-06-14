"use client";

import { useState } from "react";
import type { StationWithMeta, VerificationStatus } from "@/lib/types/station";
import { ClassificationBadge } from "./ClassificationBadge";
import { DirectionsLinks } from "./DirectionsLinks";
import { VerificationBadge } from "./VerificationBadge";

export function StationBottomSheet({
  station,
  onClose,
  onVerified,
}: {
  station: StationWithMeta | null;
  onClose: () => void;
  onVerified?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!station) return null;

  async function submitVerification(status: VerificationStatus) {
    if (!station) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ station_id: station.id, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to submit verification");
      }

      setMessage("Thanks — your update was recorded.");
      onVerified?.();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-3 pb-3">
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-900/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-900">
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
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
            aria-label="Close station details"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <ClassificationBadge classification={station.classification} />
          <VerificationBadge label={station.verification_label} />
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

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-700">
            Report availability
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitVerification("available")}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Fuel available
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitVerification("unavailable")}
              className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Out of E0
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitVerification("incorrect")}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Wrong info
            </button>
          </div>
          {message && (
            <p className="mt-2 text-sm text-zinc-600" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
