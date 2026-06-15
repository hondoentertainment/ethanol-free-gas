import { getBadgesForPoints } from "@/lib/gamification/badges";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      leaders: [
        { id: "demo-1", display_name: "HarborPilot", contributor_points: 125, badges: getBadgesForPoints(125).map((b) => b.id) },
        { id: "demo-2", display_name: "E0Scout", contributor_points: 80, badges: getBadgesForPoints(80).map((b) => b.id) },
        { id: "demo-3", display_name: "MarinaMike", contributor_points: 55, badges: getBadgesForPoints(55).map((b) => b.id) },
      ],
    });
  }

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, contributor_points")
    .gt("contributor_points", 0)
    .order("contributor_points", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaders = (profiles ?? []).map((profile) => ({
    id: profile.id,
    display_name: profile.display_name ?? "Contributor",
    contributor_points: profile.contributor_points,
    badges: getBadgesForPoints(profile.contributor_points).map((b) => b.id),
  }));

  return NextResponse.json({ leaders });
}
