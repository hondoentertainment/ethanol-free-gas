"use client";

import type { StationClassification } from "@/lib/types/station";

const CHIPS: {
  value: StationClassification | "";
  label: string;
  icon: string;
}[] = [
  { value: "", label: "All", icon: "⛽" },
  { value: "car", label: "Car", icon: "🚗" },
  { value: "boat", label: "Boat", icon: "🚤" },
  { value: "dual", label: "Both", icon: "🚗🚤" },
];

export function ClassificationFilterChips({
  value,
  onChange,
}: {
  value: StationClassification | "";
  onChange: (value: StationClassification | "") => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CHIPS.map((chip) => {
        const active = value === chip.value;
        return (
          <button
            key={chip.value || "all"}
            type="button"
            onClick={() => onChange(chip.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active
                ? "bg-sky-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <span aria-hidden="true">{chip.icon}</span> {chip.label}
          </button>
        );
      })}
    </div>
  );
}
