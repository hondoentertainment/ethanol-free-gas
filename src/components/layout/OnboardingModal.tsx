"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "e0-onboarding-done";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-zinc-900">Welcome to E0 Finder</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-600">
          <li>🟢 <strong>Green</strong> pins — car stations</li>
          <li>🔵 <strong>Blue</strong> — marina / boat fuel</li>
          <li>🟣 <strong>Purple</strong> — dual car + boat access</li>
          <li>Verify stations to keep data fresh — aim for <strong>5 verifications</strong> to climb the leaderboard</li>
          <li>Use <strong>Route search</strong> to find E0 along your trip</li>
        </ul>
        <p className="mt-4 text-sm text-zinc-600">
          <Link href="/docs" className="font-medium text-sky-700 hover:text-sky-800">
            Read the full help center →
          </Link>
        </p>
        <button
          type="button"
          onClick={close}
          className="mt-6 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
