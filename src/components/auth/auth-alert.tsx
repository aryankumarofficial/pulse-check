"use client";

import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type AuthAlertVariant = "error" | "success" | "info" | "warning";

const variantStyles: Record<
  AuthAlertVariant,
  { container: string; icon: string; Icon: typeof AlertCircle }
> = {
  error: {
    container:
      "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
    icon: "text-destructive",
    Icon: AlertCircle,
  },
  success: {
    container:
      "border-success/30 bg-success/10 text-emerald-700 dark:text-emerald-400",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  info: {
    container:
      "border-primary/30 bg-primary/10 text-primary dark:text-blue-400",
    icon: "text-primary",
    Icon: Info,
  },
  warning: {
    container:
      "border-warning/30 bg-warning/10 text-amber-800 dark:text-amber-400",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
};

interface AuthAlertProps {
  variant: AuthAlertVariant;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AuthAlert({ variant, children, className, id }: AuthAlertProps) {
  const { container, icon, Icon } = variantStyles[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        id={id}
        role="alert"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed",
          container,
          className
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", icon)} aria-hidden />
        <div className="flex-1 min-w-0">{children}</div>
      </motion.div>
    </AnimatePresence>
  );
}
