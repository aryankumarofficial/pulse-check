"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthPasswordFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
  labelAction?: React.ReactNode;
  showStrength?: boolean;
  strength?: "weak" | "fair" | "good" | "strong";
  /** Pass watched password value for strength meter without controlling the input */
  strengthSeed?: string;
  matchHint?: string;
}

const strengthConfig = {
  weak: { bars: 1, label: "Weak", color: "bg-destructive" },
  fair: { bars: 2, label: "Fair", color: "bg-warning" },
  good: { bars: 3, label: "Good", color: "bg-emerald-500" },
  strong: { bars: 4, label: "Strong", color: "bg-primary" },
};

function getStrength(password: string): keyof typeof strengthConfig {
  if (password.length < 6) return "weak";
  if (password.length < 8) return "fair";
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "strong";
  return "good";
}

export const AuthPasswordField = React.forwardRef<
  HTMLInputElement,
  AuthPasswordFieldProps
>(
  (
    {
      label,
      error,
      hint,
      labelAction,
      showStrength,
      strength: strengthProp,
      strengthSeed,
      matchHint,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const fieldId = id || props.name;
    const pwd = strengthSeed ?? "";
    const strength = strengthProp ?? getStrength(pwd);
    const config = strengthConfig[strength];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
          </Label>
          {labelAction}
        </div>
        <div className="relative group">
          <Lock
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none"
            aria-hidden
          />
          <Input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            className={cn(
              "auth-input h-11 rounded-lg pl-10 pr-10 text-sm",
              error && "border-destructive focus-visible:ring-destructive/40",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
            }
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>

        {showStrength && pwd.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex gap-1" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= config.bars ? config.color : "bg-muted"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{config.label}</p>
          </div>
        )}

        {matchHint && !error && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            {matchHint}
          </p>
        )}

        {hint && !error && !matchHint && (
          <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="text-xs text-destructive font-medium"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
AuthPasswordField.displayName = "AuthPasswordField";
