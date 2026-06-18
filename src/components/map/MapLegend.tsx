import { LEGEND_ITEMS } from "@/lib/map/colors";

export function MapLegend() {
  return (
    <div
      className="rounded-xl border border-zinc-200/80 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm"
      aria-label="Map legend"
    >
      <p className="mb-1.5 font-semibold text-zinc-800">Station type</p>
      <ul className="space-y-1 text-zinc-600">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full ring-2 ring-white"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
