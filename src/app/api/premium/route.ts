import { notifyAdminPremiumInquiry } from "@/lib/email/send";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const businessName = (body.business_name as string | undefined)?.trim();
  const contactEmail = (body.contact_email as string | undefined)?.trim();
  const stationName = (body.station_name as string | undefined)?.trim() || null;
  const message = (body.message as string | undefined)?.trim() || null;

  if (!businessName || !contactEmail) {
    return NextResponse.json(
      { error: "business_name and contact_email are required" },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: true, message: "Inquiry received (demo mode)" },
      { status: 201 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("premium_inquiries").insert({
    business_name: businessName,
    contact_email: contactEmail,
    station_name: stationName,
    message,
    user_id: user?.id ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  void notifyAdminPremiumInquiry({
    businessName,
    contactEmail,
    stationName,
    message,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
