export function inferClassification(name, comment, locationComment) {
  const text = `${name} ${comment ?? ""} ${locationComment ?? ""}`.toLowerCase();
  const boat = [
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
  ].some((keyword) => text.includes(keyword));
  const car = [
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
  ].some((keyword) => text.includes(keyword));

  if (boat && car) return "dual";
  if (boat) return "boat";
  return "car";
}
