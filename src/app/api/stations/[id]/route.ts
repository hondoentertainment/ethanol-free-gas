import { enrichStation, MOCK_STATIONS } from "@/lib/data/stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Station, StationClassification, Verification } from "@/lib/types/station";
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
      photos: [],
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
    photos: photos ?? [],
    verification_label: enriched.verification_label,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Connect Supabase to edit stations" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in required to edit a station" },
      { status: 401 }
    );
  }

  const { data: existing } = await supabase
    .from("stations")
    .select("submitted_by")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  if (existing.submitted_by !== user.id) {
    return NextResponse.json(
      { error: "You can only edit stations you submitted" },
      { status: 403 }
    );
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.address === "string" && body.address.trim()) {
    updates.address = body.address.trim();
  }
  if (typeof body.city === "string" && body.city.trim()) {
    updates.city = body.city.trim();
  }
  if (typeof body.state === "string" && body.state.trim()) {
    updates.state = body.state.trim();
  }
  if (typeof body.zip === "string") {
    updates.zip = body.zip.trim() || null;
  }
  if (["car", "boat", "dual"].includes(body.classification)) {
    updates.classification = body.classification as StationClassification;
  }
  if (typeof body.fuel_type === "string" && body.fuel_type.trim()) {
    updates.fuel_type = body.fuel_type.trim();
  }
  if (body.ethanol_percent != null && !Number.isNaN(Number(body.ethanol_percent))) {
    updates.ethanol_percent = Number(body.ethanol_percent);
  }
  if (typeof body.phone === "string") {
    updates.phone = body.phone.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data: station, error } = await supabase
    .from("stations")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ station });
}
