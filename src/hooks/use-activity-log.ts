import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import type { ActivityLog } from "@/types/activity-log";

export const ACTIVITY_KEYS = {
  all: ["activity"] as const,
  lists: () => [...ACTIVITY_KEYS.all, "list"] as const,
  list: (tenantId: string | null) => [...ACTIVITY_KEYS.lists(), { tenantId }] as const,
};

export function useActivityLogs() {
  const { currentTenant } = useTenantStore();

  return useQuery({
    queryKey: ACTIVITY_KEYS.list(currentTenant?.id || null),
    queryFn: async () => {
      if (!currentTenant?.id) return [];

      const { data, error } = await insforge.database
        .from("activity_logs")
        .select("*")
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as ActivityLog[];
    },
    enabled: !!currentTenant?.id,
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantStore();

  return useMutation({
    mutationFn: async ({
      action,
      resource_type,
      resource_id,
      metadata = {},
    }: {
      action: string;
      resource_type?: string;
      resource_id?: string;
      metadata?: Record<string, any>;
    }) => {
      if (!currentTenant?.id) return null;

      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) return null;

      const { data, error } = await insforge.database
        .from("activity_logs")
        .insert({
          tenant_id: currentTenant.id,
          user_id: user.id,
          action,
          resource_type,
          resource_id,
          metadata,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to log activity:", error);
        // We typically don't want activity logging to throw and break main flows
        return null;
      }
      
      return data as unknown as ActivityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.lists() });
    },
  });
}
