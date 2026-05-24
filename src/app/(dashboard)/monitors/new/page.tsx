"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MonitorForm } from "@/components/monitors/monitor-form";
import { useCreateMonitor, useMonitors } from "@/hooks/use-monitors";
import { useTenantStore } from "@/stores/tenant-store";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { CreateMonitorInput } from "@/validators/monitor";

export default function NewMonitorPage() {
  const router = useRouter();
  const createMonitor = useCreateMonitor();
  const { data: monitors, isLoading: isLoadingMonitors } = useMonitors();
  const { plan } = useTenantStore();
  const [error, setError] = useState<string | null>(null);

  const activeMonitorCount = monitors?.length || 0;
  const maxMonitors = plan?.max_monitors || 5;
  const hasReachedLimit = activeMonitorCount >= maxMonitors;

  const handleSubmit = async (data: CreateMonitorInput) => {
    setError(null);
    try {
      await createMonitor.mutateAsync(data);
      router.push(ROUTES.monitors);
    } catch (err: any) {
      console.error("Failed to create monitor:", err);
      setError(err.message || "Failed to create monitor. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={ROUTES.monitors}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Add a new endpoint to monitor for uptime and performance
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <Activity className="h-5 w-5 text-primary" />
          <p className="text-sm">
            We'll check this endpoint every 60 seconds from our global edge network.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {hasReachedLimit ? (
          <div className="text-center py-8 px-4 space-y-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold">Monitor Limit Reached</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've reached the limit of {maxMonitors} monitors on your current {plan?.display_name || "Free"} plan. 
              Upgrade your plan to add more endpoints.
            </p>
            <div className="pt-4">
              <Link href={ROUTES.settings}>
                <Button>View Upgrade Options</Button>
              </Link>
            </div>
          </div>
        ) : (
          <MonitorForm 
            onSubmit={handleSubmit} 
            isSubmitting={createMonitor.isPending} 
          />
        )}
      </div>
    </div>
  );
}
