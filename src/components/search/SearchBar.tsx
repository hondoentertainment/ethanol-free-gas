"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StationClassification } from "@/lib/types/station";

export interface SearchFilters {
  q: string;
  zip: string;
  city: string;
  state: string;
  classification: StationClassification | "";
}

export interface GeocodeSuggestion {
  id: string;
  label: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zip?: string;
}

interface SearchBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onUseLocation: () => void;
  onSelectLocation?: (suggestion: GeocodeSuggestion) => void;
  loading?: boolean;
  classificationChips?: React.ReactNode;
  routeSearch?: React.ReactNode;
}

export function SearchBar({
  filters,
  onChange,
  onSearch,
  onUseLocation,
  onSelectLocation,
  loading,
  classificationChips,
  routeSearch,
}: SearchBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = "geocode-suggestions-list";
  const [activeIndex, setActiveIndex] = useState(-1);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query.trim())}`
      );
      const data = await response.json();
      setSuggestions(data.suggestions ?? []);
      setSuggestionsOpen((data.suggestions ?? []).length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setGeocoding(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (filters.q.trim().length >= 2) {
        fetchSuggestions(filters.q);
      } else {
        setSuggestions([]);
        setSuggestionsOpen(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filters.q, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: GeocodeSuggestion) {
    const nextFilters: SearchFilters = {
      ...filters,
      q: suggestion.label,
      city: suggestion.city ?? filters.city,
      state: suggestion.state ?? filters.state,
      zip: suggestion.zip ?? filters.zip,
    };
    onChange(nextFilters);
    setSuggestionsOpen(false);
    setActiveIndex(-1);
    onSelectLocation?.(suggestion);
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 top-0 z-20 mx-auto max-w-lg px-3 pt-3"
    >
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg shadow-zinc-900/5 backdrop-blur-sm">
        <div className="relative flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={filters.q}
              onChange={(e) => onChange({ ...filters, q: e.target.value })}
              onFocus={() =>
                suggestions.length > 0 && setSuggestionsOpen(true)
              }
              placeholder="Search city, ZIP, or address"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (activeIndex >= 0 && suggestions[activeIndex]) {
                    selectSuggestion(suggestions[activeIndex]);
                    return;
                  }
                  setSuggestionsOpen(false);
                  onSearch();
                }
                if (e.key === "Escape") {
                  setSuggestionsOpen(false);
                  setActiveIndex(-1);
                }
                if (e.key === "ArrowDown" && suggestions.length > 0) {
                  e.preventDefault();
                  setSuggestionsOpen(true);
                  setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
                }
                if (e.key === "ArrowUp" && suggestions.length > 0) {
                  e.preventDefault();
                  setSuggestionsOpen(true);
                  setActiveIndex((i) => Math.max(i - 1, 0));
                }
              }}
              role="combobox"
              aria-expanded={suggestionsOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
              }
            />
            {suggestionsOpen && suggestions.length > 0 && (
              <ul
                id={listboxId}
                className="absolute inset-x-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                  >
                    <button
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 ${
                        index === activeIndex
                          ? "bg-sky-50 text-sky-900"
                          : "text-zinc-800"
                      }`}
                    >
                      {suggestion.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSuggestionsOpen(false);
              onSearch();
            }}
            disabled={loading}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {geocoding && filters.q.length >= 2 && (
          <p className="mt-1 text-xs text-zinc-500">Finding locations…</p>
        )}

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

        {classificationChips && (
          <div className="mt-2">{classificationChips}</div>
        )}

        {routeSearch}

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
