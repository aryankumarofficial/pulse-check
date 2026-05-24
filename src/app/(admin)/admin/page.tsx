"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Users, Server, AlertTriangle, Activity, Database, HardDrive, Cpu, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { insforge } from "@/lib/insforge";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalMonitors: 0,
    activeIncidents: 0,
  });
  const [resources, setResources] = useState({
    total_checks_30d: 0,
    db_size_mb: 0,
    total_monitors: 0,
    active_monitors: 0,
    total_incidents: 0,
    active_incidents: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, resourceRes, activityRes] = await Promise.all([
          insforge.database.rpc("get_admin_stats"),
          insforge.database.rpc("get_admin_resource_stats"),
          insforge.database
            .from("activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        if (statsRes.data) {
          const d = typeof statsRes.data === "string" ? JSON.parse(statsRes.data) : statsRes.data;
          setStats({
            totalUsers: d.totalUsers || 0,
            totalTenants: d.totalTenants || 0,
            totalMonitors: d.totalMonitors || 0,
            activeIncidents: d.activeIncidents || 0,
          });
        }

        if (resourceRes.data) {
          const r = typeof resourceRes.data === "string" ? JSON.parse(resourceRes.data) : resourceRes.data;
          setResources(r);
        }

        if (activityRes.data) {
          setRecentActivity(activityRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const dbUsagePct = Math.min(100, Math.round((resources.db_size_mb / 500) * 100));
  const checksUsagePct = Math.min(100, Math.round((resources.total_checks_30d / 100000) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Administration</h1>
        <p className="text-muted-foreground mt-1">
          Global overview and management of the PulseCheck SaaS platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats.totalTenants}</div>}
            <p className="text-xs text-muted-foreground mt-1">Registered workspaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{resources.active_monitors}</div>}
            <p className="text-xs text-muted-foreground mt-1">{resources.total_monitors} total created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{resources.active_incidents}</div>}
            <p className="text-xs text-muted-foreground mt-1">{resources.total_incidents} total recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engine Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">Online</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Cron Edge Route Active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
            <CardDescription>Live backend capacity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Database className="h-4 w-4 text-blue-500" />
                  Database Storage
                </div>
                {loading ? <Skeleton className="h-4 w-32" /> : (
                  <span>{dbUsagePct}% ({resources.db_size_mb}MB / 500MB)</span>
                )}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${dbUsagePct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                  Monitor Checks (30d)
                </div>
                {loading ? <Skeleton className="h-4 w-32" /> : (
                  <span>{checksUsagePct}% ({resources.total_checks_30d.toLocaleString()} / 100k)</span>
                )}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all" style={{ width: `${checksUsagePct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  Active Monitors Capacity
                </div>
                {loading ? <Skeleton className="h-4 w-32" /> : (
                  <span>{Math.round((resources.active_monitors / 500) * 100)}% ({resources.active_monitors} / 500 max)</span>
                )}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((resources.active_monitors / 500) * 100)}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>Global audit log of significant actions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                <ShieldAlert className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No platform activity recorded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentActivity.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.entity_type} · {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
