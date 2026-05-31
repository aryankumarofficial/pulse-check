import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles = {
  primary: "bg-primary/10 border-primary/20 text-primary",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
} as const;

interface AuthIconBadgeProps {
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
  className?: string;
}

export function AuthIconBadge({
  icon: Icon,
  tone = "primary",
  className,
}: AuthIconBadgeProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-14 w-14 items-center justify-center rounded-full border",
        toneStyles[tone],
        className
      )}
    >
      <Icon className="h-7 w-7" aria-hidden />
    </div>
  );
}
