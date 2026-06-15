"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBadgesForPoints, CONTRIBUTOR_BADGES } from "@/lib/gamification/badges";
import { useUser } from "@/hooks/useUser";

interface ProfileData {
  contributor_points: number;
  display_name: string;
  badges: string[];
}

export function ProfileClient() {
  const { user, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setDisplayName(data.profile.display_name ?? "");
        }
      });
  }, [user]);

  async function saveProfile() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save");
      setProfile(data.profile);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <p className="px-4 py-10 text-sm text-zinc-500">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <p className="text-sm text-zinc-600">Sign in to view your contributor profile.</p>
        <Link href="/auth/login?next=/profile" className="mt-3 text-sm font-medium text-sky-700">
          Sign in →
        </Link>
      </div>
    );
  }

  const points = profile?.contributor_points ?? 0;
  const earned = getBadgesForPoints(points);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Your profile</h1>
      <p className="mt-1 text-sm text-zinc-600">{user.email}</p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-3xl font-bold text-sky-700">{points}</p>
        <p className="text-sm text-zinc-500">contributor points</p>

        <label className="mt-6 block text-sm font-medium text-zinc-700">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            maxLength={40}
          />
        </label>
        <button
          type="button"
          onClick={saveProfile}
          disabled={saving || !displayName.trim()}
          className="mt-3 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message && (
          <p className="mt-2 text-sm text-zinc-600" role="status">{message}</p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Your badges</h2>
        {earned.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Verify or add stations to earn badges.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {earned.map((badge) => (
              <li
                key={badge.id}
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900"
                title={badge.description}
              >
                {badge.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/leaderboard"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          View leaderboard →
        </Link>
        <Link
          href="/alerts"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Fuel alerts →
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-sm font-semibold text-zinc-900">All badges</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {CONTRIBUTOR_BADGES.map((badge) => (
            <li key={badge.id}>
              <span className="font-medium text-zinc-800">{badge.name}</span> —{" "}
              {badge.minPoints}+ pts · {badge.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
