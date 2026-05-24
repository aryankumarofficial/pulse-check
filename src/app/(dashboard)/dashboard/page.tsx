"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  Loader2,
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatMs, formatRelativeTime, getStatusBgColor } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Monitor as MonitorType } from "@/types/monitor";
import type { Incident } from "@/types/incident";
import type { DashboardMetrics } from "@/types/analytics";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { currentTenant } = useTenantStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monitors, setMonitors] = useState<MonitorType[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentTenant) return;

    const loadDashboard = async () => {
      setLoading(true);

      const [metricsRes, monitorsRes, incidentsRes] = await Promise.all([
        insforge.database.rpc("get_dashboard_metrics", {
          p_tenant_id: currentTenant.id,
        }),
        insforge.database
          .from("monitors")
          .select("*")
          .eq("tenant_id", currentTenant.id)
          .order("current_status", { ascending: true })
          .order("updated_at", { ascending: false })
          .limit(10),
        insforge.database
          .from("incidents")
          .select("*, monitors(name, url)")
          .eq("tenant_id", currentTenant.id)
          .eq("status", "ongoing")
          .order("started_at", { ascending: false })
          .limit(5),
      ]);

      if (metricsRes.data) {
        setMetrics(
          typeof metricsRes.data === "string"
            ? JSON.parse(metricsRes.data)
            : metricsRes.data
        );
      }
      if (monitorsRes.data) setMonitors(monitorsRes.data as unknown as MonitorType[]);
      if (incidentsRes.data)
        setIncidents(incidentsRes.data as unknown as Incident[]);

      setLoading(false);
    };

    loadDashboard();
  }, [currentTenant]);

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Monitors",
      value: metrics?.total_monitors ?? 0,
      icon: Monitor,
      change: `${metrics?.active_monitors ?? 0} active`,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Average Uptime",
      value: `${(metrics?.avg_uptime ?? 100).toFixed(2)}%`,
      icon: TrendingUp,
      change: "last 30 days",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Avg Response Time",
      value: formatMs(metrics?.avg_response_time ?? 0),
      icon: Clock,
      change: "across all monitors",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Active Incidents",
      value: metrics?.down_monitors ?? 0,
      icon: AlertTriangle,
      change: incidents.length > 0 ? `${incidents.length} ongoing` : "all clear",
      color: (metrics?.down_monitors ?? 0) > 0 ? "text-red-500" : "text-emerald-500",
      bg: (metrics?.down_monitors ?? 0) > 0 ? "bg-red-500/10" : "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your monitoring status
          </p>
        </div>
        <Link href={ROUTES.monitorNew}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", stat.bg)}>
                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Monitors */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Monitors</CardTitle>
              <CardDescription>Status of your monitored endpoints</CardDescription>
            </div>
            <Link href={ROUTES.monitors}>
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : monitors.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No monitors configured yet
                </p>
                <Link href={ROUTES.monitorNew}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Monitor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {monitors.map((monitor, i) => (
                  <motion.div
                    key={monitor.id}
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={ROUTES.monitorDetail(monitor.id)}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full flex-shrink-0",
                              monitor.current_status === "up" && "bg-emerald-500",
                              monitor.current_status === "down" && "bg-red-500",
                              monitor.current_status === "degraded" && "bg-amber-500",
                              monitor.current_status === "unknown" && "bg-gray-400"
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {monitor.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {monitor.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">
                              {monitor.last_response_time
                                ? formatMs(monitor.last_response_time)
                                : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {monitor.last_checked_at
                                ? formatRelativeTime(monitor.last_checked_at)
                                : "Never"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              monitor.current_status === "up"
                                ? "success"
                                : monitor.current_status === "down"
                                ? "danger"
                                : monitor.current_status === "degraded"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {monitor.current_status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Incidents</CardTitle>
              <CardDescription>Active incidents</CardDescription>
            </div>
            <Link href={ROUTES.incidents}>
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-emerald-500">
                  All Systems Operational
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No active incidents
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.map((incident, i) => (
                  <motion.div
                    key={incident.id}
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={ROUTES.incidentDetail(incident.id)}>
                      <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {incident.monitors?.name || "Unknown"}
                          </p>
                          <Badge
                            className={cn(
                              "text-[10px]",
                              getStatusBgColor(
                                incident.severity === "critical"
                                  ? "down"
                                  : "degraded"
                              )
                            )}
                          >
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Started {formatRelativeTime(incident.started_at)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
