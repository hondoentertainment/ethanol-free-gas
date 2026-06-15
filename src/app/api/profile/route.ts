import { getBadgesForPoints } from "@/lib/gamification/badges";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ profile: null });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ profile: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("contributor_points, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const points = profile?.contributor_points ?? 0;

  return NextResponse.json({
    profile: {
      contributor_points: points,
      display_name: profile?.display_name ?? user.email?.split("@")[0] ?? "User",
      badges: getBadgesForPoints(points).map((b) => b.id),
    },
  });
}

export async function PATCH(request: NextRequest) {
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

  const body = await request.json();
  const displayName = (body.display_name as string | undefined)?.trim();

  if (!displayName || displayName.length > 40) {
    return NextResponse.json(
      { error: "display_name is required (max 40 characters)" },
      { status: 400 }
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, display_name: displayName },
      { onConflict: "id" }
    )
    .select("contributor_points, display_name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const points = profile.contributor_points ?? 0;

  return NextResponse.json({
    profile: {
      contributor_points: points,
      display_name: profile.display_name,
      badges: getBadgesForPoints(points).map((b) => b.id),
    },
  });
}
