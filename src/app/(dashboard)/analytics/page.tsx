"use client";

import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Performance insights and historical data
        </p>
      </div>
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center space-y-2">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Analytics module — coming in Phase 4</p>
        </div>
      </div>
    </div>
  );
}
