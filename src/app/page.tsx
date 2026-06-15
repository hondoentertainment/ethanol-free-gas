import { Suspense } from "react";
import { HomeMapPage } from "@/components/map/HomeMapPage";

export default function Home() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-zinc-500">Loading map…</p>}>
      <HomeMapPage />
    </Suspense>
  );
}
