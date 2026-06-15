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
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#dc2626] ring-2 ring-white"
            aria-hidden="true"
          />
          Reported: no E0
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#71717a] ring-2 ring-white"
            aria-hidden="true"
          />
          Reported: closed
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#ea580c] ring-2 ring-white"
            aria-hidden="true"
          />
          Needs verification
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#f59e0b] ring-2 ring-white"
            aria-hidden="true"
          />
          Premium / sponsored
        </li>
      </ul>
    </div>
  );
}
