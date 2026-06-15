"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator &&
          (navigator as Navigator & { standalone?: boolean }).standalone === true)
    );

    const dismissedAt = localStorage.getItem("e0-install-dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("e0-install-dismissed", String(Date.now()));
  }

  if (isStandalone || dismissed || !deferredPrompt) return null;

  return (
    <div className="border-b border-sky-200 bg-sky-50 px-4 py-2">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-sm text-sky-900">
          Install E0 Finder for quick access on your phone.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={install}
            className="rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-2 py-1 text-xs text-sky-800 hover:bg-sky-100"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
