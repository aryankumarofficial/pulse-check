"use client";

import { Wrench, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Wrench className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Under Scheduled Maintenance</h1>
      
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        We're currently upgrading our systems to provide you with a better experience. We'll be back online shortly!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full mb-10 text-left">
        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-sm">Estimated Downtime</h3>
            <p className="text-xs text-muted-foreground mt-1">Usually less than 30 minutes</p>
          </div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
          <Activity className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-sm">System Status</h3>
            <p className="text-xs text-muted-foreground mt-1">Check our status page for updates</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => window.location.reload()} variant="default">
          Refresh Page
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin">
            Admin Access
          </Link>
        </Button>
      </div>
    </div>
  );
}
