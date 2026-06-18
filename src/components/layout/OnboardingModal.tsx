"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STATION_COLORS } from "@/lib/map/colors";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "e0-onboarding-done";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, []);

  const dialogRef = useFocusTrap<HTMLDivElement>(open, close);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 animate-fade-in sm:items-center"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-sheet-up safe-bottom"
      >
        <h2 id="onboarding-title" className="text-lg font-semibold text-zinc-900">
          Welcome to E0 Finder
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-600">
          <li className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: STATION_COLORS.car }}
              aria-hidden="true"
            />
            <span><strong>Blue</strong> pins — car stations</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: STATION_COLORS.boat }}
              aria-hidden="true"
            />
            <span><strong>Teal</strong> — marina / boat fuel</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: STATION_COLORS.dual }}
              aria-hidden="true"
            />
            <span><strong>Purple</strong> — dual car + boat access</span>
          </li>
          <li>Verify stations to keep data fresh — aim for <strong>5 verifications</strong> to climb the leaderboard</li>
          <li>Use <strong>Route search</strong> to find E0 along your trip</li>
        </ul>
        <p className="mt-4 text-sm text-zinc-600">
          <Link href="/docs" className="font-medium text-sky-700 hover:text-sky-800">
            Read the full help center →
          </Link>
        </p>
        <Button onClick={close} className="mt-6 w-full">
          Got it
        </Button>
      </div>
    </div>
  );
}
