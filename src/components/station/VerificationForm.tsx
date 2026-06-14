"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import type { VerificationStatus } from "@/lib/types/station";

interface VerificationFormProps {
  stationId: string;
  onVerified?: () => void;
}

export function VerificationForm({ stationId, onVerified }: VerificationFormProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitVerification(status: VerificationStatus) {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ station_id: stationId, status }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setMessage("Sign in to report station updates.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit verification");
      }

      setMessage("Thanks — your update was recorded.");
      onVerified?.();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <p className="text-sm text-zinc-500">Checking sign-in status…</p>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-900">
          Sign in to verify fuel availability and help keep listings accurate.
        </p>
        <Link
          href={`/auth/login?next=${encodeURIComponent(pathname)}`}
          className="mt-2 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          Sign in to report →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-700">
        Report availability
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitVerification("available")}
          className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Fuel available
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitVerification("unavailable")}
          className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
        >
          Out of E0
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitVerification("incorrect")}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Wrong info
        </button>
      </div>
      {message && (
        <p className="mt-2 text-sm text-zinc-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
