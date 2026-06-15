"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import type { VerificationStatus } from "@/lib/types/station";
import { VERIFICATION_STATUS_LABELS } from "@/lib/utils/listing-status";

interface VerificationFormProps {
  stationId: string;
  stationName?: string;
  onVerified?: () => void;
}

type ReportOption = {
  status: VerificationStatus;
  title: string;
  description: string;
  tone: "positive" | "warning" | "danger" | "neutral";
};

const REPORT_OPTIONS: ReportOption[] = [
  {
    status: "available",
    title: "Still sells E0",
    description: "I confirmed ethanol-free fuel is available here.",
    tone: "positive",
  },
  {
    status: "unavailable",
    title: "No longer sells E0",
    description: "The station is open but stopped offering ethanol-free gas.",
    tone: "warning",
  },
  {
    status: "closed",
    title: "Closed or gone",
    description: "Permanently closed, demolished, or no longer at this address.",
    tone: "danger",
  },
  {
    status: "incorrect",
    title: "Wrong listing",
    description: "Duplicate entry, wrong address, or other incorrect details.",
    tone: "neutral",
  },
];

const TONE_CLASSES: Record<ReportOption["tone"], string> = {
  positive:
    "border-emerald-200 bg-emerald-50/80 hover:border-emerald-300 hover:bg-emerald-50",
  warning:
    "border-amber-200 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-50",
  danger: "border-red-200 bg-red-50/80 hover:border-red-300 hover:bg-red-50",
  neutral:
    "border-zinc-200 bg-zinc-50/80 hover:border-zinc-300 hover:bg-zinc-50",
};

export function VerificationForm({
  stationId,
  stationName,
  onVerified,
}: VerificationFormProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<ReportOption | null>(null);
  const [notes, setNotes] = useState("");

  async function submitReport(status: VerificationStatus, reportNotes?: string) {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          station_id: stationId,
          status,
          notes: reportNotes?.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setMessage("Sign in to report station updates.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit report");
      }

      setMessage(`Thanks — recorded: ${VERIFICATION_STATUS_LABELS[status]}.`);
      setPending(null);
      setNotes("");
      onVerified?.();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleOptionClick(option: ReportOption) {
    if (option.status === "available") {
      submitReport("available");
      return;
    }
    setPending(option);
    setNotes("");
    setMessage(null);
  }

  if (authLoading) {
    return <p className="text-sm text-zinc-500">Checking sign-in status…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-950">
          Help keep listings accurate
        </p>
        <p className="mt-1 text-sm text-amber-900">
          Sign in to report if {stationName ?? "this station"} still sells
          ethanol-free fuel, has closed, or has incorrect details.
        </p>
        <Link
          href={`/auth/login?next=${encodeURIComponent(pathname)}`}
          className="mt-3 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          Sign in to report →
        </Link>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
        <p className="text-sm font-semibold text-zinc-900">
          Confirm report: {pending.title}
        </p>
        <p className="mt-1 text-sm text-zinc-600">{pending.description}</p>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Details (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="When did you visit? Any pump numbers or staff notes?"
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => submitReport(pending.status, notes)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setPending(null);
              setNotes("");
            }}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-zinc-900">
        Is this listing still accurate?
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        Tell other drivers and boaters if ethanol-free fuel is still sold here.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {REPORT_OPTIONS.map((option) => (
          <button
            key={option.status}
            type="button"
            disabled={submitting}
            onClick={() => handleOptionClick(option)}
            className={`rounded-2xl border p-3 text-left transition disabled:opacity-50 ${TONE_CLASSES[option.tone]}`}
          >
            <p className="text-sm font-semibold text-zinc-900">{option.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-3 text-sm text-zinc-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
