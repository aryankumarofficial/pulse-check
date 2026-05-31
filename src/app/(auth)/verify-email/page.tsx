"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { ROUTES } from "@/lib/constants";
import {
  AuthShell,
  AuthCard,
  AuthHeader,
  AuthAlert,
  AuthIconBadge,
  AuthOtpInput,
  AuthPageLoader,
  AuthSubmitButton,
} from "@/components/auth";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}••••@${domain}`;
}

function VerifyEmailContent() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const otp = code.join("");

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    const { data, error: verifyError } = await insforge.auth.verifyEmail({
      email,
      otp,
    });

    if (verifyError) {
      setError(verifyError.message || "Invalid verification code. Please try again.");
      setIsLoading(false);
      return;
    }

    if (data?.accessToken) {
      const userId = data.user?.id;
      if (userId) {
        const freePlan = await insforge.database
          .from("plans")
          .select("id")
          .eq("name", "free")
          .single();

        if (freePlan.data) {
          const { data: existingMember } = await insforge.database
            .from("tenant_members")
            .select("id")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

          if (!existingMember) {
            const slug = `workspace-${Date.now()}`;
            const { data: tenant } = await insforge.database
              .from("tenants")
              .insert({
                name: "My Workspace",
                slug,
                plan_id: freePlan.data.id,
                owner_id: userId,
              })
              .select()
              .single();

            if (tenant) {
              await insforge.database.from("tenant_members").insert({
                tenant_id: (tenant as { id: string }).id,
                user_id: userId,
                role: "owner",
              });
            }
          }
        }
      }
      router.push(ROUTES.dashboard);
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setError(null);
    await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: `${window.location.origin}${ROUTES.signIn}`,
    });
    setIsResending(false);
    setResendCooldown(45);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <AuthShell variant="verify">
      <AuthCard>
        <AuthIconBadge icon={MailCheck} tone="primary" />
        <AuthHeader
          align="center"
          title="Verify your email"
          description={
            <>
              Enter the 6-digit code we sent to{" "}
              <span className="font-medium text-foreground">
                {email ? maskEmail(email) : "your email"}
              </span>
            </>
          }
        />

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <AuthOtpInput value={code} onChange={setCode} disabled={isLoading} error={!!error} />

        <AuthSubmitButton
          type="button"
          loading={isLoading}
          disabled={otp.length !== 6}
          onClick={handleVerify}
        >
          Verify email
        </AuthSubmitButton>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-medium text-primary hover:underline underline-offset-4 disabled:opacity-50"
          >
            {isResending
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in 0:${String(resendCooldown).padStart(2, "0")}`
                : "Resend code"}
          </button>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthPageLoader variant="verify" label="Loading verification…" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
