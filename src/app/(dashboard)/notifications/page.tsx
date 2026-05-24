"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated on your monitors
        </p>
      </div>
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center space-y-2">
          <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Notifications module — coming in Phase 6</p>
        </div>
      </div>
    </div>
  );
}
