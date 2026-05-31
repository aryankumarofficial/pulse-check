"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { useAuthStore } from "@/stores/auth-store";
import { signInSchema, type SignInInput } from "@/validators/auth";
import { ROUTES } from "@/lib/constants";
import {
  AuthShell,
  AuthCard,
  AuthHeader,
  AuthAlert,
  AuthField,
  AuthPasswordField,
  AuthOAuthButtons,
  AuthDivider,
  AuthFooterLink,
  AuthPageLoader,
  AuthSubmitButton,
} from "@/components/auth";

function SignInContent() {
  const [error, setError] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  const insforgeStatus = searchParams.get("insforge_status");
  const insforgeType = searchParams.get("insforge_type");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setError(null);
    const { data: result, error: authError } =
      await insforge.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      setError(authError.message || "Invalid email or password. Please try again.");
      return;
    }

    if (result?.user) {
      setUser({
        id: result.user.id,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
        profile: result.user.profile || {},
        metadata: result.user.metadata || {},
      });
      router.push(ROUTES.dashboard);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    setError(null);
    await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}${ROUTES.dashboard}`,
    });
  };

  return (
    <AuthShell variant="sign-in">
      <AuthCard>
        <AuthHeader
          title="Welcome back"
          description="Sign in to continue monitoring"
        />

        {insforgeStatus === "success" && insforgeType === "verify_email" && (
          <AuthAlert variant="success">
            Email verified successfully! Sign in with your email and password.
          </AuthAlert>
        )}

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

          <AuthPasswordField
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            labelAction={
              <Link
                href={ROUTES.forgotPassword}
                className="text-xs font-medium text-primary hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            }
            {...register("password")}
          />

          <AuthSubmitButton loading={isSubmitting}>Sign in</AuthSubmitButton>
        </form>

        <AuthDivider label="Or continue with" />

        <AuthOAuthButtons
          onGoogle={() => handleOAuth("google")}
          onGitHub={() => handleOAuth("github")}
          loadingProvider={isOAuthLoading}
        />

        <AuthFooterLink
          text="Don't have an account?"
          linkText="Start for free"
          href={ROUTES.signUp}
        />
      </AuthCard>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthPageLoader variant="sign-in" />}>
      <SignInContent />
    </Suspense>
  );
}
