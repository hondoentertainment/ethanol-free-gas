"use client";

import { useState } from "react";
import type { StationClassification } from "@/lib/types/station";

export interface SearchFilters {
  q: string;
  zip: string;
  city: string;
  state: string;
  classification: StationClassification | "";
}

interface SearchBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onUseLocation: () => void;
  loading?: boolean;
}

export function SearchBar({
  filters,
  onChange,
  onSearch,
  onUseLocation,
  loading,
}: SearchBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute inset-x-0 top-0 z-20 mx-auto max-w-lg px-3 pt-3">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg shadow-zinc-900/5 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="Search name, address, or city"
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onUseLocation}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Use my location
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {expanded ? "Hide filters" : "More filters"}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={filters.zip}
              onChange={(e) => onChange({ ...filters, zip: e.target.value })}
              placeholder="ZIP code"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            />
            <input
              type="text"
              value={filters.city}
              onChange={(e) => onChange({ ...filters, city: e.target.value })}
              placeholder="City"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            />
            <input
              type="text"
              value={filters.state}
              onChange={(e) => onChange({ ...filters, state: e.target.value })}
              placeholder="State (e.g. MD)"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            />
            <select
              value={filters.classification}
              onChange={(e) =>
                onChange({
                  ...filters,
                  classification: e.target.value as SearchFilters["classification"],
                })
              }
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            >
              <option value="">All types</option>
              <option value="car">Car stations</option>
              <option value="boat">Boat docks</option>
              <option value="dual">Car & boat</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
