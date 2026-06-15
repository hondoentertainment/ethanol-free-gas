import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ethanol-Free Fuel Finder",
    short_name: "E0 Finder",
    description:
      "Find ethanol-free (E0) gasoline for boats, classic cars, and small engines.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0284c7",
    icons: [
      {
        src: "/globe.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
