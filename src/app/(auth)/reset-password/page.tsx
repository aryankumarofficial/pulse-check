"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, ShieldCheck, Eye, EyeOff, Activity } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { resetPasswordSchema, type ResetPasswordInput } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

function ResetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);

    // Step 1: Exchange code for token
    const { data: tokenData, error: tokenError } =
      await insforge.auth.exchangeResetPasswordToken({
        email,
        code: data.code,
      });

    if (tokenError || !tokenData?.token) {
      setError(tokenError?.message || "Invalid reset code");
      return;
    }

    // Step 2: Reset password with token
    const { error: resetError } = await insforge.auth.resetPassword({
      newPassword: data.newPassword,
      otp: tokenData.token,
    });

    if (resetError) {
      setError(resetError.message || "Failed to reset password");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(ROUTES.signIn), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Password reset!</h2>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <Link
          href={ROUTES.signIn}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Reset your password</h2>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span> and choose a new password
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Reset Code</Label>
            <Input
              id="code"
              placeholder="123456"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Reset Password
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
