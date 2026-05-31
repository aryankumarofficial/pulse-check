import Link from "next/link";
import { Activity } from "lucide-react";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { AuthBrandPanel } from "./auth-brand-panel";
import { AuthThemeToggle } from "./auth-theme-toggle";
import type { AuthBrandVariant } from "./auth-config";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  variant: AuthBrandVariant;
  /** Centered card without split panel (rare; prefer split) */
  centered?: boolean;
  className?: string;
}

export function AuthShell({
  children,
  variant,
  centered = false,
  className,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {!centered && <AuthBrandPanel variant={variant} />}

      <div
        className={cn(
          "relative flex-1 flex flex-col min-h-screen",
          centered && "lg:w-full"
        )}
      >
        <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />

        <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <Link
            href={ROUTES.home}
            className="lg:hidden inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Activity className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="lg:ml-auto">
            <AuthThemeToggle />
          </div>
        </header>

        <main
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-8 lg:pb-12",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
