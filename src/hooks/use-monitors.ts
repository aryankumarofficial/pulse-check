import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import { useLogActivity } from "@/hooks/use-activity-log";
import type { Monitor } from "@/types/monitor";
import type { CreateMonitorInput, UpdateMonitorInput } from "@/validators/monitor";

export const MONITOR_KEYS = {
  all: ["monitors"] as const,
  lists: () => [...MONITOR_KEYS.all, "list"] as const,
  list: (tenantId: string | null) => [...MONITOR_KEYS.lists(), { tenantId }] as const,
  details: () => [...MONITOR_KEYS.all, "detail"] as const,
  detail: (id: string) => [...MONITOR_KEYS.details(), id] as const,
};

export function useMonitors() {
  const { currentTenant } = useTenantStore();

  return useQuery({
    queryKey: MONITOR_KEYS.list(currentTenant?.id || null),
    queryFn: async () => {
      if (!currentTenant?.id) return [];

      const { data, error } = await insforge.database
        .from("monitors")
        .select("*")
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Monitor[];
    },
    enabled: !!currentTenant?.id,
  });
}

export function useMonitor(id: string) {
  return useQuery({
    queryKey: MONITOR_KEYS.detail(id),
    queryFn: async () => {
      const { data, error } = await insforge.database
        .from("monitors")
        .select("*, monitor_ssl_info(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantStore();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (input: CreateMonitorInput) => {
      if (!currentTenant?.id) throw new Error("No active tenant");

      // Get current user to set created_by
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await insforge.database
        .from("monitors")
        .insert({
          tenant_id: currentTenant.id,
          created_by: user.id,
          name: input.name,
          url: input.url,
          type: input.type,
          method: input.method,
          headers: input.headers,
          body: input.body,
          expected_status: input.expected_status,
          timeout_ms: input.timeout_ms,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Log activity (don't await so it doesn't block)
      logActivity.mutateAsync({
        action: "created",
        resource_type: "monitor",
        resource_id: data.id,
        metadata: { name: data.name, type: data.type, url: data.url }
      }).catch(console.error);
      
      return data as unknown as Monitor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.lists() });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMonitorInput }) => {
      const { data: updated, error } = await insforge.database
        .from("monitors")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      logActivity.mutateAsync({
        action: "updated",
        resource_type: "monitor",
        resource_id: id,
        metadata: { name: updated.name }
      }).catch(console.error);
      
      return updated as unknown as Monitor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.lists() });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await insforge.database
        .from("monitors")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      logActivity.mutateAsync({
        action: "deleted",
        resource_type: "monitor",
        resource_id: id,
      }).catch(console.error);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.lists() });
    },
  });
}

export function useToggleMonitor() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await insforge.database
        .from("monitors")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      logActivity.mutateAsync({
        action: is_active ? "resumed" : "paused",
        resource_type: "monitor",
        resource_id: id,
        metadata: { name: data.name }
      }).catch(console.error);
      
      return data as unknown as Monitor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.lists() });
    },
  });
}
