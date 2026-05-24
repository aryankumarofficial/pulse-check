"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useMonitor, useUpdateMonitor } from "@/hooks/use-monitors";
import { ROUTES } from "@/lib/constants";
import { MonitorForm } from "@/components/monitors/monitor-form";
import type { CreateMonitorInput } from "@/validators/monitor";

export default function MonitorSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const monitorId = params.id as string;
  
  const { data: monitor, isLoading: isMonitorLoading } = useMonitor(monitorId);
  const updateMonitor = useUpdateMonitor();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateMonitorInput) => {
    setError(null);
    try {
      await updateMonitor.mutateAsync({ id: monitorId, data });
      router.push(ROUTES.monitors);
    } catch (err: any) {
      console.error("Failed to update monitor:", err);
      setError(err.message || "Failed to update monitor. Please try again.");
    }
  };

  if (isMonitorLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">Monitor Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          The monitor you are trying to edit doesn't exist or you don't have permission to access it.
        </p>
        <Link href={ROUTES.monitors} className="text-primary hover:underline">
          Return to Monitors
        </Link>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Monitor Settings</h1>
          <p className="text-muted-foreground mt-1">
            Update configuration for {monitor.name}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <MonitorForm 
          initialData={monitor as any} 
          onSubmit={handleSubmit} 
          isSubmitting={updateMonitor.isPending} 
        />
      </div>
    </div>
  );
}
