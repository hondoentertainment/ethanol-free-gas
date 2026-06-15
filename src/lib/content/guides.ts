export const GUIDES = [
  {
    slug: "what-is-e0-gas",
    title: "What is ethanol-free (E0) gasoline?",
    description:
      "Why boat owners, classic cars, and small engines need gasoline without ethanol blends.",
    body: [
      "Ethanol-free gasoline (E0) contains no ethanol alcohol. Most pump gas is E10 (10% ethanol), which can absorb water and damage fuel systems in boats, classic cars, and small engines.",
      "E0 is often sold as recreation fuel, marina gas, or non-ethanol premium at select stations.",
      "Use E0 Finder to locate verified stations and distinguish car stations from marina fuel docks.",
    ],
  },
  {
    slug: "boat-vs-car-fuel",
    title: "Boat fuel dock vs car gas station",
    description:
      "How to tell if a listing serves road vehicles or marine customers only.",
    body: [
      "Car stations are accessible by road — standard gas stations and convenience stores.",
      "Boat stations are marinas and fuel docks reached by water; many are not accessible by car.",
      "Dual-access locations serve both. Always check classification before towing a boat or filling jerry cans.",
    ],
  },
  {
    slug: "find-e0-along-route",
    title: "Find E0 gas along your route",
    description:
      "Plan RV trips, road trips, and towing routes with ethanol-free fuel stops.",
    body: [
      "Open Route search on the map, enter origin and destination, and we find E0 stations within a few miles of your driving path.",
      "Adjust the corridor width to include more or fewer stops.",
      "Save alert zones near home to get notified when fuel status changes.",
    ],
  },
  {
    slug: "florida-e0-gas",
    title: "Ethanol-free gas in Florida",
    description: "Finding E0 stations across Florida for boats and classic cars.",
    body: [
      "Florida has hundreds of ethanol-free listings — especially near marinas, coastal communities, and recreation areas.",
      "Browse Florida stations on our state page or open the map filtered to FL.",
      "Community verifications help confirm fuel is still available before you drive or boat there.",
    ],
    mapQuery: "state=FL",
  },
  {
    slug: "texas-e0-gas",
    title: "Ethanol-free gas in Texas",
    description: "E0 stations across Texas for boats, RVs, and classic cars.",
    body: [
      "Texas has widespread E0 availability — from Gulf Coast marinas to rural convenience stores.",
      "Use the Texas state page or filter the map to TX to browse listings statewide.",
      "Route search helps plan long hauls across TX highways with E0 stops along the way.",
    ],
    mapQuery: "state=TX",
  },
  {
    slug: "california-e0-gas",
    title: "Ethanol-free gas in California",
    description: "Finding recreation fuel and marina gas in California.",
    body: [
      "California listings include lake marinas, coastal fuel docks, and select road stations.",
      "Many listings are boat-only — check classification before driving to a marina dock.",
      "Community verifications are especially helpful in areas with seasonal fuel availability.",
    ],
    mapQuery: "state=CA",
  },
  {
    slug: "north-carolina-e0-gas",
    title: "Ethanol-free gas in North Carolina",
    description: "E0 fuel for boats and small engines across North Carolina.",
    body: [
      "North Carolina has strong E0 coverage near lakes, coastlines, and mountain recreation areas.",
      "Browse NC stations on the state directory or open the map filtered to NC.",
      "Set a fuel alert near your home marina or storage lot to catch availability changes.",
    ],
    mapQuery: "state=NC",
  },
] as const;

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
