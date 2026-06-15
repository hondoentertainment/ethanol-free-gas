import { verifyAdminSecret } from "@/lib/auth/secrets";
import { createServiceClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ stations: [] });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const pattern = `%${q.replace(/[%_]/g, "")}%`;
  const { data, error } = await supabase
    .from("stations")
    .select("id, name, city, state, is_premium, is_sponsored, address")
    .or(
      `name.ilike.${pattern},city.ilike.${pattern},address.ilike.${pattern}`
    )
    .order("name")
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stations: data ?? [] });
}
