"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function useProfile() {
  const { user } = useUser();
  const [points, setPoints] = useState<number | null>(null);
  const [verificationCount, setVerificationCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setPoints(null);
      setVerificationCount(null);
      return;
    }

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setPoints(data.profile?.contributor_points ?? 0);
        setVerificationCount(data.profile?.verification_count ?? 0);
      })
      .catch(() => {
        setPoints(null);
        setVerificationCount(null);
      });
  }, [user]);

  return { points, verificationCount };
}
