import Stripe from "stripe";

/** True when Stripe secret key + a price are configured for self-serve checkout. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PREMIUM_PRICE_ID
  );
}

let client: Stripe | null = null;

/** Lazily-created Stripe client. Returns null when not configured. */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}
