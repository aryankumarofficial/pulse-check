import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) return `${hours}h ${remainingMins}m`;
  const days = Math.floor(hours / 24);
  const remainingHrs = hours % 24;
  return `${days}d ${remainingHrs}h`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatUptime(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "up":
      return "text-emerald-500";
    case "down":
      return "text-red-500";
    case "degraded":
      return "text-amber-500";
    default:
      return "text-gray-400";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "up":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "down":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "degraded":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "major":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "minor":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export function truncateUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    return url.slice(0, maxLength) + "…";
  }
}
