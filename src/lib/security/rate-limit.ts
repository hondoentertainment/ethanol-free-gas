import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

/**
 * Env-guarded rate limiting backed by Upstash Redis. When the Upstash env vars
 * are not configured (local dev, previews without the integration) every call
 * is allowed, so the app keeps working unchanged. In production with Upstash
 * connected, public endpoints get a sliding-window limit per client IP.
 */

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, requests: number, windowSeconds: number) {
  if (!redis) return null;
  const key = `${name}:${requests}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

function clientId(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}

export interface RateLimitOptions {
  /** Logical bucket name (e.g. "stations", "geocode"). */
  name: string;
  /** Max requests allowed within the window. */
  requests: number;
  /** Window length in seconds. */
  windowSeconds: number;
  /** Custom identifier (e.g. an API key) instead of the client IP. */
  identifier?: string;
}

/**
 * Returns a 429 `NextResponse` when the caller is over the limit, otherwise
 * `null` (allowed). No-ops to `null` when Upstash is not configured.
 */
export async function enforceRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const limiter = getLimiter(options.name, options.requests, options.windowSeconds);
  if (!limiter) return null;

  const id = options.identifier ?? clientId(request);
  const { success, limit, remaining, reset } = await limiter.limit(id);

  if (success) return null;

  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
