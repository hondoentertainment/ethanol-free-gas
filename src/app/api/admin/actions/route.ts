import { verifyAdminSecret } from "@/lib/auth/secrets";
import { createServiceClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const stationId = body.station_id as string | undefined;
  const inquiryId = body.inquiry_id as string | undefined;

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  if (stationId) {
    const { error } = await supabase
      .from("stations")
      .update({
        is_premium: Boolean(body.is_premium),
        is_sponsored: Boolean(body.is_sponsored),
      })
      .eq("id", stationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (inquiryId) {
    const status = body.status as string | undefined;
    if (!status) {
      return NextResponse.json({ error: "status required" }, { status: 400 });
    }

    const promoteStationId = body.promote_station_id as string | undefined;
    if (promoteStationId) {
      const { error: promoteError } = await supabase
        .from("stations")
        .update({ is_premium: true })
        .eq("id", promoteStationId);
      if (promoteError) {
        return NextResponse.json({ error: promoteError.message }, { status: 500 });
      }
    }

    const { error } = await supabase
      .from("premium_inquiries")
      .update({ status })
      .eq("id", inquiryId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "station_id or inquiry_id required" }, { status: 400 });
}
