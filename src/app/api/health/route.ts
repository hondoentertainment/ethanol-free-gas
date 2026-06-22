import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, boolean | string | number> = {
    supabase: isSupabaseConfigured(),
    mapbox: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
    vapid: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
    sentry: Boolean(
      process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    ),
    upstash: Boolean(
      process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    ),
    stripe: Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PREMIUM_PRICE_ID
    ),
  };

  if (isSupabaseConfigured()) {
    const supabase = createServiceClient();
    if (supabase) {
      const { count } = await supabase
        .from("stations")
        .select("*", { count: "exact", head: true });
      checks.station_count = count ?? 0;
    }
  }

  const healthy = checks.supabase && Number(checks.station_count ?? 0) > 0;

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503 }
  );
}
