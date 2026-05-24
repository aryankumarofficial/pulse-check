"use client";

import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Globe, Loader2 } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useMonitors } from "@/hooks/use-monitors";
import { useQuery } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const { currentTenant } = useTenantStore();
  const { data: monitors } = useMonitors();

  // Fetch real analytics summary from RPC
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["analytics", "summary", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await insforge.database.rpc("get_analytics_summary", {
        p_tenant_id: currentTenant!.id,
      });
      if (error) throw error;
      return typeof data === "string" ? JSON.parse(data) : data;
    },
    enabled: !!currentTenant,
  });

  // Fetch real daily timeseries from RPC
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["analytics", "daily", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await insforge.database.rpc("get_daily_analytics", {
        p_tenant_id: currentTenant!.id,
        p_days: 14,
      });
      if (error) throw error;
      const rows = typeof data === "string" ? JSON.parse(data) : data;
      // Format dates for display
      return (rows || []).map((row: any) => ({
        ...row,
        date: format(new Date(row.date), "MMM dd"),
      }));
    },
    enabled: !!currentTenant,
  });

  const uptimeDelta = summary ? (summary.global_uptime - summary.prev_uptime).toFixed(2) : "0";
  const uptimeImproved = parseFloat(uptimeDelta) >= 0;
  const responseDelta = summary ? Math.abs(summary.avg_response_time - summary.prev_avg_response) : 0;
  const responseImproved = summary ? summary.avg_response_time <= summary.prev_avg_response : true;
  const incidentDelta = summary ? Math.abs(summary.total_incidents_30d - summary.prev_incidents) : 0;
  const incidentImproved = summary ? summary.total_incidents_30d <= summary.prev_incidents : true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed performance metrics and historical uptime data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Global Uptime (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? <Skeleton className="h-9 w-24" /> : (
              <>
                <div className="text-3xl font-bold text-emerald-500">{summary?.global_uptime ?? 100}%</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {uptimeImproved
                    ? <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    : <ArrowDownRight className="h-3 w-3 text-red-500" />
                  }
                  <span className={uptimeImproved ? "text-emerald-500" : "text-red-500"}>
                    {Math.abs(parseFloat(uptimeDelta))}%
                  </span> vs last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? <Skeleton className="h-9 w-24" /> : (
              <>
                <div className="text-3xl font-bold">{summary?.avg_response_time ?? 0}ms</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {responseImproved
                    ? <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                    : <ArrowUpRight className="h-3 w-3 text-red-500" />
                  }
                  <span className={responseImproved ? "text-emerald-500" : "text-red-500"}>
                    {responseDelta}ms
                  </span> vs last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? <Skeleton className="h-9 w-24" /> : (
              <>
                <div className="text-3xl font-bold">{summary?.total_incidents_30d ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {incidentImproved
                    ? <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                    : <ArrowUpRight className="h-3 w-3 text-red-500" />
                  }
                  <span className={incidentImproved ? "text-emerald-500" : "text-red-500"}>
                    {incidentDelta}
                  </span> vs last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
            <CardDescription>Average global response time across all monitors</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !chartData || chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No check data recorded yet. Charts will appear after the first monitoring cycle.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dx={-10} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="responseTime" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorResponse)" name="Avg Response (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Uptime</CardTitle>
            <CardDescription>Uptime percentage per day</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !chartData || chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888888' }} dy={10} />
                  <YAxis domain={[98, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888888' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="uptime" fill="#10b981" radius={[4, 4, 0, 0]} name="Uptime %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitor Performance</CardTitle>
            <CardDescription>Breakdown by individual endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monitors?.map(monitor => (
                <div key={monitor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{monitor.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{monitor.last_response_time || 0}ms avg</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{monitor.uptime_percentage}%</p>
                    <Badge variant={monitor.uptime_percentage >= 99.5 ? "default" : "outline"} className={monitor.uptime_percentage >= 99.5 ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
                      {monitor.uptime_percentage >= 99.5 ? "Healthy" : "Degraded"}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!monitors || monitors.length === 0) && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No monitors active to show performance data.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
