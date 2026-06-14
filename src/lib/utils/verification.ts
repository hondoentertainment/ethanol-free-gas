import type { LastVerification, VerificationLabel } from "@/lib/types/station";

export function getVerificationLabel(
  lastVerification: LastVerification | null
): VerificationLabel {
  if (!lastVerification || lastVerification.status !== "available") {
    return "unverified";
  }

  const created = new Date(lastVerification.created_at);
  const now = new Date();
  const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  if (hours <= 24) return "verified_today";
  if (hours <= 24 * 7) return "verified_this_week";
  if (hours <= 24 * 30) return "verified_this_month";
  return "unverified";
}

export const VERIFICATION_LABEL_TEXT: Record<VerificationLabel, string> = {
  verified_today: "Verified today",
  verified_this_week: "Verified this week",
  verified_this_month: "Verified this month",
  unverified: "Unverified",
};

export const VERIFICATION_LABEL_STYLES: Record<VerificationLabel, string> = {
  verified_today: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  verified_this_week: "bg-sky-100 text-sky-800 ring-sky-600/20",
  verified_this_month: "bg-amber-100 text-amber-800 ring-amber-600/20",
  unverified: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
};
