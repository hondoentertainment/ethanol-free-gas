/** Human-friendly "time ago" string from an ISO timestamp. */
export function relativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";

  const units: [number, string][] = [
    [60, "minute"],
    [60, "hour"],
    [24, "day"],
    [7, "week"],
    [4.345, "month"],
    [12, "year"],
  ];

  let value = seconds / 60;
  let unit = "minute";
  for (let i = 1; i < units.length; i++) {
    if (Math.abs(value) < units[i][0]) break;
    value /= units[i][0];
    unit = units[i][1];
  }

  const rounded = Math.round(value);
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
}
