"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthIconBadge } from "./auth-icon-badge";

interface AuthSuccessStateProps {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  children?: React.ReactNode;
}

export function AuthSuccessState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: AuthSuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="text-center space-y-6"
    >
      <AuthIconBadge icon={icon} tone="success" />
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {children}
      <div className="space-y-3 pt-2">
        {primaryAction && (
          <Button asChild className="auth-cta" size="lg">
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        )}
        {secondaryAction && (
          <Link
            href={secondaryAction.href}
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
