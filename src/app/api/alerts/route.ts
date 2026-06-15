import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AlertType } from "@/lib/types/alerts";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES: AlertType[] = ["new_station", "unavailable", "available"];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ subscriptions: [], unread_count: 0 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ subscriptions: [], unread_count: 0 });
  }

  const [{ data: subscriptions }, { count }] = await Promise.all([
    supabase
      .from("fuel_alert_subscriptions")
      .select("id, lat, lng, radius_miles, alert_types, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  return NextResponse.json({
    subscriptions: subscriptions ?? [],
    unread_count: count ?? 0,
  });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Connect Supabase for fuel alerts" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const radiusMiles = Math.min(
    Math.max(Number(body.radius_miles ?? 25), 5),
    100
  );
  const alertTypes = (body.alert_types as AlertType[] | undefined)?.filter(
    (t) => VALID_TYPES.includes(t)
  ) ?? VALID_TYPES;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data: subscription, error } = await supabase
    .from("fuel_alert_subscriptions")
    .insert({
      user_id: user.id,
      lat,
      lng,
      radius_miles: radiusMiles,
      alert_types: alertTypes,
      push_endpoint: body.push_endpoint ?? null,
      push_p256dh: body.push_p256dh ?? null,
      push_auth: body.push_auth ?? null,
    })
    .select("id, lat, lng, radius_miles, alert_types, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription }, { status: 201 });
}
