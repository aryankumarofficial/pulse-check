export type IncidentStatus = "ongoing" | "resolved";
export type IncidentSeverity = "minor" | "major" | "critical";

export interface Incident {
  id: string;
  monitor_id: string;
  tenant_id: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  started_at: string;
  resolved_at: string | null;
  duration_seconds: number | null;
  root_cause: string | null;
  consecutive_failures: number;
  created_at: string;
  updated_at: string;
  monitors?: {
    name: string;
    url: string;
  };
}

export type IncidentEventType =
  | "detected"
  | "escalated"
  | "acknowledged"
  | "resolved";

export interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: IncidentEventType;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
