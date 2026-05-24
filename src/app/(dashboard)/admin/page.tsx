"use client";

import { useState, useEffect } from "react";
import { Users, Server, AlertTriangle, Activity, Database, HardDrive, Cpu, ShieldCheck, ShieldAlert } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const { data, error } = await insforge.database.rpc("get_admin_stats");
        
        if (error) throw error;
        
        if (data) {
          setStats({
            totalUsers: data.totalUsers || 0,
            totalTenants: data.totalTenants || 0,
            totalMonitors: data.totalMonitors || 0,
            activeIncidents: data.activeIncidents || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Administration</h1>
        <p className="text-muted-foreground mt-1">
          Global overview and management of the Downtime Detector SaaS platform.
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
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats.totalMonitors}</div>}
            <p className="text-xs text-muted-foreground mt-1">Running network checks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats.activeIncidents}</div>}
            <p className="text-xs text-muted-foreground mt-1">Currently unresolved</p>
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
            <CardDescription>InsForge Backend Capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Database className="h-4 w-4 text-blue-500" />
                  Database Storage
                </div>
                <span>45% (225MB / 500MB)</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                  Edge Invocation Quota
                </div>
                <span>12% (12k / 100k requests)</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[12%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  Realtime Peak Connections
                </div>
                <span>5% (25 / 500 max)</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[5%]" />
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
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
              <ShieldAlert className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No high-level administrative actions recorded yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
