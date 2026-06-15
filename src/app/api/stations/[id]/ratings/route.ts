import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function avg(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: stationId } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ratings: null, user_rating: null });
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("station_ratings")
    .select("availability, access, cleanliness, service")
    .eq("station_id", stationId);

  const ratings = rows ?? [];
  const summary =
    ratings.length === 0
      ? null
      : {
          count: ratings.length,
          availability: avg(ratings.map((r) => r.availability)),
          access: avg(ratings.map((r) => r.access)),
          cleanliness: avg(ratings.map((r) => r.cleanliness)),
          service: avg(ratings.map((r) => r.service)),
          overall:
            avg(
              ratings.map(
                (r) =>
                  (r.availability + r.access + r.cleanliness + r.service) / 4
              )
            ),
        };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRating = null;
  if (user) {
    const { data } = await supabase
      .from("station_ratings")
      .select("*")
      .eq("station_id", stationId)
      .eq("user_id", user.id)
      .maybeSingle();
    userRating = data;
  }

  return NextResponse.json({ summary, user_rating: userRating });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: stationId } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const scores = {
    availability: Number(body.availability),
    access: Number(body.access),
    cleanliness: Number(body.cleanliness),
    service: Number(body.service),
  };

  for (const value of Object.values(scores)) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return NextResponse.json(
        { error: "Each rating must be an integer from 1 to 5" },
        { status: 400 }
      );
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data: rating, error } = await supabase
    .from("station_ratings")
    .upsert(
      {
        station_id: stationId,
        user_id: user.id,
        ...scores,
        notes: (body.notes as string | undefined)?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "station_id,user_id" }
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rating }, { status: 201 });
}
