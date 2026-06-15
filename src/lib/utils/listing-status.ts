import type { LastVerification, VerificationStatus } from "@/lib/types/station";

export type ListingStatus =
  | "active"
  | "no_e0"
  | "closed"
  | "needs_review"
  | "unknown";

export const LISTING_STATUS_TEXT: Record<ListingStatus, string | null> = {
  active: null,
  no_e0: "No longer sells E0",
  closed: "Closed or no longer there",
  needs_review: "Listing may be incorrect",
  unknown: null,
};

export const LISTING_STATUS_BANNER: Record<
  Exclude<ListingStatus, "active" | "unknown">,
  { title: string; description: string; className: string }
> = {
  no_e0: {
    title: "Reported: no longer sells ethanol-free fuel",
    description:
      "Community members reported this location is open but no longer offers E0. Confirm below if you have newer info.",
    className: "border-amber-200 bg-amber-50 text-amber-950",
  },
  closed: {
    title: "Reported: station closed or removed",
    description:
      "Community members reported this business is closed or no longer at this address.",
    className: "border-red-200 bg-red-50 text-red-950",
  },
  needs_review: {
    title: "Reported: listing may be wrong",
    description:
      "Someone flagged incorrect details (wrong address, duplicate, etc.).",
    className: "border-zinc-300 bg-zinc-100 text-zinc-900",
  },
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  available: "Still sells E0",
  unavailable: "No longer sells E0",
  closed: "Closed or no longer there",
  incorrect: "Wrong listing details",
};

export function getListingStatus(
  latestReport: LastVerification | null
): ListingStatus {
  if (!latestReport) return "unknown";

  switch (latestReport.status) {
    case "available":
      return "active";
    case "unavailable":
      return "no_e0";
    case "closed":
      return "closed";
    case "incorrect":
      return "needs_review";
    default:
      return "unknown";
  }
}

export function isNegativeListingStatus(status: ListingStatus): boolean {
  return status === "no_e0" || status === "closed" || status === "needs_review";
}
