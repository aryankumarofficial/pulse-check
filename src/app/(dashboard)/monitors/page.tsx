"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Activity, Globe, Server, Cpu, MoreVertical, PauseCircle, PlayCircle, Settings, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMonitors, useToggleMonitor, useDeleteMonitor } from "@/hooks/use-monitors";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MonitorsPage() {
  const { data: monitors, isLoading } = useMonitors();
  const toggleMonitor = useToggleMonitor();
  const deleteMonitor = useDeleteMonitor();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMonitors = monitors?.filter(monitor => 
    monitor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    monitor.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "website": return <Globe className="h-4 w-4" />;
      case "api": return <Server className="h-4 w-4" />;
      case "ai": return <Cpu className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <Badge variant="outline" className="text-muted-foreground">Paused</Badge>;
    
    switch (status) {
      case "up": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Up</Badge>;
      case "down": return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Down</Badge>;
      case "degraded": return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Degraded</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitors</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view status of all your monitored endpoints
          </p>
        </div>
        <Link href={ROUTES.monitorNew}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Monitor
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search monitors..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filteredMonitors?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-card rounded-xl border border-dashed text-center p-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No monitors found</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {searchQuery 
              ? "We couldn't find any monitors matching your search." 
              : "You haven't set up any monitors yet. Add your first endpoint to start tracking uptime."}
          </p>
          {!searchQuery && (
            <Link href={ROUTES.monitorNew}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Monitor
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMonitors?.map(monitor => (
            <div 
              key={monitor.id} 
              className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      {getTypeIcon(monitor.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none truncate max-w-[180px]" title={monitor.name}>
                        {monitor.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                        {monitor.type} • {monitor.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(monitor.current_status, monitor.is_active)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.monitorDetail(monitor.id)}>
                            <Activity className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.monitorSettings(monitor.id)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => toggleMonitor.mutate({ id: monitor.id, is_active: !monitor.is_active })}
                        >
                          {monitor.is_active ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Pause Monitor
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Resume Monitor
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-400"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this monitor?")) {
                              deleteMonitor.mutate(monitor.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Monitor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="text-sm truncate text-muted-foreground mb-4 font-mono text-xs bg-muted/50 p-2 rounded">
                  {monitor.url}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Uptime</p>
                    <p className="font-medium">{monitor.uptime_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Last Checked</p>
                    <p className="font-medium">
                      {monitor.last_checked_at 
                        ? formatDistanceToNow(new Date(monitor.last_checked_at), { addSuffix: true }) 
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
