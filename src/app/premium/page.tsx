"use client";

import Link from "next/link";
import { useState } from "react";

const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

export default function PremiumPage() {
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [stationName, setStationName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  async function startCheckout() {
    setCheckingOut(true);
    setStatus(null);
    try {
      const response = await fetch("/api/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_email: contactEmail || undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      window.location.href = data.url as string;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed");
      setCheckingOut(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          contact_email: contactEmail,
          station_name: stationName,
          message,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to submit");
      setStatus("Thanks — we’ll follow up about premium placement.");
      setBusinessName("");
      setContactEmail("");
      setStationName("");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to submit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Premium listings</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Station owners and marinas can request featured map pins, highlighted profiles, and sponsored placement.
      </p>

      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
        <li>★ Featured pin on the map</li>
        <li>★ Highlighted station profile</li>
        <li>★ Priority in search results</li>
      </ul>

      {STRIPE_ENABLED && (
        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="text-base font-semibold text-zinc-900">
            Activate premium now
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Subscribe online and your listing is upgraded immediately.
          </p>
          <button
            type="button"
            onClick={startCheckout}
            disabled={checkingOut}
            className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {checkingOut ? "Redirecting…" : "Subscribe with card"}
          </button>
          <p className="mt-3 text-xs text-zinc-500">
            Prefer to talk first? Use the inquiry form below.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          Business name
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Contact email
          <input
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Station name (optional)
          <input
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Message
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Tell us about your station or marina…"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Sending…" : "Request premium listing"}
        </button>
        {status && (
          <p className="text-sm text-zinc-600" role="status">{status}</p>
        )}
      </form>
    </div>
  );
}
