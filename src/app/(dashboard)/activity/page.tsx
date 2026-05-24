"use client";

import { Clock } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Review recent actions and changes
        </p>
      </div>
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center space-y-2">
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Activity module — coming in Phase 2</p>
        </div>
      </div>
    </div>
  );
}
