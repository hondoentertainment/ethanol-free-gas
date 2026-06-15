"use client";

import { useEffect, useState } from "react";
import { getCachedStations } from "@/lib/offline/station-cache";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [hasCache, setHasCache] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    setHasCache(Boolean(getCachedStations()));

    function handleOffline() {
      setOffline(true);
      setHasCache(Boolean(getCachedStations()));
    }
    function handleOnline() {
      setOffline(false);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
      role="status"
    >
      You&apos;re offline.
      {hasCache
        ? " Showing cached station data from your last visit."
        : " Station search requires a connection."}
    </div>
  );
}
