"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

export function NotificationBell() {
  const { user } = useUser();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      body: string;
      station_id: string | null;
      created_at: string;
    }[]
  >([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [alertsRes, notifRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/notifications"),
      ]);
      const alertsData = await alertsRes.json();
      const notifData = await notifRes.json();
      setUnread(alertsData.unread_count ?? 0);
      setNotifications(notifData.notifications ?? []);
    }

    load();
    const interval = window.setInterval(load, 60000);
    return () => window.clearInterval(interval);
  }, [user]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all_read: true }),
    });
    setUnread(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-50"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h16a1 1 0 00.707-1.707L20 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
            <p className="text-sm font-semibold text-zinc-900">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-sky-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-3 py-4 text-sm text-zinc-500">No notifications yet.</li>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="border-b border-zinc-50 px-3 py-2 text-sm last:border-0"
                >
                  <p className="font-medium text-zinc-800">{notification.title}</p>
                  <p className="text-xs text-zinc-600">{notification.body}</p>
                  {notification.station_id && (
                    <Link
                      href={`/station/${notification.station_id}`}
                      className="mt-1 inline-block text-xs font-medium text-sky-700"
                      onClick={() => setOpen(false)}
                    >
                      View station →
                    </Link>
                  )}
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-zinc-100 px-3 py-2">
            <Link
              href="/alerts"
              className="text-xs font-medium text-sky-700"
              onClick={() => setOpen(false)}
            >
              Manage fuel alerts →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
