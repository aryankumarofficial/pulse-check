"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Activity, Globe, Server, Cpu, Clock, Calendar, CheckCircle, XCircle, AlertTriangle, ExternalLink, PauseCircle, HelpCircle } from "lucide-react";
import { formatDistanceToNow, format, subHours } from "date-fns";
import { useMonitor } from "@/hooks/use-monitors";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

export default function MonitorDetailPage() {
  const params = useParams();
  const monitorId = params.id as string;
  const { data: monitor, isLoading } = useMonitor(monitorId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <Activity className="h-12 w-12 text-muted-foreground/30" />
        <h2 className="text-2xl font-semibold">Monitor Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          This monitor may have been deleted or you don't have permission to view it.
        </p>
        <Link href={ROUTES.monitors}>
          <Button variant="outline">Back to Monitors</Button>
        </Link>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "website": return <Globe className="h-5 w-5" />;
      case "api": return <Server className="h-5 w-5" />;
      case "ai": return <Cpu className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusDisplay = (status: string, isActive: boolean) => {
    if (!isActive) return { icon: <PauseCircle className="h-6 w-6 text-muted-foreground" />, text: "Paused", color: "text-muted-foreground" };
    
    switch (status) {
      case "up": return { icon: <CheckCircle className="h-6 w-6 text-emerald-500" />, text: "Operational", color: "text-emerald-500" };
      case "down": return { icon: <XCircle className="h-6 w-6 text-red-500" />, text: "Down", color: "text-red-500" };
      case "degraded": return { icon: <AlertTriangle className="h-6 w-6 text-amber-500" />, text: "Degraded", color: "text-amber-500" };
      default: return { icon: <HelpCircle className="h-6 w-6 text-muted-foreground" />, text: "Unknown", color: "text-muted-foreground" };
    }
  };

  const statusDisplay = getStatusDisplay(monitor.current_status, monitor.is_active);

  const generateMockPingData = () => {
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const date = subHours(now, i);
      data.push({
        time: format(date, "HH:mm"),
        ping: Math.max(50, monitor.last_response_time - 50 + Math.random() * 100),
      });
    }
    return data;
  };

  const pingData = generateMockPingData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={ROUTES.monitors}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 flex justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{monitor.name}</h1>
              <Badge variant="outline" className="uppercase">{monitor.type}</Badge>
            </div>
            <a 
              href={monitor.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center mt-1"
            >
              {monitor.url} <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          <Link href={ROUTES.monitorSettings(monitor.id)}>
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </div>

      {/* Main Status Hero */}
      <div className="bg-card border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center bg-background border-4 ${
            monitor.is_active 
              ? monitor.current_status === 'up' ? 'border-emerald-500 bg-emerald-500/10' 
                : monitor.current_status === 'down' ? 'border-red-500 bg-red-500/10' 
                : 'border-amber-500 bg-amber-500/10'
              : 'border-muted-foreground bg-muted'
          }`}>
            {statusDisplay.icon}
          </div>
          <div>
            <h2 className={`text-3xl font-bold ${statusDisplay.color}`}>
              {statusDisplay.text}
            </h2>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4" />
              Last checked {monitor.last_checked_at ? formatDistanceToNow(new Date(monitor.last_checked_at), { addSuffix: true }) : "never"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-8 text-center md:text-right">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Uptime</p>
            <p className="text-2xl font-bold">{monitor.uptime_percentage}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Response Time</p>
            <p className="text-2xl font-bold">{monitor.last_response_time ? `${monitor.last_response_time}ms` : "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Endpoint monitoring settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">HTTP Method</p>
                <p className="font-mono">{monitor.method}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Expected Status</p>
                <p className="font-mono">{monitor.expected_status}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Timeout</p>
                <p className="font-mono">{monitor.timeout_ms}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p>{format(new Date(monitor.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            {Object.keys(monitor.headers || {}).length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Custom Headers</p>
                <div className="bg-muted p-3 rounded-md overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(monitor.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Response Time History (24h)</CardTitle>
            <CardDescription>Latency measurements from global edge network</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="ping" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPing)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
