export function MapLegend() {
  return (
    <div
      className="rounded-xl border border-zinc-200/80 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm"
      aria-label="Map legend"
    >
      <p className="mb-1.5 font-semibold text-zinc-800">Station type</p>
      <ul className="space-y-1 text-zinc-600">
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#2563eb] ring-2 ring-white"
            aria-hidden="true"
          />
          Car station
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#0d9488] ring-2 ring-white"
            aria-hidden="true"
          />
          Boat dock
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#7c3aed] ring-2 ring-white"
            aria-hidden="true"
          />
          Car & boat
        </li>
      </ul>
    </div>
  );
}
