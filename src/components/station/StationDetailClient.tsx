"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ClassificationBadge } from "@/components/station/ClassificationBadge";
import { DirectionsLinks } from "@/components/station/DirectionsLinks";
import { PremiumBadge } from "@/components/station/PremiumBadge";
import { PhotoGallery, PhotoUpload } from "@/components/station/StationPhotos";
import { StationRatings } from "@/components/station/StationRatings";
import { VerificationBadge } from "@/components/station/VerificationBadge";
import { ShareStationButton } from "@/components/station/ShareStationButton";
import { VerificationForm } from "@/components/station/VerificationForm";
import { MOCK_STATIONS } from "@/lib/data/stations";
import type { StationWithMeta, Verification } from "@/lib/types/station";

interface StationPhoto {
  id: string;
  url: string;
}

export function StationDetailClient({ id }: { id: string }) {
  const mock = MOCK_STATIONS.find((s) => s.id === id);
  const [station, setStation] = useState<StationWithMeta | null>(mock ?? null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [photos, setPhotos] = useState<StationPhoto[]>([]);
  const [loading, setLoading] = useState(!mock);

  const loadStation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stations/${id}`);
      if (response.status === 404) {
        setStation(null);
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setStation(data.station);
        setVerifications(data.verifications ?? []);
        setPhotos(data.photos ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!mock) loadStation();
  }, [mock, loadStation]);

  if (loading) {
    return <p className="px-4 py-10 text-sm text-zinc-500">Loading station…</p>;
  }

  if (!station) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        href="/"
        className="text-sm font-medium text-sky-700 hover:text-sky-800"
      >
        ← Back to map
      </Link>

      <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900">{station.name}</h1>
          {station.submitted_by && (
            <Link
              href={`/station/${station.id}/edit`}
              className="shrink-0 text-sm font-medium text-sky-700 hover:text-sky-800"
            >
              Edit
            </Link>
          )}
        </div>
        <p className="mt-1 text-zinc-600">
          {station.address}, {station.city}, {station.state}{" "}
          {station.zip ?? ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <ClassificationBadge classification={station.classification} />
          <VerificationBadge
            label={station.verification_label}
            stale={station.verification_stale}
          />
          <PremiumBadge
            isPremium={station.is_premium}
            isSponsored={station.is_sponsored}
          />
        </div>

        <dl className="mt-6 grid gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Fuel type</dt>
            <dd className="font-medium text-zinc-900">
              {station.fuel_type} · {station.ethanol_percent}% ethanol
            </dd>
          </div>
          {station.phone && (
            <div>
              <dt className="text-zinc-500">Phone</dt>
              <dd>
                <a href={`tel:${station.phone}`} className="font-medium text-sky-700">
                  {station.phone}
                </a>
              </dd>
            </div>
          )}
          {station.hours && (
            <div>
              <dt className="text-zinc-500">Hours</dt>
              <dd className="font-medium text-zinc-900">
                {Object.entries(station.hours)
                  .map(([day, hours]) => `${day}: ${hours}`)
                  .join(" · ")}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <DirectionsLinks
            lat={station.lat}
            lng={station.lng}
            label={station.name}
          />
          <ShareStationButton stationId={station.id} stationName={station.name} />
        </div>

        <PhotoGallery photos={photos} />
        <PhotoUpload stationId={station.id} onUploaded={loadStation} />

        <div className="mt-6">
          <VerificationForm stationId={station.id} onVerified={loadStation} />
        </div>

        <StationRatings stationId={station.id} />

        {verifications.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent verifications
            </h2>
            <ul className="mt-3 space-y-2">
              {verifications.map((verification) => (
                <li
                  key={verification.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium capitalize text-zinc-800">
                    {verification.status.replace("_", " ")}
                  </span>
                  <span className="text-zinc-500">
                    {" "}
                    · {new Date(verification.created_at).toLocaleString()}
                  </span>
                  {verification.notes && (
                    <p className="mt-1 text-zinc-600">{verification.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
