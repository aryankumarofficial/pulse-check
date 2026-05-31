import { Activity, Loader2 } from "lucide-react";
import { AuthShell } from "./auth-shell";
import type { AuthBrandVariant } from "./auth-config";

interface AuthPageLoaderProps {
  variant?: AuthBrandVariant;
  label?: string;
}

export function AuthPageLoader({
  variant = "sign-in",
  label = "Loading…",
}: AuthPageLoaderProps) {
  return (
    <AuthShell variant={variant} centered>
      <div
        className="flex flex-col items-center gap-4 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center opacity-90">
            <Activity className="h-6 w-6 text-white" aria-hidden />
          </div>
          <Loader2
            className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-primary bg-background rounded-full"
            aria-hidden
          />
        </div>
        <p className="text-sm font-medium">{label}</p>
      </div>
    </AuthShell>
  );
}
