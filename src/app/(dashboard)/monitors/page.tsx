"use client";

import { Activity } from "lucide-react";

export default function MonitorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitors</h1>
        <p className="text-muted-foreground mt-1">
          Manage your monitored endpoints
        </p>
      </div>
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center space-y-2">
          <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Monitors module — coming in Phase 2</p>
        </div>
      </div>
    </div>
  );
}
