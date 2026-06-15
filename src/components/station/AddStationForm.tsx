"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import type { StationClassification } from "@/lib/types/station";

export function AddStationForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    lat: "",
    lng: "",
    classification: "car" as StationClassification,
    fuel_type: "E0 Gasoline",
    ethanol_percent: "0",
    phone: "",
  });

  async function geocodeAddress() {
    const query = `${form.address}, ${form.city}, ${form.state} ${form.zip}`.trim();
    if (!query) return;

    const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    const hit = data.suggestions?.[0];
    if (hit) {
      setForm((f) => ({
        ...f,
        lat: String(hit.lat),
        lng: String(hit.lng),
        city: hit.city ?? f.city,
        state: hit.state ?? f.state,
        zip: hit.zip ?? f.zip,
      }));
      setMessage("Address located on map — confirm coordinates below.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: Number(form.lat),
          lng: Number(form.lng),
          ethanol_percent: Number(form.ethanol_percent),
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        setMessage("Sign in to add a station.");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add station");
      }

      router.push(`/station/${data.station.id}`);
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
        <p className="text-sm text-amber-900">
          Sign in to add ethanol-free fuel stations to the map.
        </p>
        <Link
          href="/auth/login?next=/station/add"
          className="mt-3 inline-block text-sm font-medium text-sky-700"
        >
          Sign in →
        </Link>
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
          <span className="font-medium text-zinc-700">Latitude</span>
          <input
            required
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Longitude</span>
          <input
            required
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={geocodeAddress}
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Locate address
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add station"}
        </button>
      </div>

      {message && (
        <p className="text-sm text-zinc-600" role="status">{message}</p>
      )}
    </form>
  );
}
