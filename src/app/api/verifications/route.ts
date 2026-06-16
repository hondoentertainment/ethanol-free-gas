import { dispatchFuelAlerts } from "@/lib/alerts/dispatch";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/lib/types/station";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES: VerificationStatus[] = [
  "available",
  "unavailable",
  "closed",
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
          "station_id and status (available|unavailable|closed|incorrect) are required",
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

  if (!user) {
    return NextResponse.json(
      { error: "Sign in required to submit verifications" },
      { status: 401 }
    );
  }

  const { data: station, error: stationError } = await supabase
    .from("stations")
    .select("id, name, lat, lng")
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
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    const isClosedEnumError =
      status === "closed" &&
      /closed|enum|invalid input value/i.test(error.message);

    if (isClosedEnumError) {
      const fallbackNotes = [
        "[no_longer_in_business]",
        notes?.trim() || "Reported as no longer in business.",
      ].join(" ");

      const { data: fallback, error: fallbackError } = await supabase
        .from("verifications")
        .insert({
          station_id: stationId,
          status: "incorrect",
          notes: fallbackNotes,
          user_id: user.id,
        })
        .select("*")
        .single();

      if (!fallbackError && fallback) {
        await dispatchFuelAlerts(
          {
            stationId: station.id,
            stationName: station.name,
            alertType: "unavailable",
            verificationStatus: "closed",
            target: { lat: station.lat, lng: station.lng },
          },
          user.id
        );
        return NextResponse.json({ verification: fallback }, { status: 201 });
      }
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (
    status === "available" ||
    status === "unavailable" ||
    status === "closed"
  ) {
    await dispatchFuelAlerts(
      {
        stationId: station.id,
        stationName: station.name,
        alertType: status === "available" ? "available" : "unavailable",
        verificationStatus: status,
        target: { lat: station.lat, lng: station.lng },
      },
      user.id
    );
  }

  return NextResponse.json({ verification }, { status: 201 });
}
