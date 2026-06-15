export const STALE_VERIFICATION_DAYS = 90;

export function isVerificationStale(
  lastVerification: { created_at: string; status: string } | null
): boolean {
  if (!lastVerification || lastVerification.status !== "available") {
    return true;
  }
  const days =
    (Date.now() - new Date(lastVerification.created_at).getTime()) /
    (1000 * 60 * 60 * 24);
  return days > STALE_VERIFICATION_DAYS;
}
