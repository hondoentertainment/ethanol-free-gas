"use client";

import { useEffect, useState } from "react";

interface VerificationStats {
  total_stations: number;
  verifications_this_week: number;
  verified_fresh: number;
  negative_listing: number;
  never_verified: number;
  stale_or_unverified: number;
  verified_percent: number;
  stale_percent: number;
}

interface StationRow {
  id: string;
  name: string;
  city: string;
  state: string;
  is_premium: boolean;
  is_sponsored: boolean;
  address?: string;
}

export function AdminClient({
  sessionAuthenticated = false,
}: {
  sessionAuthenticated?: boolean;
}) {
  const [key, setKey] = useState("");
  const [data, setData] = useState<{
    inquiries: Array<Record<string, unknown>>;
    import_runs: Array<Record<string, unknown>>;
    api_calls: number;
    verification_stats: VerificationStats | null;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<StationRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);

  const canAdmin = Boolean(key) || sessionAuthenticated;

  function adminHeaders(): HeadersInit {
    return key ? { "X-Admin-Key": key } : {};
  }

  useEffect(() => {
    if (sessionAuthenticated) {
      load().catch((e) =>
        setMessage(e instanceof Error ? e.message : "Failed to load dashboard")
      );
    }
  }, [sessionAuthenticated]);

  async function load() {
    const response = await fetch("/api/admin/dashboard", {
      headers: adminHeaders(),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error ?? "Failed");
    setData(json);
  }

  async function searchStations(query?: string) {
    const q = (query ?? searchQ).trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const response = await fetch(
        `/api/admin/stations?q=${encodeURIComponent(q)}`,
        { headers: adminHeaders() }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Search failed");
      setSearchResults(json.stations ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function setPremium(
    stationId: string,
    isPremium: boolean,
    isSponsored = false
  ) {
    await fetch("/api/admin/actions", {
      method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders(),
        },
      body: JSON.stringify({
        station_id: stationId,
        is_premium: isPremium,
        is_sponsored: isSponsored,
      }),
    });
    setMessage("Station updated");
    searchStations();
    load();
  }

  async function resolveInquiry(id: string, stationId?: string) {
    await fetch("/api/admin/actions", {
      method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders(),
        },
      body: JSON.stringify({
        inquiry_id: id,
        status: "resolved",
        promote_station_id: stationId,
      }),
    });
    setMessage(stationId ? "Inquiry resolved and station promoted" : "Inquiry resolved");
    load();
  }

  async function runImport() {
    setImporting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: adminHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Import failed");
      setMessage(
        `Import complete: ${json.stations_upserted ?? 0} stations updated`
      );
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
      <p className="mt-1 text-sm text-zinc-600">
        {sessionAuthenticated
          ? "Signed in with an admin session."
          : "Enter your admin secret to manage premium listings and inquiries."}
      </p>

      {!sessionAuthenticated && (
        <div className="mt-4 flex gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin key"
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => load().catch((e) => setMessage(e.message))}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          >
            Load
          </button>
        </div>
      )}

      {message && <p className="mt-2 text-sm text-zinc-600">{message}</p>}

      {canAdmin && (
        <div className="mt-6 rounded-xl border border-zinc-200 p-4">
          <h2 className="text-lg font-semibold">Station search</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Find a station to mark premium or sponsored.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Name, city, or address"
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => searchStations()}
              disabled={searching || searchQ.trim().length < 2}
              className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {searching ? "…" : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <ul className="mt-3 space-y-2">
              {searchResults.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-zinc-200 p-3 text-sm"
                >
                  <p className="font-medium">{row.name}</p>
                  <p className="text-zinc-600">
                    {row.address ? `${row.address}, ` : ""}
                    {row.city}, {row.state}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Premium: {row.is_premium ? "yes" : "no"} · Sponsored:{" "}
                    {row.is_sponsored ? "yes" : "no"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPremium(row.id, true)}
                      className="text-xs font-medium text-amber-700"
                    >
                      Mark premium
                    </button>
                    <button
                      type="button"
                      onClick={() => setPremium(row.id, false, true)}
                      className="text-xs font-medium text-sky-700"
                    >
                      Mark sponsored
                    </button>
                    <button
                      type="button"
                      onClick={() => setPremium(row.id, false, false)}
                      className="text-xs font-medium text-zinc-500"
                    >
                      Remove badges
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canAdmin && (
        <div className="mt-6 rounded-xl border border-zinc-200 p-4">
          <h2 className="text-lg font-semibold">Data import</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Re-import all stations from pure-gas.org (may take several minutes).
          </p>
          <button
            type="button"
            onClick={runImport}
            disabled={importing}
            className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {importing ? "Importing…" : "Run full import"}
          </button>
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-8">
          {data.verification_stats && (
            <section className="rounded-xl border border-zinc-200 p-4">
              <h2 className="text-lg font-semibold">Data quality</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                  <p className="text-xs font-medium uppercase text-emerald-800">
                    Freshly verified
                  </p>
                  <p className="text-xl font-semibold text-emerald-950">
                    {data.verification_stats.verified_percent}%
                  </p>
                  <p className="text-xs text-emerald-800">
                    {data.verification_stats.verified_fresh.toLocaleString()} of{" "}
                    {data.verification_stats.total_stations.toLocaleString()}{" "}
                    stations
                  </p>
                </div>
                <div className="rounded-lg bg-orange-50 px-3 py-2 text-sm">
                  <p className="text-xs font-medium uppercase text-orange-800">
                    Stale or unverified
                  </p>
                  <p className="text-xl font-semibold text-orange-950">
                    {data.verification_stats.stale_percent}%
                  </p>
                  <p className="text-xs text-orange-800">
                    {data.verification_stats.stale_or_unverified.toLocaleString()}{" "}
                    need community checks
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                <li>
                  Verifications this week:{" "}
                  {data.verification_stats.verifications_this_week.toLocaleString()}
                </li>
                <li>
                  Never verified:{" "}
                  {data.verification_stats.never_verified.toLocaleString()}
                </li>
                <li>
                  Negative reports (closed / no E0 / incorrect):{" "}
                  {data.verification_stats.negative_listing.toLocaleString()}
                </li>
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold">Premium inquiries</h2>
            <ul className="mt-3 space-y-2">
              {data.inquiries.map((row) => (
                <li
                  key={String(row.id)}
                  className="rounded-xl border border-zinc-200 p-3 text-sm"
                >
                  <p className="font-medium">{String(row.business_name)}</p>
                  <p className="text-zinc-600">{String(row.contact_email)}</p>
                  {row.station_name != null && String(row.station_name) && (
                    <p className="text-zinc-600">
                      Station: {String(row.station_name)}
                    </p>
                  )}
                  {row.message != null && String(row.message) && (
                    <p className="mt-1 text-xs text-zinc-500">{String(row.message)}</p>
                  )}
                  <p className="text-xs text-zinc-500">Status: {String(row.status)}</p>
                  {row.status === "pending" && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => resolveInquiry(String(row.id))}
                        className="text-xs font-medium text-sky-700"
                      >
                        Mark resolved
                      </button>
                      {row.station_name != null && String(row.station_name) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQ(String(row.station_name));
                            searchStations(String(row.station_name));
                          }}
                          className="text-xs font-medium text-amber-700"
                        >
                          Search station to promote
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Import runs</h2>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              {data.import_runs.map((run) => (
                <li key={String(run.id)}>
                  {String(run.status)} · {String(run.stations_upserted)} stations ·{" "}
                  {new Date(String(run.started_at)).toLocaleString()}
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-zinc-500">API calls logged: {data.api_calls}</p>
        </div>
      )}
    </div>
  );
}
