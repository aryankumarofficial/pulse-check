"use client";

import { Activity, Clock, ShieldAlert, MonitorPlay, Trash2, Edit, Plus, MonitorPause } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useActivityLogs } from "@/hooks/use-activity-log";
import { Badge } from "@/components/ui/badge";

export default function ActivityPage() {
  const { data: logs, isLoading } = useActivityLogs();

  const getActionDetails = (action: string, resourceType?: string) => {
    switch (action) {
      case "created":
        return { 
          icon: <Plus className="h-4 w-4 text-emerald-500" />,
          color: "bg-emerald-500/10 border-emerald-500/20",
          text: `Created new ${resourceType}`
        };
      case "updated":
        return { 
          icon: <Edit className="h-4 w-4 text-blue-500" />,
          color: "bg-blue-500/10 border-blue-500/20",
          text: `Updated ${resourceType}`
        };
      case "deleted":
        return { 
          icon: <Trash2 className="h-4 w-4 text-red-500" />,
          color: "bg-red-500/10 border-red-500/20",
          text: `Deleted ${resourceType}`
        };
      case "paused":
        return { 
          icon: <MonitorPause className="h-4 w-4 text-amber-500" />,
          color: "bg-amber-500/10 border-amber-500/20",
          text: `Paused ${resourceType}`
        };
      case "resumed":
        return { 
          icon: <MonitorPlay className="h-4 w-4 text-emerald-500" />,
          color: "bg-emerald-500/10 border-emerald-500/20",
          text: `Resumed ${resourceType}`
        };
      default:
        return { 
          icon: <Activity className="h-4 w-4 text-muted-foreground" />,
          color: "bg-muted border-muted-foreground/20",
          text: `${action} ${resourceType}`
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Audit trail of all actions performed in your workspace
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No activity yet</h3>
            <p className="text-muted-foreground">
              When you create monitors or change settings, those actions will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const details = getActionDetails(log.action, log.resource_type as string);
              const metadata = log.metadata as Record<string, any> || {};
              const itemName = metadata.name || log.resource_id || "item";

              return (
                <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border shrink-0 ${details.color}`}>
                    {details.icon}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">You</span>{" "}
                      {details.text.toLowerCase()}{" "}
                      <span className="font-semibold text-foreground">{itemName}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">
                        {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                  </div>
                  
                  {metadata.type && (
                    <Badge variant="outline" className="uppercase text-[10px] shrink-0">
                      {metadata.type}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
