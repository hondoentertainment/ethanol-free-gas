import type { StationClassification } from "@/lib/types/station";

const BOAT_KEYWORDS = [
  "marina",
  "dock",
  "harbor",
  "harbour",
  "yacht",
  "boat",
  "marine",
  "waterside",
  "fuel dock",
  "sailfish",
  "nautical",
] as const;

const CAR_KEYWORDS = [
  "sheetz",
  "racetrac",
  "race way",
  "marathon",
  "shell",
  "exxon",
  "chevron",
  "mobil",
  "kwik trip",
  "circle k",
  "speedway",
  "gas station",
  "convenience",
  "irving",
  "petro",
] as const;

export function inferClassification(
  name: string,
  comment?: string | null,
  locationComment?: string | null
): StationClassification {
  const text = `${name} ${comment ?? ""} ${locationComment ?? ""}`.toLowerCase();
  const boat = BOAT_KEYWORDS.some((keyword) => text.includes(keyword));
  const car = CAR_KEYWORDS.some((keyword) => text.includes(keyword));

  if (boat && car) return "dual";
  if (boat) return "boat";
  return "car";
}
