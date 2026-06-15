import webpush from "web-push";

export function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() ?? "mailto:support@ethanol-free-gas.vercel.app";

  if (!publicKey || !privateKey) return null;

  return { publicKey, privateKey, subject };
}

export function isPushConfigured(): boolean {
  return getVapidConfig() !== null;
}

export async function sendWebPush(
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  const vapid = getVapidConfig();
  if (!vapid) return false;

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 }
    );
    return true;
  } catch {
    return false;
  }
}
