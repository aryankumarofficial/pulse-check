export type MonitorType = "website" | "api" | "ai";
export type MonitorStatus = "up" | "down" | "degraded" | "unknown";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export interface Monitor {
  id: string;
  tenant_id: string;
  created_by: string;
  name: string;
  url: string;
  type: MonitorType;
  method: HttpMethod;
  headers: Record<string, string>;
  body: string | null;
  expected_status: number;
  timeout_ms: number;
  is_active: boolean;
  current_status: MonitorStatus;
  last_checked_at: string | null;
  last_response_time: number | null;
  uptime_percentage: number;
  consecutive_failures: number;
  created_at: string;
  updated_at: string;
}

export interface MonitorCheck {
  id: string;
  monitor_id: string;
  status_code: number | null;
  response_time_ms: number | null;
  is_up: boolean;
  error_message: string | null;
  ssl_valid: boolean | null;
  ssl_expires_at: string | null;
  region: string;
  checked_at: string;
}

export interface MonitorSslInfo {
  id: string;
  monitor_id: string;
  issuer: string | null;
  subject: string | null;
  valid_from: string | null;
  valid_to: string | null;
  fingerprint: string | null;
  is_valid: boolean;
  last_checked_at: string;
}

export interface CreateMonitorInput {
  name: string;
  url: string;
  type: MonitorType;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  expected_status?: number;
  timeout_ms?: number;
}

export interface UpdateMonitorInput {
  name?: string;
  url?: string;
  type?: MonitorType;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  expected_status?: number;
  timeout_ms?: number;
  is_active?: boolean;
}
