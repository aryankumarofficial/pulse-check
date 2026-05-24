"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Loader2, MailCheck } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";

function VerifyEmailContent() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otp = code.join("");
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    const { data, error: verifyError } = await insforge.auth.verifyEmail({
      email,
      otp,
    });

    if (verifyError) {
      setError(verifyError.message || "Invalid verification code");
      setIsLoading(false);
      return;
    }

    if (data?.accessToken) {
      // Auto-create tenant
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
    setIsResending(true);
    await insforge.auth.resendVerificationEmail({ email });
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
            <MailCheck className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-14 w-12 text-center text-2xl font-bold"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full"
          size="lg"
          disabled={isLoading || code.join("").length !== 6}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Verify Email
        </Button>

        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-primary font-medium hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
