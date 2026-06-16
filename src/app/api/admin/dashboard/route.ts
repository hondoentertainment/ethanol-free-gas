import { verifyAdminSecret } from "@/lib/auth/secrets";
import { fetchVerificationStats } from "@/lib/admin/verification-stats";
import { createServiceClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const [inquiries, imports, usage, verification_stats] = await Promise.all([
    supabase
      .from("premium_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("import_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10),
    supabase
      .from("api_usage_log")
      .select("id", { count: "exact", head: true }),
    fetchVerificationStats(supabase),
  ]);

  return NextResponse.json({
    inquiries: inquiries.data ?? [],
    import_runs: imports.data ?? [],
    api_calls: usage.count ?? 0,
    verification_stats,
  });
}
