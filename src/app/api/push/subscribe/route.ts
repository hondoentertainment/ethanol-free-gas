import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const endpoint = body.endpoint as string | undefined;
  const p256dh = body.p256dh as string | undefined;
  const auth = body.auth as string | undefined;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "endpoint, p256dh, and auth are required" },
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

  const { data: subscriptions, error: fetchError } = await supabase
    .from("fuel_alert_subscriptions")
    .select("id")
    .eq("user_id", user.id);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!subscriptions?.length) {
    return NextResponse.json(
      { error: "Create a fuel alert zone first, then enable push." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("fuel_alert_subscriptions")
    .update({
      push_endpoint: endpoint,
      push_p256dh: p256dh,
      push_auth: auth,
    })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  await supabase
    .from("fuel_alert_subscriptions")
    .update({
      push_endpoint: null,
      push_p256dh: null,
      push_auth: null,
    })
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
