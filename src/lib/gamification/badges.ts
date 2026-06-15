export interface ContributorBadge {
  id: string;
  name: string;
  description: string;
  minPoints: number;
}

export const CONTRIBUTOR_BADGES: ContributorBadge[] = [
  { id: "scout", name: "Scout", description: "First contribution", minPoints: 25 },
  { id: "verifier", name: "Verifier", description: "50+ points", minPoints: 50 },
  { id: "photographer", name: "Photographer", description: "75+ points", minPoints: 75 },
  { id: "explorer", name: "Explorer", description: "100+ points", minPoints: 100 },
  { id: "champion", name: "Champion", description: "250+ points", minPoints: 250 },
  { id: "legend", name: "Legend", description: "500+ points", minPoints: 500 },
];

export function getBadgesForPoints(points: number): ContributorBadge[] {
  return CONTRIBUTOR_BADGES.filter((badge) => points >= badge.minPoints);
}

export function getTopBadge(points: number): ContributorBadge | null {
  const earned = getBadgesForPoints(points);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}
