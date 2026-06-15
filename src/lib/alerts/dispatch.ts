import { createServiceClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { sendWebPush } from "@/lib/push/web-push";
import { haversineMiles } from "@/lib/utils/geo";
import type { AlertType } from "@/lib/types/alerts";
import type { VerificationStatus } from "@/lib/types/station";
import { getSiteUrl } from "@/lib/site-url";

export interface NotifyParams {
  stationId: string;
  stationName: string;
  alertType: AlertType;
  verificationStatus?: VerificationStatus;
  target: { lat: number; lng: number };
}

interface SubscriptionRow {
  user_id: string;
  lat: number;
  lng: number;
  radius_miles: number;
  alert_types: AlertType[];
  push_endpoint: string | null;
  push_p256dh: string | null;
  push_auth: string | null;
  email: string | null;
}

const ALERT_COPY: Record<
  AlertType,
  (name: string) => { title: string; body: string }
> = {
  new_station: (name) => ({
    title: "New E0 station nearby",
    body: `${name} was added near your alert zone.`,
  }),
  unavailable: (name) => ({
    title: "E0 reported unavailable",
    body: `${name} was marked out of ethanol-free fuel.`,
  }),
  available: (name) => ({
    title: "E0 fuel available",
    body: `${name} was verified as having ethanol-free fuel.`,
  }),
};

export async function dispatchFuelAlerts(
  params: NotifyParams,
  excludeUserId?: string | null
): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) return 0;

  const { data: subscriptions, error } = await supabase
    .from("fuel_alert_subscriptions")
    .select(
      "user_id, lat, lng, radius_miles, alert_types, push_endpoint, push_p256dh, push_auth, email"
    );

  if (error || !subscriptions?.length) return 0;

  const copy =
    params.verificationStatus === "closed"
      ? {
          title: "Station reported closed",
          body: `${params.stationName} was reported as closed or no longer at this location.`,
        }
      : ALERT_COPY[params.alertType](params.stationName);
  const stationUrl = `/station/${params.stationId}`;
  const rows: {
    user_id: string;
    title: string;
    body: string;
    station_id: string;
    alert_type: AlertType;
  }[] = [];

  const pushTargets: SubscriptionRow[] = [];

  for (const sub of subscriptions as SubscriptionRow[]) {
    if (excludeUserId && sub.user_id === excludeUserId) continue;
    if (!sub.alert_types?.includes(params.alertType)) continue;

    const distance = haversineMiles(
      sub.lat,
      sub.lng,
      params.target.lat,
      params.target.lng
    );
    if (distance > Number(sub.radius_miles)) continue;

    rows.push({
      user_id: sub.user_id,
      title: copy.title,
      body: copy.body,
      station_id: params.stationId,
      alert_type: params.alertType,
    });

    if (sub.push_endpoint && sub.push_p256dh && sub.push_auth) {
      pushTargets.push(sub);
    }
  }

  if (rows.length === 0) return 0;

  const { error: insertError } = await supabase
    .from("user_notifications")
    .insert(rows);

  if (insertError) return 0;

  await Promise.all(
    pushTargets.map((sub) =>
      sendWebPush(
        {
          endpoint: sub.push_endpoint!,
          keys: { p256dh: sub.push_p256dh!, auth: sub.push_auth! },
        },
        { title: copy.title, body: copy.body, url: stationUrl }
      )
    )
  );

  const emailTargets = (subscriptions as SubscriptionRow[]).filter((sub) => {
    if (excludeUserId && sub.user_id === excludeUserId) return false;
    if (!sub.email || !sub.alert_types?.includes(params.alertType)) return false;
    const distance = haversineMiles(
      sub.lat,
      sub.lng,
      params.target.lat,
      params.target.lng
    );
    return distance <= Number(sub.radius_miles);
  });

  await Promise.all(
    emailTargets.map((sub) =>
      sendEmail({
        to: sub.email!,
        subject: copy.title,
        html: `<p>${copy.body}</p><p><a href="${getSiteUrl()}${stationUrl}">View station</a></p>`,
      })
    )
  );

  return rows.length;
}
