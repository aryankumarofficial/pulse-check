"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Lock } from "lucide-react";
import { insforge } from "@/lib/insforge";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/validators/auth";
import { ROUTES } from "@/lib/constants";
import {
  AuthShell,
  AuthCard,
  AuthHeader,
  AuthAlert,
  AuthField,
  AuthPasswordField,
  AuthBackLink,
  AuthSuccessState,
  AuthPageLoader,
  AuthSubmitButton,
} from "@/components/auth";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}••••@${domain}`;
}

function ResetPasswordContent() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const linkToken = searchParams.get("token");
  const linkStatus = searchParams.get("insforge_status");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: linkStatus === "ready" && linkToken ? linkToken : "",
    },
  });

  const newPassword = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);

    const { data: tokenData, error: tokenError } =
      await insforge.auth.exchangeResetPasswordToken({
        email,
        code: data.code,
      });

    if (tokenError || !tokenData?.token) {
      setError(tokenError?.message || "Invalid reset code. Please try again.");
      return;
    }

    const { error: resetError } = await insforge.auth.resetPassword({
      newPassword: data.newPassword,
      otp: tokenData.token,
    });

    if (resetError) {
      setError(resetError.message || "Failed to reset password. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(ROUTES.signIn), 3000);
  };

  if (success) {
    return (
      <AuthShell variant="reset">
        <AuthCard>
          <AuthSuccessState
            icon={ShieldCheck}
            title="Password updated"
            description="Your password has been reset successfully. All other sessions have been signed out. Redirecting to sign in…"
            primaryAction={{
              label: "Continue to sign in",
              href: ROUTES.signIn,
            }}
          />
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell variant="reset">
      <AuthCard>
        <AuthBackLink href={ROUTES.signIn}>Back</AuthBackLink>

        <AuthHeader
          title="Reset your password"
          description={
            email ? (
              <>
                Creating a new password for{" "}
                <span className="font-medium text-foreground">
                  {maskEmail(email)}
                </span>
              </>
            ) : (
              "Enter your reset code and choose a new password"
            )
          }
        />

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthField
            label="Verification code"
            placeholder="123456"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            icon={ShieldCheck}
            className="text-center text-lg tracking-[0.3em] font-mono"
            error={errors.code?.message}
            {...register("code")}
          />

          <AuthPasswordField
            label="New password"
            placeholder="••••••••"
            autoComplete="new-password"
            showStrength
            strengthSeed={newPassword}
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <AuthPasswordField
            label="Confirm new password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            matchHint={passwordsMatch ? "✓ Passwords match" : undefined}
            {...register("confirmPassword")}
          />

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            All sessions will be signed out after reset.
          </p>

          <AuthSubmitButton loading={isSubmitting}>
            Reset password
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageLoader variant="reset" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
