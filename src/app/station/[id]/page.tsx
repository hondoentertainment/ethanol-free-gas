import { StationDetailClient } from "@/components/station/StationDetailClient";

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StationDetailClient id={id} />;
}
