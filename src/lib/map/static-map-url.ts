/** Static map image URL for station detail previews (no client map bundle). */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  opts?: { width?: number; height?: number; zoom?: number }
): string {
  const width = opts?.width ?? 640;
  const height = opts?.height ?? 240;
  const zoom = opts?.zoom ?? 13;

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (token) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+0284c7(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}@2x?access_token=${token}`;
  }

  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red-pushpin`;
}
