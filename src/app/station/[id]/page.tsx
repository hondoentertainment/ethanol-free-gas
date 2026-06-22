import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StationDetailClient } from "@/components/station/StationDetailClient";
import { getStationDetail } from "@/lib/data/station-detail";
import { queryStations } from "@/lib/data/query-stations";
import { getSiteUrl } from "@/lib/site-url";
import { getRegionName } from "@/lib/data/state-stats";
import type { StationWithMeta } from "@/lib/types/station";

function stationPageTitle(station: {
  name: string;
  city: string;
  state: string;
}): string {
  return `${station.name} · E0 in ${station.city}, ${station.state}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let detail;
  try {
    detail = await getStationDetail(id);
  } catch {
    detail = null;
  }

  if (!detail) {
    return { title: "Station not found", robots: { index: false } };
  }

  const { station } = detail;
  const region = getRegionName(station.state, station.country);
  const pageTitle = stationPageTitle(station);
  const description = `${station.name} at ${station.address}, ${station.city}, ${station.state} offers ${station.fuel_type} (${station.ethanol_percent}% ethanol). Get directions, hours, and community verification for this ethanol-free fuel station in ${region}.`;
  const canonical = `${getSiteUrl()}/station/${station.id}`;

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description,
    },
  };
}

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let detail;
  try {
    detail = await getStationDetail(id);
  } catch {
    detail = null;
  }

  if (!detail) notFound();

  const { station, verifications, photos } = detail;
  const canonical = `${getSiteUrl()}/station/${station.id}`;

  let nearbyStations: StationWithMeta[] = [];
  try {
    const nearby = await queryStations({
      lat: station.lat,
      lng: station.lng,
      radius: 25,
      limit: 8,
    });
    nearbyStations = nearby
      .filter((s) => s.id !== station.id)
      .slice(0, 6);
  } catch {
    nearbyStations = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GasStation",
    "@id": canonical,
    name: station.name,
    url: canonical,
    address: {
      "@type": "PostalAddress",
      streetAddress: station.address,
      addressLocality: station.city,
      addressRegion: station.state,
      postalCode: station.zip ?? undefined,
      addressCountry: station.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: station.lat,
      longitude: station.lng,
    },
    ...(station.phone ? { telephone: station.phone } : {}),
    amenityFeature: {
      "@type": "LocationFeatureSpecification",
      name: "Ethanol-free fuel",
      value: station.ethanol_percent === 0,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StationDetailClient
        id={id}
        initialStation={station}
        initialVerifications={verifications}
        initialPhotos={photos}
        nearbyStations={nearbyStations}
      />
    </>
  );
}
