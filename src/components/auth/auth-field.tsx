"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  labelAction?: React.ReactNode;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  (
    {
      label,
      icon: Icon,
      error,
      hint,
      labelAction,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || props.name;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
          </Label>
          {labelAction}
        </div>
        <div className="relative group">
          {Icon && (
            <Icon
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none"
              aria-hidden
            />
          )}
          <Input
            ref={ref}
            id={fieldId}
            className={cn(
              "auth-input h-11 rounded-lg text-sm",
              Icon && "pl-10",
              error &&
                "border-destructive focus-visible:ring-destructive/40 aria-invalid:border-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
            }
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="text-xs text-destructive font-medium animate-fade-in"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
AuthField.displayName = "AuthField";
