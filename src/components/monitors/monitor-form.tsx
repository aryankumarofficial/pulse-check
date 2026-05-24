"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMonitorSchema, type CreateMonitorInput } from "@/validators/monitor";
import type { Monitor } from "@/types/monitor";

interface MonitorFormProps {
  initialData?: Monitor;
  onSubmit: (data: CreateMonitorInput) => Promise<void>;
  isSubmitting: boolean;
}

export function MonitorForm({ initialData, onSubmit, isSubmitting }: MonitorFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMonitorInput & { headersArray: { key: string; value: string }[] }>({
    resolver: zodResolver(createMonitorSchema as any),
    defaultValues: {
      name: initialData?.name || "",
      url: initialData?.url || "",
      type: initialData?.type || "website",
      method: initialData?.method || "GET",
      expected_status: initialData?.expected_status || 200,
      timeout_ms: initialData?.timeout_ms || 30000,
      body: initialData?.body || "",
      headersArray: initialData?.headers 
        ? Object.entries(initialData.headers).map(([key, value]) => ({ key, value }))
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "headersArray",
  });

  const monitorType = watch("type");
  const method = watch("method");

  // Transform headersArray back to Record<string, string> before submit
  const handleFormSubmit = async (data: any) => {
    const headers: Record<string, string> = {};
    if (data.headersArray) {
      data.headersArray.forEach(({ key, value }: { key: string; value: string }) => {
        if (key && key.trim() !== "") {
          headers[key] = value;
        }
      });
    }
    
    const submitData: CreateMonitorInput = {
      name: data.name,
      url: data.url,
      type: data.type,
      method: data.method,
      expected_status: data.expected_status,
      timeout_ms: data.timeout_ms,
      body: data.body,
      headers,
    };
    
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Basic Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Monitor Name <span className="text-red-500">*</span></Label>
            <Input id="name" placeholder="e.g. Production API" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Monitor Type <span className="text-red-500">*</span></Label>
            <div className="relative">
              <select
                id="type"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("type")}
              >
                <option value="website">Website (HTML/Frontend)</option>
                <option value="api">API Endpoint (JSON)</option>
                <option value="ai">AI Endpoint (LLM/Inference)</option>
              </select>
            </div>
            {errors.type && <p className="text-xs text-red-500">{errors.type.message as string}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL <span className="text-red-500">*</span></Label>
          <Input id="url" type="url" placeholder="https://example.com" {...register("url")} />
          {errors.url && <p className="text-xs text-red-500">{errors.url.message as string}</p>}
        </div>
      </div>

      {/* Advanced Settings (mostly for API/AI) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2">
          Request Settings
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md group-hover:block z-10">
              Configure how we make requests to your endpoint.
            </div>
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <select
              id="method"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("method")}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_status">Expected Status</Label>
            <Input 
              id="expected_status" 
              type="number" 
              {...register("expected_status", { valueAsNumber: true })} 
            />
            {errors.expected_status && <p className="text-xs text-red-500">{errors.expected_status.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout_ms">Timeout (ms)</Label>
            <Input 
              id="timeout_ms" 
              type="number" 
              step="1000"
              {...register("timeout_ms", { valueAsNumber: true })} 
            />
            {errors.timeout_ms && <p className="text-xs text-red-500">{errors.timeout_ms.message as string}</p>}
          </div>
        </div>

        {/* Request Body - Only show for applicable methods */}
        {["POST", "PUT", "PATCH"].includes(method) && (
          <div className="space-y-2">
            <Label htmlFor="body">Request Body (JSON)</Label>
            <textarea
              id="body"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder='{"key": "value"}'
              {...register("body")}
            />
            {errors.body && <p className="text-xs text-red-500">{errors.body.message as string}</p>}
          </div>
        )}

        {/* Headers */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>Custom Headers</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => append({ key: "", value: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Header
            </Button>
          </div>
          
          {fields.length === 0 ? (
            <div className="text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">
              No custom headers configured. Click "Add Header" to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Input 
                      placeholder="Header Name (e.g. Authorization)" 
                      {...register(`headersArray.${index}.key` as const)} 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input 
                      placeholder="Header Value" 
                      {...register(`headersArray.${index}.value` as const)} 
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {initialData ? "Update Monitor" : "Create Monitor"}
        </Button>
      </div>
    </form>
  );
}
