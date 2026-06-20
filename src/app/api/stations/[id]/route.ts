import { getStationDetail } from "@/lib/data/station-detail";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { StationClassification } from "@/lib/types/station";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let detail;
  try {
    detail = await getStationDetail(id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load station" },
      { status: 500 }
    );
  }

  if (!detail) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  return NextResponse.json({
    station: detail.station,
    verifications: detail.verifications,
    photos: detail.photos,
    verification_label: detail.station.verification_label,
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
