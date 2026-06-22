import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminClient } from "./AdminClient";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const secret = process.env.ADMIN_SECRET?.trim();

  if (secret) {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifyAdminSessionCookie(session, secret)) {
      return <AdminLoginGate />;
    }
  }

  return <AdminClient sessionAuthenticated={Boolean(secret)} />;
}
