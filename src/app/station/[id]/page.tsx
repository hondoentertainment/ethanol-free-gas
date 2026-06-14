import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassificationBadge } from "@/components/station/ClassificationBadge";
import { DirectionsLinks } from "@/components/station/DirectionsLinks";
import { VerificationBadge } from "@/components/station/VerificationBadge";
import { VerificationForm } from "@/components/station/VerificationForm";
import { enrichStation, MOCK_STATIONS } from "@/lib/data/stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Station, Verification } from "@/lib/types/station";

async function getStation(id: string) {
  const mock = MOCK_STATIONS.find((s) => s.id === id);
  if (mock) {
    return {
      station: mock,
      verifications: [] as Verification[],
      verification_label: mock.verification_label,
    };
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data: station, error } = await supabase
    .from("stations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !station) {
    return null;
  }

  const { data: verifications } = await supabase
    .from("verifications")
    .select("*")
    .eq("station_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const verificationRows = (verifications ?? []) as Verification[];
  const enriched = enrichStation(station as Station, verificationRows);

  return {
    station: enriched,
    verifications: verificationRows,
    verification_label: enriched.verification_label,
  };
}

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStation(id);

  if (!data) {
    notFound();
  }

  const { station, verifications, verification_label } = data;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        href="/"
        className="text-sm font-medium text-sky-700 hover:text-sky-800"
      >
        ← Back to map
      </Link>

      <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">{station.name}</h1>
        <p className="mt-1 text-zinc-600">
          {station.address}, {station.city}, {station.state}{" "}
          {station.zip ?? ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <ClassificationBadge classification={station.classification} />
          <VerificationBadge label={verification_label} />
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

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-zinc-700">Directions</p>
          <DirectionsLinks
            lat={station.lat}
            lng={station.lng}
            label={station.name}
          />
        </div>

        <div className="mt-6">
          <VerificationForm stationId={station.id} />
        </div>

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
