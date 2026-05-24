"use client";

import { Bell, Check, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "info": return <Info className="h-5 w-5 text-blue-500" />;
      case "system": return <ShieldAlert className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on monitor alerts and system events
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMarkAllRead}
          disabled={!notifications?.some(n => !n.is_read) || markAllRead.isPending}
        >
          <Check className="h-4 w-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/40">
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your alert history across all endpoints.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground text-sm">No new notifications to display.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 sm:p-6 flex gap-4 transition-colors hover:bg-muted/50",
                    !notification.is_read && "bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                    !notification.is_read ? "bg-background shadow-sm ring-1 ring-border" : "bg-muted"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm font-medium",
                        !notification.is_read ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground/80">
                      {notification.message}
                    </p>
                    {notification.data?.incident_id && (
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                          Incident #{notification.data.incident_id.substring(0, 8)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0 flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => markRead.mutate(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
