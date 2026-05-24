"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center space-y-2">
          <Settings className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Settings module — coming in Phase 8</p>
        </div>
      </div>
    </div>
  );
}
