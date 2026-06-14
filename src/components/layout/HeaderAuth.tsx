"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

export function HeaderAuth() {
  const { user, loading } = useUser();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return (
      <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-500">
        …
      </span>
    );
  }

  if (user) {
    const label = user.email?.split("@")[0] ?? "Account";

    return (
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden max-w-[8rem] truncate text-sm text-zinc-600 sm:inline">
          {label}
        </span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700"
    >
      Sign in
    </Link>
  );
}
