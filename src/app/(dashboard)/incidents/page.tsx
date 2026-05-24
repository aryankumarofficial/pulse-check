"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock, ArrowUpRight, Loader2, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Incident } from "@/types/incident";

export default function IncidentsPage() {
  const { currentTenant } = useTenantStore();
  const [filter, setFilter] = useState<"all" | "ongoing" | "resolved">("all");

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["incidents", currentTenant?.id, filter],
    queryFn: async () => {
      if (!currentTenant) throw new Error("No tenant");

      let query = insforge.database
        .from("incidents")
        .select("*, monitors(name, url)")
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Incident[];
    },
    enabled: !!currentTenant,
  });

  const ongoingCount = incidents?.filter(i => i.status === "ongoing").length || 0;
  const resolvedCount = incidents?.filter(i => i.status === "resolved").length || 0;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "major": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "minor": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage downtime incidents across your monitors
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : ongoingCount}</p>
              <p className="text-xs text-muted-foreground">Active Incidents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : (incidents?.length || 0)}</p>
              <p className="text-xs text-muted-foreground">Total (all time)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "ongoing", "resolved"] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Incidents list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !incidents || incidents.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-lg font-medium">
                {filter === "ongoing" ? "No active incidents" : "No incidents recorded"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {filter === "ongoing" ? "All your monitors are operating normally." : "Incidents will be logged here when downtime is detected."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {incidents.map(incident => (
                <div key={incident.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 h-3 w-3 rounded-full flex-shrink-0",
                        incident.status === "ongoing" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                      )} />
                      <div>
                        <p className="font-medium">
                          {incident.monitors?.name || "Unknown monitor"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Started {formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}
                          {incident.resolved_at && (
                            <> · Resolved {formatDistanceToNow(new Date(incident.resolved_at), { addSuffix: true })}</>
                          )}
                        </p>
                        {incident.root_cause && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Root cause: {incident.root_cause}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6 sm:ml-0">
                      <Badge variant="outline" className={cn("text-xs", getSeverityColor(incident.severity))}>
                        {incident.severity}
                      </Badge>
                      <Badge variant={incident.status === "ongoing" ? "destructive" : "default"}
                        className={incident.status === "resolved" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}
                      >
                        {incident.status}
                      </Badge>
                      {incident.duration_seconds && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDuration(incident.duration_seconds)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
