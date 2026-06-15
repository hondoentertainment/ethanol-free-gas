import { createServiceClient } from "@/lib/supabase/admin";
import { haversineMiles } from "@/lib/utils/geo";
import type { AlertType } from "@/lib/types/alerts";

export interface NotifyParams {
  stationId: string;
  stationName: string;
  alertType: AlertType;
  target: { lat: number; lng: number };
}

interface SubscriptionRow {
  user_id: string;
  lat: number;
  lng: number;
  radius_miles: number;
  alert_types: AlertType[];
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
    .select("user_id, lat, lng, radius_miles, alert_types");

  if (error || !subscriptions?.length) return 0;

  const copy = ALERT_COPY[params.alertType](params.stationName);
  const rows: {
    user_id: string;
    title: string;
    body: string;
    station_id: string;
    alert_type: AlertType;
  }[] = [];

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
  }

  if (rows.length === 0) return 0;

  const { error: insertError } = await supabase
    .from("user_notifications")
    .insert(rows);

  return insertError ? 0 : rows.length;
}
