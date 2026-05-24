export type NotificationType = "downtime" | "recovery" | "ssl_expiry" | "info";

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  monitor_id: string | null;
  incident_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  channel: string;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  monitor_id: string;
  user_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  webhook_url: string | null;
  slack_channel: string | null;
  created_at: string;
  updated_at: string;
}
