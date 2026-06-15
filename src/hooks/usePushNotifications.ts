"use client";

import { useCallback, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function usePushNotifications() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const subscribe = useCallback(async () => {
    if (!publicKey) {
      setPushError("Push notifications are not configured on this server.");
      return false;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushError("Push notifications are not supported in this browser.");
      return false;
    }

    setPushLoading(true);
    setPushError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushError("Notification permission denied.");
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to register push");
      }

      setPushEnabled(true);
      return true;
    } catch (error) {
      setPushError(
        error instanceof Error ? error.message : "Failed to enable push"
      );
      return false;
    } finally {
      setPushLoading(false);
    }
  }, [publicKey]);

  const unsubscribe = useCallback(async () => {
    setPushLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      await fetch("/api/push/subscribe", { method: "DELETE" });
      setPushEnabled(false);
    } finally {
      setPushLoading(false);
    }
  }, []);

  return {
    pushEnabled,
    pushLoading,
    pushError,
    pushAvailable: Boolean(publicKey),
    subscribe,
    unsubscribe,
  };
}
