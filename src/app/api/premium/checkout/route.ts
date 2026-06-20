import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { getSiteUrl } from "@/lib/site-url";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, {
    name: "checkout",
    requests: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Online payments are not enabled yet. Use the inquiry form below." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const stationId =
    typeof body.station_id === "string" ? body.station_id : undefined;
  const email =
    typeof body.contact_email === "string" ? body.contact_email : undefined;

  const base = getSiteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: process.env.STRIPE_PREMIUM_PRICE_ID!, quantity: 1 },
      ],
      customer_email: email,
      metadata: stationId ? { station_id: stationId } : undefined,
      subscription_data: stationId
        ? { metadata: { station_id: stationId } }
        : undefined,
      success_url: `${base}/premium?status=success`,
      cancel_url: `${base}/premium?status=cancelled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to start checkout",
      },
      { status: 500 }
    );
  }
}
