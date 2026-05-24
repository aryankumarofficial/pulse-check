import { create } from "zustand";
import type { Notification } from "@/types/notification";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
  reset: () => void;
}

import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      })),
      unreadCount: 0,
    })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  fetchUnreadCount: async () => {
    // This is a bit of an anti-pattern accessing another store here, but it works for our simple use case
    const tenantId = useTenantStore.getState().currentTenant?.id;
    if (!tenantId) return;
    
    try {
      const { count } = await insforge.database
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("is_read", false);
        
      if (count !== null) {
        set({ unreadCount: count });
      }
    } catch (e) {
      console.error("Failed to fetch unread count", e);
    }
  },
  reset: () => set({ notifications: [], unreadCount: 0 }),
}));
