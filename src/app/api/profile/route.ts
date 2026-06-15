import { getBadgesForPoints } from "@/lib/gamification/badges";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
