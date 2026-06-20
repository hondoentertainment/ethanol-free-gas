import { enrichStation, MOCK_STATIONS } from "@/lib/data/stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Station, StationWithMeta, Verification } from "@/lib/types/station";

export interface StationPhoto {
  id: string;
  url: string;
  created_at?: string;
}

export interface StationDetail {
  station: StationWithMeta;
  verifications: Verification[];
  photos: StationPhoto[];
}

/**
 * Server-side fetch for a single station with its verifications and photos.
 * Shared by the `/station/[id]` page (for SSR metadata + JSON-LD) and the
 * `/api/stations/[id]` route so the two never drift apart.
 *
 * Returns `null` when the station does not exist (callers map this to a 404).
 */
export async function getStationDetail(id: string): Promise<StationDetail | null> {
  const mock = MOCK_STATIONS.find((s) => s.id === id);
  if (mock) {
    return { station: mock, verifications: [], photos: [] };
  }

  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();

  const { data: station, error } = await supabase
    .from("stations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!station) return null;

  const [{ data: verifications, error: verificationError }, { data: photos }] =
    await Promise.all([
      supabase
        .from("verifications")
        .select("*")
        .eq("station_id", id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("photos")
        .select("id, url, created_at")
        .eq("station_id", id)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  if (verificationError) throw new Error(verificationError.message);

  const verificationRows = (verifications ?? []) as Verification[];
  const enriched = enrichStation(station as Station, verificationRows);

  return {
    station: enriched,
    verifications: verificationRows,
    photos: (photos ?? []) as StationPhoto[],
  };
}
