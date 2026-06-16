import { NextRequest } from "next/server";

export function verifyCronSecret(request: NextRequest): boolean {
  const secret =
    process.env.CRON_SECRET?.trim() ?? process.env.IMPORT_CRON_KEY?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization")?.trim();
  const queryKey = request.nextUrl.searchParams.get("key")?.trim();
  return auth === `Bearer ${secret}` || queryKey === secret;
}

export function verifyAdminSecret(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("x-admin-key");
  return header === secret;
}
