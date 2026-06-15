"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import type { AlertType } from "@/lib/types/alerts";

interface Subscription {
  id: string;
  lat: number;
  lng: number;
  radius_miles: number;
  alert_types: AlertType[];
}

export function FuelAlertsPanel() {
  const { user, loading: authLoading } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [radius, setRadius] = useState(25);
  const [types, setTypes] = useState<Set<AlertType>>(
    new Set(["new_station", "unavailable", "available"])
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/alerts");
    const data = await response.json();
    setSubscriptions(data.subscriptions ?? []);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  function toggleType(type: AlertType) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  async function addAlertZone() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is required to set an alert zone.");
      return;
    }

    setSaving(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              radius_miles: radius,
              alert_types: Array.from(types),
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Failed to save alert");
          }

          setMessage("Alert zone saved for your current location.");
          load();
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Failed to save alert"
          );
        } finally {
          setSaving(false);
        }
      },
      () => {
        setMessage("Unable to access your location.");
        setSaving(false);
      }
    );
  }

  async function removeAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    load();
  }

  if (authLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm text-amber-900">
          Sign in to get notified when E0 fuel status changes near you.
        </p>
        <Link
          href="/auth/login?next=/alerts"
          className="mt-3 inline-block text-sm font-medium text-sky-700"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">New alert zone</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Get in-app notifications when fuel status changes within range of your
          current location.
        </p>

        <div className="mt-4">
          <label className="text-sm font-medium text-zinc-700">
            Radius: {radius} miles
            <input
              type="range"
              min={5}
              max={100}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["new_station", "New stations"],
              ["available", "Fuel available"],
              ["unavailable", "Out of E0"],
            ] as const
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                types.has(type)
                  ? "bg-sky-600 text-white"
                  : "border border-zinc-200 text-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={addAlertZone}
          disabled={saving || types.size === 0}
          className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Alert my current location"}
        </button>

        {message && (
          <p className="mt-3 text-sm text-zinc-600" role="status">
            {message}
          </p>
        )}
      </div>

      {subscriptions.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Your alert zones</h2>
          <ul className="mt-4 space-y-3">
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-800">
                    {sub.radius_miles} mi radius
                  </p>
                  <p className="text-xs text-zinc-500">
                    {sub.lat.toFixed(4)}, {sub.lng.toFixed(4)} ·{" "}
                    {sub.alert_types.join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAlert(sub.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
