import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_session";

export function adminSessionToken(secret: string): string {
  return createHash("sha256").update(`admin:${secret}`).digest("hex");
}

export function verifyAdminSessionCookie(
  cookieValue: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret || !cookieValue) return false;
  const expected = adminSessionToken(secret);
  try {
    const a = Buffer.from(cookieValue);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE };
