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

  return NextResponse.json({
    profile: {
      contributor_points: profile?.contributor_points ?? 0,
      display_name: profile?.display_name ?? user.email?.split("@")[0] ?? "User",
    },
  });
}
