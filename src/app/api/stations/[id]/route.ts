import { enrichStation, MOCK_STATIONS } from "@/lib/data/stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Station, Verification } from "@/lib/types/station";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const mock = MOCK_STATIONS.find((s) => s.id === id);
  if (mock) {
    return NextResponse.json({
      station: mock,
      verifications: [],
      verification_label: mock.verification_label,
    });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const supabase = await createClient();

  const { data: station, error } = await supabase
    .from("stations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const { data: verifications, error: verificationError } = await supabase
    .from("verifications")
    .select("*")
    .eq("station_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (verificationError) {
    return NextResponse.json(
      { error: verificationError.message },
      { status: 500 }
    );
  }

  const verificationRows = (verifications ?? []) as Verification[];
  const enriched = enrichStation(station as Station, verificationRows);

  return NextResponse.json({
    station: enriched,
    verifications: verificationRows,
    verification_label: enriched.verification_label,
  });
}
