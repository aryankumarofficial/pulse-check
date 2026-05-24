import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import { useNotificationStore } from "@/stores/notification-store";
import { MONITOR_KEYS } from "./use-monitors";
import { ACTIVITY_KEYS } from "./use-activity-log";

export function useRealtimeSubscription() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantStore();
  const fetchUnreadCount = useNotificationStore(state => state.fetchUnreadCount);

  useEffect(() => {
    if (!currentTenant?.id) return;

    const channelName = `tenant:${currentTenant.id}`;
    let isMounted = true;
    
    const setupRealtime = async () => {
      try {
        await insforge.realtime.connect();
        await insforge.realtime.subscribe(channelName);

        insforge.realtime.on("monitor_update", (payload) => {
          if (!isMounted) return;
          queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.all });
        });

        insforge.realtime.on("INSERT_incident", (payload) => {
          if (!isMounted) return;
          queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.all });
          queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.all });
          fetchUnreadCount(); // Refresh unread notifications count
        });

        insforge.realtime.on("UPDATE_incident", (payload) => {
          if (!isMounted) return;
          queryClient.invalidateQueries({ queryKey: MONITOR_KEYS.all });
          queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.all });
        });

        console.log(`Subscribed to real-time events on ${channelName}`);
      } catch (err) {
        console.error("Failed to setup realtime", err);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      // Note: A full implementation might call unsubscribe here depending on SDK
    };
  }, [currentTenant?.id, queryClient, fetchUnreadCount]);
}
