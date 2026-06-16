import type { SupabaseClient } from "@supabase/supabase-js";

export interface VerificationStats {
  total_stations: number;
  verifications_this_week: number;
  stations_ever_verified: number;
  verified_fresh: number;
  negative_listing: number;
  never_verified: number;
  stale_or_unverified: number;
  verified_percent: number;
  stale_percent: number;
}

function enrichStats(raw: {
  total_stations: number;
  verifications_this_week: number;
  stations_ever_verified: number;
  verified_fresh: number;
  negative_listing: number;
  never_verified: number;
}): VerificationStats {
  const total = raw.total_stations || 0;
  const staleOrUnverified = Math.max(
    0,
    total - raw.verified_fresh - raw.negative_listing
  );
  const verifiedPercent =
    total > 0 ? Math.round((raw.verified_fresh / total) * 1000) / 10 : 0;
  const stalePercent =
    total > 0 ? Math.round((staleOrUnverified / total) * 1000) / 10 : 0;

  return {
    ...raw,
    stale_or_unverified: staleOrUnverified,
    verified_percent: verifiedPercent,
    stale_percent: stalePercent,
  };
}

export async function fetchVerificationStats(
  supabase: SupabaseClient
): Promise<VerificationStats | null> {
  const { data, error } = await supabase.rpc("get_verification_stats");

  if (!error && data && typeof data === "object") {
    const raw = data as Record<string, number>;
    return enrichStats({
      total_stations: raw.total_stations ?? 0,
      verifications_this_week: raw.verifications_this_week ?? 0,
      stations_ever_verified: raw.stations_ever_verified ?? 0,
      verified_fresh: raw.verified_fresh ?? 0,
      negative_listing: raw.negative_listing ?? 0,
      never_verified: raw.never_verified ?? 0,
    });
  }

  const [stations, weekVerifications] = await Promise.all([
    supabase.from("stations").select("id", { count: "exact", head: true }),
    supabase
      .from("verifications")
      .select("id", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ]);

  const total = stations.count ?? 0;
  return enrichStats({
    total_stations: total,
    verifications_this_week: weekVerifications.count ?? 0,
    stations_ever_verified: 0,
    verified_fresh: 0,
    negative_listing: 0,
    never_verified: total,
  });
}
