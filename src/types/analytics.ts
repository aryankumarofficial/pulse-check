export interface DashboardMetrics {
  total_monitors: number;
  active_monitors: number;
  down_monitors: number;
  avg_uptime: number;
  avg_response_time: number;
}

export interface MonitorStats {
  total_checks: number;
  up_checks: number;
  down_checks: number;
  uptime_pct: number;
  avg_response_ms: number;
  p95_ms: number;
  p99_ms: number;
}

export interface TimeseriesBucket {
  bucket: string;
  avg_response_ms: number;
  uptime_pct: number;
  check_count: number;
  error_count: number;
}

export interface PlatformStats {
  total_users: number;
  total_tenants: number;
  total_monitors: number;
  active_monitors: number;
  open_incidents: number;
}
