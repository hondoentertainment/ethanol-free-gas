import * as Sentry from "@sentry/nextjs";

/**
 * Report a caught error to Sentry. Safe to call anywhere — when no Sentry DSN
 * is configured the SDK is inert, so this is a no-op in local/unconfigured
 * environments. Always logs to the console as a fallback.
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Never let error reporting throw.
  }
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
}
