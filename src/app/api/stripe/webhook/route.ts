import { getStripe } from "@/lib/payments/stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import { reportError } from "@/lib/observability/report";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

// Stripe needs the raw request body to verify the signature.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created"
    ) {
      const object = event.data.object as
        | Stripe.Checkout.Session
        | Stripe.Subscription;
      const stationId = object.metadata?.station_id;
      if (stationId) {
        const supabase = createServiceClient();
        if (supabase) {
          await supabase
            .from("stations")
            .update({ is_premium: true })
            .eq("id", stationId);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const stationId = subscription.metadata?.station_id;
      if (stationId) {
        const supabase = createServiceClient();
        if (supabase) {
          await supabase
            .from("stations")
            .update({ is_premium: false })
            .eq("id", stationId);
        }
      }
    }
  } catch (error) {
    reportError(error, { stripeEvent: event.type });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
