export interface DocSubsection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  category: DocCategory;
  subsections: DocSubsection[];
  relatedSlugs?: string[];
}

export type DocCategory =
  | "Getting started"
  | "Map & search"
  | "Community"
  | "Account"
  | "Alerts"
  | "Station owners"
  | "Reference";

export const DOC_CATEGORIES: DocCategory[] = [
  "Getting started",
  "Map & search",
  "Community",
  "Account",
  "Alerts",
  "Station owners",
  "Reference",
];

export const DOCS: DocPage[] = [
  {
    slug: "getting-started",
    title: "Getting started with E0 Finder",
    description:
      "Learn what E0 Finder is, how to open the map, and how to find your first ethanol-free station.",
    category: "Getting started",
    subsections: [
      {
        paragraphs: [
          "E0 Finder is a free map for locating ethanol-free (E0) gasoline across the United States and Canada. The app is mobile-first and works in any modern browser — you can also install it to your home screen for quick access.",
          "Most listings come from pure-gas.org and community contributions. Sign in to verify stations, add new locations, and earn contributor points.",
        ],
      },
      {
        heading: "Find stations near you",
        steps: [
          "Open the map at the home page.",
          "Tap **Use my location** in the search bar (or search by city, ZIP, or address).",
          "Tap a pin to open station details, or open **List** to browse nearby results.",
          "Use **Filter nearby** to limit results to within 50 miles of your location.",
        ],
      },
      {
        heading: "Install on your phone",
        bullets: [
          "**iOS (Safari):** Share → Add to Home Screen.",
          "**Android (Chrome):** Install app when prompted, or Menu → Install app.",
          "Installed copies cache your last station search for offline viewing.",
        ],
      },
    ],
    relatedSlugs: ["map-and-search", "map-legend", "offline-and-pwa"],
  },
  {
    slug: "map-and-search",
    title: "Map, search, and filters",
    description:
      "Search by location, filter by station type, load nationwide data, and understand map controls.",
    category: "Map & search",
    subsections: [
      {
        paragraphs: [
          "The map shows ethanol-free stations as color-coded pins. Use the search bar for text search, geocoding autocomplete, and route planning.",
        ],
      },
      {
        heading: "Search options",
        bullets: [
          "**Address / place** — autocomplete powered by Mapbox when configured; falls back to text filters.",
          "**City and state** — filter the loaded station set.",
          "**ZIP code** — prefix match on station ZIP.",
          "**Use my location** — centers the map and loads regional stations.",
        ],
      },
      {
        heading: "Classification filters",
        bullets: [
          "**Car** — roadside gas stations.",
          "**Boat** — marina fuel docks (may not be reachable by car).",
          "**Dual** — serves both automotive and marine customers.",
        ],
      },
      {
        heading: "Map controls",
        bullets: [
          "**Load all stations** — fetches the full nationwide dataset (~17,000+ listings).",
          "**Filter nearby** — limits list and sorting to within 50 miles.",
          "**Show closed / no E0** — toggles visibility of community-reported inactive listings (hidden by default).",
          "**Fit all pins** — zooms the map to show current results.",
          "**List** — opens a scrollable drawer of matching stations.",
          "Pan the map to load stations in a new region (debounced regional fetch when not in nationwide mode).",
        ],
      },
    ],
    relatedSlugs: ["route-search", "map-legend", "station-details"],
  },
  {
    slug: "map-legend",
    title: "Map pin colors and badges",
    description:
      "What each pin color and station badge means on the map and in the station list.",
    category: "Map & search",
    subsections: [
      {
        heading: "Pin colors",
        bullets: [
          "**Blue** — car station (road accessible).",
          "**Teal** — boat / marina fuel dock.",
          "**Purple** — dual car and boat access.",
          "**Red** — reported: no longer sells E0.",
          "**Gray** — reported: closed or no longer at this address.",
          "**Orange** — needs verification (stale or never verified).",
          "**Amber** — premium or sponsored listing.",
        ],
      },
      {
        heading: "Listing status badges",
        bullets: [
          "**Active** — latest community report confirms E0 is available.",
          "**No longer sells E0** — open location but ethanol-free fuel reported unavailable.",
          "**Closed** — business closed or removed from address.",
          "**Needs review** — incorrect address, duplicate, or other data issue flagged.",
        ],
      },
      {
        heading: "Verification freshness",
        bullets: [
          "**Verified today / this week / this month** — based on the latest “still sells E0” report.",
          "**Needs verification** — no recent confirmation (90+ days) or never verified.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "map-and-search"],
  },
  {
    slug: "route-search",
    title: "Route search",
    description:
      "Find ethanol-free fuel stops along a driving route for RV trips, towing, and road trips.",
    category: "Map & search",
    subsections: [
      {
        paragraphs: [
          "Route search finds E0 stations within a corridor along your driving path between an origin and destination.",
        ],
        steps: [
          "Open **Route search** in the search panel on the map.",
          "Enter origin and destination (address autocomplete or map selection).",
          "Optionally filter by car, boat, or dual classification.",
          "Submit to draw the route and show stations sorted by distance from the route.",
          "Tap a station for details or share the route URL with travel companions.",
        ],
      },
      {
        heading: "Tips",
        bullets: [
          "Requires Mapbox for full routing; without it, route features may be limited.",
          "Stations show **distance from route** in miles on cards and the bottom sheet.",
          "Combine route search with **Filter nearby** off — route mode uses corridor results, not radius filter.",
        ],
      },
    ],
    relatedSlugs: ["map-and-search", "station-details"],
  },
  {
    slug: "station-details",
    title: "Station detail pages",
    description:
      "Directions, phone, hours, photos, ratings, and sharing a station listing.",
    category: "Map & search",
    subsections: [
      {
        paragraphs: [
          "Tap any station pin or list item to open its detail page or bottom sheet. Full detail pages include everything you need to visit a station.",
        ],
      },
      {
        heading: "On each station page",
        bullets: [
          "**Directions** — open in Google Maps, Apple Maps, or Waze.",
          "**Classification** — car, boat, or dual.",
          "**Fuel type and ethanol %** — typically E0 gasoline at 0% ethanol.",
          "**Phone and hours** — when provided in the listing.",
          "**Photos** — community-uploaded images of pumps and signage.",
          "**Ratings** — availability, access, cleanliness, and service scores.",
          "**Share** — copy a link to the station.",
        ],
      },
      {
        heading: "Status banners",
        paragraphs: [
          "If a station was reported closed, without E0, or incorrect, a colored banner appears at the top of the page. You can submit a newer report from the verification form below.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "photos-and-ratings"],
  },
  {
    slug: "verifying-stations",
    title: "Verifying station listings",
    description:
      "How to confirm E0 availability, report closures, and keep community data accurate.",
    category: "Community",
    subsections: [
      {
        paragraphs: [
          "Verifications are crowdsourced reports from signed-in users. Your reports update listing status, fuel alerts, and contributor points.",
        ],
      },
      {
        heading: "Report types",
        bullets: [
          "**Still sells E0** — fuel is available; refreshes verification date.",
          "**No longer sells E0** — location open but ethanol-free fuel unavailable.",
          "**Closed or no longer there** — business closed or moved.",
          "**Wrong listing details** — incorrect address, duplicate, or other error.",
        ],
      },
      {
        heading: "How to verify",
        steps: [
          "Sign in at **Sign in** (email magic link, Google, GitHub, or Apple when configured).",
          "Open a station detail page or bottom sheet.",
          "Scroll to the verification form and choose the report type.",
          "Add optional notes (helpful for incorrect or closed reports).",
          "Submit — your report becomes the latest status for that station.",
        ],
      },
      {
        heading: "Contributor goal",
        paragraphs: [
          "New contributors are encouraged to complete 5 verifications. Progress appears on your profile and in map nudges when a stale station is nearby.",
        ],
      },
    ],
    relatedSlugs: ["contributor-program", "fuel-alerts", "adding-stations"],
  },
  {
    slug: "adding-stations",
    title: "Adding and editing stations",
    description:
      "Submit new E0 locations or correct existing listing details.",
    category: "Community",
    subsections: [
      {
        paragraphs: [
          "Community-added stations help fill gaps in imported data. Sign in before submitting.",
        ],
      },
      {
        heading: "Add a new station",
        steps: [
          "Go to **Add station** in the header or footer.",
          "Enter name, address, city, state, and coordinates (use the map picker when available).",
          "Choose classification: car, boat, or dual.",
          "Submit — the station appears on the map after save.",
          "Earn **25 contributor points** for new listings.",
        ],
      },
      {
        heading: "Edit a station",
        bullets: [
          "Open a station you submitted and tap **Edit**.",
          "Update address, classification, phone, hours, or fuel details.",
          "Edits require sign-in as the original submitter or admin.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "photos-and-ratings"],
  },
  {
    slug: "photos-and-ratings",
    title: "Photos and ratings",
    description:
      "Upload pump photos and rate stations on availability, access, cleanliness, and service.",
    category: "Community",
    subsections: [
      {
        heading: "Photos",
        steps: [
          "Sign in and open a station detail page.",
          "Use **Upload photo** in the gallery section.",
          "Choose a clear image of the pump, signage, or marina fuel dock.",
          "Earn **10 contributor points** per approved upload.",
        ],
      },
      {
        heading: "Ratings",
        bullets: [
          "Rate **availability**, **ease of access**, **cleanliness**, and **service** (1–5 stars).",
          "One rating set per user per station; you can update your scores.",
          "Aggregate scores appear on the station detail page.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "contributor-program"],
  },
  {
    slug: "contributor-program",
    title: "Contributor points and leaderboard",
    description:
      "Earn points, unlock badges, and climb the community leaderboard.",
    category: "Community",
    subsections: [
      {
        heading: "Point values",
        bullets: [
          "**Verify a station** — 5 points",
          "**Upload a photo** — 10 points",
          "**Add a station** — 25 points",
        ],
      },
      {
        heading: "Badges",
        bullets: [
          "**Scout** — 25+ points (first major contribution)",
          "**Verifier** — 50+ points",
          "**Photographer** — 75+ points",
          "**Explorer** — 100+ points",
          "**Champion** — 250+ points",
          "**Legend** — 500+ points",
        ],
      },
      {
        heading: "Leaderboard",
        paragraphs: [
          "Visit **Leaders** in the header to see top contributors by total points. Your rank and display name appear after you sign in and contribute.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "sign-in-and-account"],
  },
  {
    slug: "fuel-alerts",
    title: "Fuel alerts and notifications",
    description:
      "Get notified when E0 status changes near a location you care about.",
    category: "Alerts",
    subsections: [
      {
        paragraphs: [
          "Fuel alerts watch a geographic zone and notify you about station changes. Sign in is required.",
        ],
      },
      {
        heading: "Create an alert",
        steps: [
          "Go to **Alerts** in the header.",
          "Set a center point (use your location or enter coordinates).",
          "Choose a radius in miles.",
          "Select alert types: new station, E0 available, E0 unavailable.",
          "Save — optionally enable browser push notifications.",
        ],
      },
      {
        heading: "Notification channels",
        bullets: [
          "**In-app** — bell icon in the header shows recent notifications.",
          "**Web push** — browser notifications when you grant permission.",
          "**Email** — sent when Resend is configured on the deployment.",
        ],
      },
      {
        heading: "Closed stations",
        paragraphs: [
          "When a station is reported closed, nearby subscribers with “unavailable” alerts receive a notification about the closure.",
        ],
      },
    ],
    relatedSlugs: ["sign-in-and-account", "verifying-stations"],
  },
  {
    slug: "sign-in-and-account",
    title: "Sign in and your profile",
    description:
      "Authentication options, profile settings, and contributor progress.",
    category: "Account",
    subsections: [
      {
        heading: "Sign-in methods",
        bullets: [
          "**Email magic link** — passwordless link sent to your inbox.",
          "**Google** — when OAuth is configured.",
          "**GitHub** — when OAuth is configured.",
          "**Apple** — when OAuth is configured.",
        ],
      },
      {
        heading: "Your profile",
        bullets: [
          "View contributor points and earned badges.",
          "Set a public **display name** for the leaderboard.",
          "Track progress toward the 5-verification onboarding goal.",
          "Access links to alerts and the leaderboard.",
        ],
      },
      {
        heading: "Why sign in?",
        paragraphs: [
          "Verifications, photos, new stations, ratings, and fuel alerts require an account. Browsing the map and station details works without signing in.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "fuel-alerts"],
  },
  {
    slug: "offline-and-pwa",
    title: "Offline use and installation",
    description:
      "How cached data, offline mode, and the installable PWA work.",
    category: "Getting started",
    subsections: [
      {
        paragraphs: [
          "E0 Finder is a Progressive Web App (PWA). The last successful station search is cached in your browser for offline access.",
        ],
      },
      {
        heading: "Offline behavior",
        bullets: [
          "When offline, the map shows an offline banner.",
          "Cached stations from your last online search remain browsable.",
          "Search, verify, and add flows require connectivity.",
        ],
      },
      {
        heading: "Service worker",
        paragraphs: [
          "A service worker registers on supported browsers for installability and basic asset caching. Clear site data in browser settings to reset the cache.",
        ],
      },
    ],
    relatedSlugs: ["getting-started"],
  },
  {
    slug: "premium-listings",
    title: "Premium and sponsored listings",
    description:
      "Featured placement for station owners, marinas, and fuel retailers.",
    category: "Station owners",
    subsections: [
      {
        paragraphs: [
          "Station owners and marinas can request enhanced visibility on the map and in search results.",
        ],
      },
      {
        heading: "Premium benefits",
        bullets: [
          "Featured pin styling on the map.",
          "Highlighted station profile.",
          "Priority in search and list results.",
          "Sponsored placement option for partners.",
        ],
      },
      {
        heading: "How to apply",
        steps: [
          "Visit **Premium listings** from the footer.",
          "Submit business name, contact email, station name, and a short message.",
          "The team reviews inquiries and enables premium flags via the admin console.",
        ],
      },
    ],
    relatedSlugs: ["api-partners"],
  },
  {
    slug: "api-partners",
    title: "API access for partners",
    description:
      "License the station database for navigation apps, boating platforms, and fleet tools.",
    category: "Station owners",
    subsections: [
      {
        paragraphs: [
          "Partners can query the licensed REST API for station data including classification, verification status, and premium flags.",
        ],
        bullets: [
          "Endpoint: `GET /api/v1/stations`",
          "Authentication: `X-API-Key` header",
          "See the **API** page for full parameters, response fields, and licensing tiers.",
        ],
      },
    ],
    relatedSlugs: ["premium-listings"],
  },
  {
    slug: "browse-by-state",
    title: "Browse stations by state",
    description:
      "State directory pages for SEO and regional discovery across the US and Canada.",
    category: "Map & search",
    subsections: [
      {
        paragraphs: [
          "The **By state** directory lists every state and province with E0 stations. Each state page shows station counts and links to filter the map.",
        ],
      },
      {
        heading: "Canadian provinces",
        paragraphs: [
          "Canadian listings include a country query parameter on state pages. Map filters accept province codes the same way as US states.",
        ],
      },
    ],
    relatedSlugs: ["map-and-search"],
  },
  {
    slug: "data-sources",
    title: "Data sources and attribution",
    description:
      "Where station data comes from and how community reports improve accuracy.",
    category: "Reference",
    subsections: [
      {
        paragraphs: [
          "E0 Finder combines imported directory data with crowdsourced verifications, photos, and new listings.",
        ],
      },
      {
        heading: "Primary import",
        bullets: [
          "Bulk station data from [pure-gas.org](https://www.pure-gas.org/).",
          "Weekly automated re-import on production (Sunday cron).",
          "Upsert on external ID — re-runs update without duplicates.",
        ],
      },
      {
        heading: "Community layer",
        bullets: [
          "User verifications override staleness and listing status.",
          "User-added stations supplement imported coverage.",
          "Photos and ratings add context not available in imports.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [
          "Always confirm fuel availability before traveling. Listing status reflects the latest community report, not a guarantee from E0 Finder or pure-gas.org.",
        ],
      },
    ],
    relatedSlugs: ["verifying-stations", "faq"],
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    description: "Common questions about E0 fuel, the map, and accounts.",
    category: "Reference",
    subsections: [
      {
        heading: "Is E0 the same as recreation fuel?",
        paragraphs: [
          "Often yes. Many stations sell ethanol-free gasoline labeled as recreation fuel, non-ethanol, or marina gas. Always check the pump label.",
        ],
      },
      {
        heading: "Why does a station show “needs verification”?",
        paragraphs: [
          "Imported listings start unverified. A station needs verification when no one has confirmed E0 recently (90+ days) or it was never checked by the community.",
        ],
      },
      {
        heading: "Can I use the map without signing in?",
        paragraphs: [
          "Yes. Search, browse, route planning, and directions work without an account. Sign in to verify, add stations, upload photos, rate, and set alerts.",
        ],
      },
      {
        heading: "Why can’t I find Mapbox route search?",
        paragraphs: [
          "Route geocoding and routing use Mapbox when `NEXT_PUBLIC_MAPBOX_TOKEN` is configured. Without it, the app falls back to OpenStreetMap tiles and may have limited search.",
        ],
      },
      {
        heading: "How do I report a duplicate listing?",
        paragraphs: [
          "Sign in, open the station, and submit **Wrong listing details** with a note explaining the duplicate.",
        ],
      },
      {
        heading: "Is there an iPhone or Android app?",
        paragraphs: [
          "Install the website to your home screen (PWA). Native app store versions may come later via Capacitor or similar wrappers.",
        ],
      },
    ],
    relatedSlugs: ["getting-started", "data-sources", "privacy"],
  },
  {
    slug: "privacy",
    title: "Privacy and data",
    description:
      "What information E0 Finder collects and how it is used.",
    category: "Reference",
    subsections: [
      {
        paragraphs: [
          "E0 Finder is operated as a community fuel map. This page summarizes data practices; contact the site operator for specific requests.",
        ],
      },
      {
        heading: "Account data",
        bullets: [
          "Email address and profile (display name, contributor points) stored in Supabase when you sign in.",
          "Verifications, photos, ratings, and alerts are tied to your user ID.",
        ],
      },
      {
        heading: "Location",
        bullets: [
          "Browser geolocation is used only when you tap **Use my location** — not tracked in the background.",
          "Fuel alert zones store coordinates you explicitly save.",
        ],
      },
      {
        heading: "Analytics",
        bullets: [
          "Vercel Analytics and Speed Insights may collect anonymous usage metrics on production.",
          "API partners have usage logged per license key.",
        ],
      },
      {
        heading: "Third parties",
        bullets: [
          "Supabase — authentication and database.",
          "Mapbox — maps, geocoding, routing when configured.",
          "Resend — transactional email when configured.",
          "pure-gas.org — initial station directory import.",
        ],
      },
    ],
    relatedSlugs: ["faq", "sign-in-and-account"],
  },
];

export function getDoc(slug: string): DocPage | undefined {
  return DOCS.find((d) => d.slug === slug);
}

export function getDocsByCategory(category: DocCategory): DocPage[] {
  return DOCS.filter((d) => d.category === category);
}
