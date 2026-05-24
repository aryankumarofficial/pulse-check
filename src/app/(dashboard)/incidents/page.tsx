"use client";

import { AlertTriangle } from "lucide-react";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage incidents
        </p>
      </div>
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Incidents module — coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
}
