"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, KeyRound, AlertTriangle } from "lucide-react";
import { insforge } from "@/lib/insforge";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validators/auth";
import { ROUTES } from "@/lib/constants";
import {
  AuthShell,
  AuthCard,
  AuthHeader,
  AuthAlert,
  AuthField,
  AuthBackLink,
  AuthIconBadge,
  AuthSubmitButton,
  AuthFooterLink,
} from "@/components/auth";
import { Button } from "@/components/ui/button";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}••••@${domain}`;
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    const { error: sendError } = await insforge.auth.sendResetPasswordEmail({
      email: data.email,
      redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
    });

    if (sendError) {
      setError(sendError.message || "Failed to send reset email. Please try again.");
      return;
    }

    setSent(true);
  };

  const email = getValues("email");

  return (
    <AuthShell variant="recovery">
      <AuthCard>
        <AuthBackLink href={ROUTES.signIn} />

        {sent ? (
          <div className="space-y-6">
            <AuthIconBadge icon={Mail} tone="success" />
            <AuthHeader
              align="center"
              title="Check your email"
              description={
                <>
                  We sent a 6-digit reset code to{" "}
                  <span className="inline-flex items-center rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-0.5 font-medium text-foreground mt-1">
                    {maskEmail(email)}
                  </span>
                </>
              }
            />

            <AuthAlert variant="warning">
              <span className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                The code expires in 15 minutes. Check your spam folder if you
                don&apos;t see it.
              </span>
            </AuthAlert>

            <Button asChild className="auth-cta w-full" size="lg">
              <Link
                href={`${ROUTES.resetPassword}?email=${encodeURIComponent(email)}`}
              >
                Enter reset code
              </Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive it?{" "}
              <button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Resend email
              </button>
            </p>
          </div>
        ) : (
          <>
            <AuthIconBadge icon={KeyRound} tone="warning" />
            <AuthHeader
              align="center"
              title="Forgot your password?"
              description="Enter your email and we'll send you a reset code"
            />

            {error && <AuthAlert variant="error">{error}</AuthAlert>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AuthField
                label="Email address"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />

              <AuthSubmitButton loading={isSubmitting}>
                Send reset code
              </AuthSubmitButton>
            </form>

            <AuthFooterLink
              text="Remember your password?"
              linkText="Sign in"
              href={ROUTES.signIn}
            />
          </>
        )}
      </AuthCard>
    </AuthShell>
  );
}
