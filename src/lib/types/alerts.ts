export type AlertType = "new_station" | "unavailable" | "available";

export interface FuelAlertSubscription {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  radius_miles: number;
  alert_types: AlertType[];
  push_endpoint: string | null;
  created_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  station_id: string | null;
  alert_type: AlertType | null;
  read_at: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  contributor_points: number;
  badges: string[];
}
