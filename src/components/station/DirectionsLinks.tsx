import { formatCoordinates } from "@/lib/utils/geo";

interface DirectionsLinksProps {
  lat: number;
  lng: number;
  label?: string;
}

export function DirectionsLinks({
  lat,
  lng,
  label = "Station",
}: DirectionsLinksProps) {
  const coords = formatCoordinates(lat, lng);
  const encodedLabel = encodeURIComponent(label);

  const links = [
    {
      name: "Google Maps",
      href: `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
    },
    {
      name: "Apple Maps",
      href: `https://maps.apple.com/?daddr=${coords}&q=${encodedLabel}`,
    },
    {
      name: "Waze",
      href: `https://waze.com/ul?ll=${coords}&navigate=yes`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-sky-300 hover:text-sky-700"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
