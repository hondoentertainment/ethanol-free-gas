"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(
    authError === "auth" ? "Sign-in failed. Please try again." : null
  );
  const [loading, setLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  async function signInWithEmail() {
    if (!supabaseReady) return;
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    setLoading(false);
    setMessage(
      error
        ? error.message
        : "Check your email for a magic link to sign in."
    );
  }

  async function signInWithGoogle() {
    if (!supabaseReady) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to verify stations and help keep fuel data fresh.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        {!supabaseReady ? (
          <p className="text-sm text-amber-800">
            Supabase is not configured. Copy <code>.env.example</code> to{" "}
            <code>.env.local</code> and add your project URL and anon key.
          </p>
        ) : (
          <>
        <label className="block text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="button"
          onClick={signInWithEmail}
          disabled={loading || !email}
          className="mt-4 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          Email magic link
        </button>

        <div className="my-4 border-t border-zinc-100" />

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          Continue with Google
        </button>

        {message && (
          <p className="mt-4 text-sm text-zinc-600" role="status">
            {message}
          </p>
        )}
          </>
        )}
      </div>
    </div>
  );
}
