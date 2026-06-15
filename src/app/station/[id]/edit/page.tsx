import Link from "next/link";
import { notFound } from "next/navigation";
import { EditStationForm } from "@/components/station/EditStationForm";
import { enrichStation, MOCK_STATIONS } from "@/lib/data/stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Station } from "@/lib/types/station";

async function getStation(id: string) {
  const mock = MOCK_STATIONS.find((s) => s.id === id);
  if (mock) return mock;

  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: station } = await supabase
    .from("stations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!station) return null;
  return enrichStation(station as Station, []);
}

export default async function EditStationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const station = await getStation(id);

  if (!station) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        href={`/station/${id}`}
        className="text-sm font-medium text-sky-700 hover:text-sky-800"
      >
        ← Back to station
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Edit station</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Update listing details for {station.name}.
      </p>
      <div className="mt-6">
        <EditStationForm station={station} />
      </div>
    </div>
  );
}
