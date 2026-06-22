import Image from "next/image";
import Link from "next/link";
import { getStaticMapUrl } from "@/lib/map/static-map-url";

export function StationMapPreview({
  lat,
  lng,
  name,
  state,
  country,
}: {
  lat: number;
  lng: number;
  name: string;
  state: string;
  country: string;
}) {
  const mapUrl = getStaticMapUrl(lat, lng);
  const mapDeepLink = `/?state=${state}&country=${country}`;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
      <Link href={mapDeepLink} className="relative block aspect-[8/3] w-full">
        <Image
          src={mapUrl}
          alt={`Map showing ${name} location`}
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover"
          unoptimized
        />
      </Link>
      <p className="px-3 py-2 text-xs text-zinc-600">
        Tap the map to open {name} in the full interactive map.
      </p>
    </section>
  );
}
