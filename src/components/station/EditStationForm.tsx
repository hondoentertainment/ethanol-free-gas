"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import type { Station, StationClassification } from "@/lib/types/station";

export function EditStationForm({ station }: { station: Station }) {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: station.name,
    address: station.address,
    city: station.city,
    state: station.state,
    zip: station.zip ?? "",
    classification: station.classification,
    fuel_type: station.fuel_type,
    ethanol_percent: String(station.ethanol_percent),
    phone: station.phone ?? "",
  });

  const canEdit =
    user &&
    station.submitted_by &&
    user.id === station.submitted_by;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/stations/${station.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ethanol_percent: Number(form.ethanol_percent),
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        setMessage("Sign in to edit this station.");
        return;
      }
      if (response.status === 403) {
        setMessage("You can only edit stations you submitted.");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update station");
      }

      router.push(`/station/${station.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return <p className="text-sm text-zinc-500">Checking sign-in…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm text-amber-900">Sign in to edit station details.</p>
        <Link
          href={`/auth/login?next=/station/${station.id}/edit`}
          className="mt-3 inline-block text-sm font-medium text-sky-700"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
        Only the contributor who added this station can edit it.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Station name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Address</span>
          <input
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">City</span>
          <input
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">State</span>
          <input
            required
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">ZIP</span>
          <input
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Classification</span>
          <select
            value={form.classification}
            onChange={(e) =>
              setForm({
                ...form,
                classification: e.target.value as StationClassification,
              })
            }
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="car">Car station</option>
            <option value="boat">Boat dock</option>
            <option value="dual">Car & boat</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Fuel type</span>
          <input
            value={form.fuel_type}
            onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Phone</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save changes"}
      </button>

      {message && (
        <p className="text-sm text-zinc-600" role="status">{message}</p>
      )}
    </form>
  );
}
