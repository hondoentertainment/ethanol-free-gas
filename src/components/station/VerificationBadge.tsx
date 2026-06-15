import type { VerificationLabel } from "@/lib/types/station";
import {
  VERIFICATION_LABEL_STYLES,
  VERIFICATION_LABEL_TEXT,
} from "@/lib/utils/verification";

export function VerificationBadge({
  label,
  stale,
}: {
  label: VerificationLabel;
  stale?: boolean;
}) {
  const display = stale ? "stale" : label;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${VERIFICATION_LABEL_STYLES[display]}`}
    >
      {stale ? VERIFICATION_LABEL_TEXT.stale : VERIFICATION_LABEL_TEXT[label]}
    </span>
  );
}
