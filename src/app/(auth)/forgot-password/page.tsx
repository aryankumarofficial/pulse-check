"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

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
    });

    if (sendError) {
      setError(sendError.message || "Failed to send reset email");
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <Link
          href={ROUTES.signIn}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <KeyRound className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
              We sent a password reset code to{" "}
              <span className="font-medium text-foreground">
                {getValues("email")}
              </span>
            </p>
            <Link href={`${ROUTES.resetPassword}?email=${encodeURIComponent(getValues("email"))}`}>
              <Button className="w-full" size="lg">
                Enter Reset Code
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Forgot your password?</h2>
              <p className="text-muted-foreground">
                Enter your email and we&apos;ll send you a reset code
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Send Reset Code
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
