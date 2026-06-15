import type { ListingStatus } from "@/lib/types/station";
import {
  LISTING_STATUS_BANNER,
  LISTING_STATUS_TEXT,
} from "@/lib/utils/listing-status";

const BADGE_STYLES: Record<
  Exclude<ListingStatus, "active" | "unknown">,
  string
> = {
  no_e0: "bg-amber-100 text-amber-900 ring-amber-600/20",
  closed: "bg-red-100 text-red-900 ring-red-600/20",
  needs_review: "bg-zinc-200 text-zinc-800 ring-zinc-500/20",
};

export function ListingStatusBadge({
  status,
}: {
  status: ListingStatus;
}) {
  if (status === "active" || status === "unknown") return null;

  const label = LISTING_STATUS_TEXT[status];
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${BADGE_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

export function ListingStatusBanner({
  status,
  reportedAt,
}: {
  status: ListingStatus;
  reportedAt?: string | null;
}) {
  if (status === "active" || status === "unknown") return null;

  const copy = LISTING_STATUS_BANNER[status];
  const when = reportedAt
    ? new Date(reportedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${copy.className}`}
      role="status"
    >
      <p className="text-sm font-semibold">{copy.title}</p>
      <p className="mt-1 text-sm opacity-90">{copy.description}</p>
      {when && (
        <p className="mt-2 text-xs opacity-75">Last reported {when}</p>
      )}
    </div>
  );
}
