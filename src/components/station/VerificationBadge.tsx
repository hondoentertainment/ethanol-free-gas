import type { VerificationLabel } from "@/lib/types/station";
import {
  VERIFICATION_LABEL_STYLES,
  VERIFICATION_LABEL_TEXT,
} from "@/lib/utils/verification";

export function VerificationBadge({
  label,
}: {
  label: VerificationLabel;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${VERIFICATION_LABEL_STYLES[label]}`}
    >
      {VERIFICATION_LABEL_TEXT[label]}
    </span>
  );
}
