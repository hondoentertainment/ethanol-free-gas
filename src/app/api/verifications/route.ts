import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/lib/types/station";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES: VerificationStatus[] = [
  "available",
  "unavailable",
  "incorrect",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const stationId = body.station_id as string | undefined;
  const status = body.status as VerificationStatus | undefined;
  const notes = (body.notes as string | undefined)?.trim() || null;

  if (!stationId || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      {
        error:
          "station_id and status (available|unavailable|incorrect) are required",
      },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        verification: {
          id: "mock-verification",
          station_id: stationId,
          status,
          notes,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: station, error: stationError } = await supabase
    .from("stations")
    .select("id")
    .eq("id", stationId)
    .maybeSingle();

  if (stationError) {
    return NextResponse.json({ error: stationError.message }, { status: 500 });
  }

  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const { data: verification, error } = await supabase
    .from("verifications")
    .insert({
      station_id: stationId,
      status,
      notes,
      user_id: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ verification }, { status: 201 });
}
