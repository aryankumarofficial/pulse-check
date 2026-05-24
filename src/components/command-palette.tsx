"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Monitor, AlertTriangle, BarChart3, Bell, Settings,
  Shield, CreditCard, Clock, Plus, Moon, Sun, Command as CommandIcon, ArrowRight
} from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
  category: "navigation" | "action" | "settings";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: () => router.push(ROUTES.dashboard), keywords: ["home", "overview"], category: "navigation" },
    { id: "monitors", label: "Go to Monitors", icon: Monitor, action: () => router.push(ROUTES.monitors), keywords: ["endpoints", "urls"], category: "navigation" },
    { id: "incidents", label: "Go to Incidents", icon: AlertTriangle, action: () => router.push(ROUTES.incidents), keywords: ["outages", "downtime"], category: "navigation" },
    { id: "analytics", label: "Go to Analytics", icon: BarChart3, action: () => router.push(ROUTES.analytics), keywords: ["charts", "metrics", "stats"], category: "navigation" },
    { id: "notifications", label: "Go to Notifications", icon: Bell, action: () => router.push(ROUTES.notifications), keywords: ["alerts"], category: "navigation" },
    { id: "activity", label: "Go to Activity", icon: Clock, action: () => router.push(ROUTES.activity), keywords: ["logs", "audit"], category: "navigation" },
    { id: "billing", label: "Go to Billing", icon: CreditCard, action: () => router.push("/billing"), keywords: ["plans", "subscription", "payment", "upgrade"], category: "navigation" },
    { id: "settings", label: "Go to Settings", icon: Settings, action: () => router.push(ROUTES.settings), keywords: ["preferences", "account", "profile"], category: "navigation" },
    { id: "admin", label: "Go to Admin", icon: Shield, action: () => router.push(ROUTES.admin), keywords: ["admin", "platform"], category: "navigation" },
    // Actions
    { id: "new-monitor", label: "Create New Monitor", icon: Plus, action: () => router.push(ROUTES.monitorNew), keywords: ["add", "create", "new", "endpoint"], category: "action" },
    // Settings
    { id: "toggle-theme", label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode", icon: theme === "dark" ? Sun : Moon, action: () => setTheme(theme === "dark" ? "light" : "dark"), keywords: ["dark", "light", "mode", "appearance"], category: "settings" },
  ], [router, theme, setTheme]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.keywords.some((k) => k.includes(lower))
    );
  }, [commands, search]);

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (cmd: CommandItem) => {
      cmd.action();
      setOpen(false);
    },
    []
  );

  // Keyboard navigation within the palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) handleSelect(cmd);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
              {/* Search */}
              <div className="flex items-center gap-3 px-4 border-b">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <>
                    {/* Group by category */}
                    {(["navigation", "action", "settings"] as const).map((cat) => {
                      const items = filteredCommands.filter((c) => c.category === cat);
                      if (items.length === 0) return null;
                      return (
                        <div key={cat} className="mb-1">
                          <p className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            {cat === "navigation" ? "Navigate" : cat === "action" ? "Actions" : "Settings"}
                          </p>
                          {items.map((cmd) => {
                            const globalIdx = filteredCommands.indexOf(cmd);
                            return (
                              <button
                                key={cmd.id}
                                onClick={() => handleSelect(cmd)}
                                onMouseEnter={() => setSelectedIndex(globalIdx)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                  globalIdx === selectedIndex
                                    ? "bg-accent text-accent-foreground"
                                    : "text-foreground hover:bg-accent/50"
                                )}
                              >
                                <cmd.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="flex-1 text-left">{cmd.label}</span>
                                {globalIdx === selectedIndex && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t text-[10px] text-muted-foreground bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border px-1 py-0.5 font-mono">↑↓</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border px-1 py-0.5 font-mono">↵</kbd> Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <CommandIcon className="h-3 w-3" />K to toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
