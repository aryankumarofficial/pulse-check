"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LayoutDashboard,
  Bell,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Moon,
  Sun,
  Users,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { insforge } from "@/lib/insforge";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useThemeStore } from "@/stores/theme-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "@/components/command-palette";
import { ROUTES } from "@/lib/constants";

const navigation = [
  { name: "Dashboard", href: ROUTES.admin, icon: LayoutDashboard },
  { name: "Users", href: ROUTES.adminUsers, icon: Users },
  { name: "Admins", href: ROUTES.adminAdmins, icon: ShieldAlert },
  { name: "Settings", href: ROUTES.adminSettings, icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.signIn);
    } else if (!authLoading && isAuthenticated && user?.profile?.role !== "admin") {
      router.push(ROUTES.dashboard);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    useAuthStore.getState().reset();
    useNotificationStore.getState().reset();
    router.push(ROUTES.signIn);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (authLoading || (isAuthenticated && user?.profile?.role !== "admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette />
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link href={ROUTES.dashboard} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-sidebar-foreground whitespace-nowrap">
                Platform Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.admin &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-red-500/10 text-red-500"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-red-500")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <Link
            href={ROUTES.dashboard}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            {!collapsed && <span>Back to Dashboard</span>}
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 glass border-b border-border flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold tracking-tight">Admin Console</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              {user && (
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">
                    {user.profile?.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
