import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import { useNotificationStore } from "@/stores/notification-store";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATION_KEYS.all, "list"] as const,
};

export function useNotifications() {
  const { currentTenant } = useTenantStore();

  return useQuery({
    queryKey: [...NOTIFICATION_KEYS.lists(), currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant) throw new Error("No active workspace");

      const { data, error } = await insforge.database
        .from("notifications")
        .select("*")
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const fetchUnreadCount = useNotificationStore(state => state.fetchUnreadCount);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await insforge.database
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      fetchUnreadCount();
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantStore();
  const fetchUnreadCount = useNotificationStore(state => state.fetchUnreadCount);

  return useMutation({
    mutationFn: async () => {
      if (!currentTenant) throw new Error("No active workspace");

      const { error } = await insforge.database
        .from("notifications")
        .update({ is_read: true })
        .eq("tenant_id", currentTenant.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      fetchUnreadCount();
    },
  });
}
