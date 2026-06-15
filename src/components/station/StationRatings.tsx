"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

const FIELDS = [
  { key: "availability", label: "Fuel availability" },
  { key: "access", label: "Ease of access" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "service", label: "Service" },
] as const;

type ScoreKey = typeof FIELDS[number]["key"];

interface Summary {
  count: number;
  availability: number;
  access: number;
  cleanliness: number;
  service: number;
  overall: number;
}

export function StationRatings({ stationId }: { stationId: string }) {
  const { user } = useUser();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    availability: 4,
    access: 4,
    cleanliness: 4,
    service: 4,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/stations/${stationId}/ratings`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        if (data.user_rating) {
          setScores({
            availability: data.user_rating.availability,
            access: data.user_rating.access,
            cleanliness: data.user_rating.cleanliness,
            service: data.user_rating.service,
          });
        }
      });
  }, [stationId]);

  async function submit() {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/stations/${stationId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scores),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save rating");
      setMessage("Rating saved — thanks!");
      const refresh = await fetch(`/api/stations/${stationId}/ratings`);
      const refreshed = await refresh.json();
      setSummary(refreshed.summary);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-900">Fuel quality ratings</h2>

      {summary && (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
          <p className="font-medium text-zinc-800">
            {summary.overall.toFixed(1)} / 5 average · {summary.count} ratings
          </p>
          <ul className="mt-2 space-y-1 text-zinc-600">
            {FIELDS.map((f) => (
              <li key={f.key}>
                {f.label}: {summary[f.key].toFixed(1)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user && (
        <div className="mt-4 space-y-3">
          {FIELDS.map((field) => (
            <label key={field.key} className="block text-sm text-zinc-700">
              {field.label}: {scores[field.key]}
              <input
                type="range"
                min={1}
                max={5}
                value={scores[field.key]}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [field.key]: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Submit your rating"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-2 text-sm text-zinc-600" role="status">{message}</p>
      )}
    </div>
  );
}
