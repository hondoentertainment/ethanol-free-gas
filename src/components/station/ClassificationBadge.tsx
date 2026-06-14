import type { StationClassification } from "@/lib/types/station";

const CLASSIFICATION_CONFIG: Record<
  StationClassification,
  { label: string; icon: string; className: string }
> = {
  car: {
    label: "Car station",
    icon: "🚗",
    className: "bg-blue-50 text-blue-800 ring-blue-600/20",
  },
  boat: {
    label: "Boat dock",
    icon: "🚤",
    className: "bg-teal-50 text-teal-800 ring-teal-600/20",
  },
  dual: {
    label: "Car & boat",
    icon: "🚗🚤",
    className: "bg-violet-50 text-violet-800 ring-violet-600/20",
  },
};

export function ClassificationBadge({
  classification,
}: {
  classification: StationClassification;
}) {
  const config = CLASSIFICATION_CONFIG[classification];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
