"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, ShieldCheck } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { signUpSchema, type SignUpInput } from "@/validators/auth";
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
  AuthSubmitButton,
} from "@/components/auth";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignUpInput) => {
    setError(null);
    const { data: result, error: authError } = await insforge.auth.signUp({
      email: data.email,
      password: data.password,
      name: data.name,
      redirectTo: `${window.location.origin}${ROUTES.signIn}`,
    });

    if (authError) {
      setError(authError.message || "Failed to create account. Please try again.");
      return;
    }

    if (result?.requireEmailVerification) {
      router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(data.email)}`);
    } else if (result?.accessToken) {
      const userId = result.user?.id;
      if (userId) {
        const freePlan = await insforge.database
          .from("plans")
          .select("id")
          .eq("name", "free")
          .single();

        if (freePlan.data) {
          const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          const { data: tenant } = await insforge.database
            .from("tenants")
            .insert({
              name: `${data.name}'s Workspace`,
              slug: `${slug}-${Date.now()}`,
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
    <AuthShell variant="sign-up">
      <AuthCard>
        <AuthHeader
          title="Create your account"
          description="Free monitoring — no credit card required"
        />

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <AuthOAuthButtons
          layout="stack"
          onGoogle={() => handleOAuth("google")}
          onGitHub={() => handleOAuth("github")}
          loadingProvider={isOAuthLoading}
        />

        <AuthDivider label="Or with email" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthField
            label="Full name"
            placeholder="Alex Johnson"
            autoComplete="name"
            icon={User}
            error={errors.name?.message}
            {...register("name")}
          />

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
            autoComplete="new-password"
            showStrength
            strengthSeed={password}
            error={errors.password?.message}
            {...register("password")}
          />

          <AuthPasswordField
            label="Confirm password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <AuthSubmitButton loading={isSubmitting}>
            Create account
          </AuthSubmitButton>
        </form>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden />
          5 free monitors · 60s checks · No credit card
        </p>

        <AuthFooterLink
          text="Already have an account?"
          linkText="Sign in"
          href={ROUTES.signIn}
        />
      </AuthCard>
    </AuthShell>
  );
}
