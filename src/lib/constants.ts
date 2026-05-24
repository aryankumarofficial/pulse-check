export const APP_NAME = "PulseCheck";
export const APP_DESCRIPTION =
  "Monitor websites, APIs, and AI endpoints. Get instant alerts when things go down.";

export const MONITOR_TYPES = {
  website: { label: "Website", description: "Monitor HTTP/HTTPS endpoints" },
  api: { label: "API", description: "Monitor REST/GraphQL APIs" },
  ai: { label: "AI Endpoint", description: "Monitor AI/LLM APIs" },
} as const;

export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
] as const;

export const CHECK_INTERVALS = [
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 900, label: "15 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
] as const;

export const PLAN_LIMITS = {
  free: { maxMonitors: 5, checkInterval: 60, retentionDays: 30 },
  pro: { maxMonitors: 50, checkInterval: 60, retentionDays: 90 },
  team: { maxMonitors: 200, checkInterval: 60, retentionDays: 180 },
  enterprise: { maxMonitors: 1000, checkInterval: 60, retentionDays: 365 },
} as const;

export const SEVERITY_LEVELS = ["minor", "major", "critical"] as const;

export const INCIDENT_STATUSES = ["ongoing", "resolved"] as const;

export const MONITOR_STATUSES = ["up", "down", "degraded", "unknown"] as const;

export const NOTIFICATION_TYPES = [
  "downtime",
  "recovery",
  "ssl_expiry",
  "info",
] as const;

export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  monitors: "/monitors",
  monitorNew: "/monitors/new",
  monitorDetail: (id: string) => `/monitors/${id}`,
  monitorSettings: (id: string) => `/monitors/${id}/settings`,
  incidents: "/incidents",
  incidentDetail: (id: string) => `/incidents/${id}`,
  analytics: "/analytics",
  notifications: "/notifications",
  settings: "/settings",
  settingsProfile: "/settings/profile",
  settingsAlerts: "/settings/alerts",
  activity: "/activity",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminAdmins: "/admin/admins",
  adminSettings: "/admin/settings",
  adminMonitors: "/admin/monitors",
  adminIncidents: "/admin/incidents",
  adminAnalytics: "/admin/analytics",
  adminAuditLogs: "/admin/audit-logs",
} as const;

export const TIME_RANGES = [
  { value: "1h", label: "Last hour", hours: 1 },
  { value: "24h", label: "Last 24 hours", hours: 24 },
  { value: "7d", label: "Last 7 days", hours: 168 },
  { value: "30d", label: "Last 30 days", hours: 720 },
  { value: "90d", label: "Last 90 days", hours: 2160 },
] as const;
