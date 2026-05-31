import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  Globe,
  Shield,
  Zap,
} from "lucide-react";

export type AuthBrandVariant =
  | "sign-in"
  | "sign-up"
  | "recovery"
  | "verify"
  | "reset";

export const AUTH_BRAND_CONTENT: Record<
  AuthBrandVariant,
  {
    headline: string;
    headlineAccent?: string;
    description: string;
    stats: { label: string; icon?: LucideIcon }[];
  }
> = {
  "sign-in": {
    headline: "Monitor everything.",
    headlineAccent: "Miss nothing.",
    description:
      "Real-time uptime monitoring for websites, APIs, and AI endpoints. Get instant alerts when things go down.",
    stats: [
      { label: "99.9% uptime tracking" },
      { label: "60s check intervals" },
      { label: "Instant alerts" },
    ],
  },
  "sign-up": {
    headline: "Start monitoring",
    headlineAccent: "in seconds.",
    description:
      "Free plan includes 5 monitors with 60-second checks. No credit card required.",
    stats: [
      { label: "Websites", icon: Globe },
      { label: "REST APIs", icon: Zap },
      { label: "AI endpoints", icon: Activity },
      { label: "SSL certs", icon: Shield },
    ],
  },
  recovery: {
    headline: "Account recovery",
    headlineAccent: "made simple.",
    description:
      "We'll send a secure reset code to your inbox so you can get back to monitoring quickly.",
    stats: [
      { label: "Secure 6-digit reset codes" },
      { label: "Codes expire in 15 minutes" },
      { label: "No account lockouts" },
    ],
  },
  verify: {
    headline: "One-time",
    headlineAccent: "verification.",
    description:
      "Enter the 6-digit code we sent to your inbox to activate your workspace.",
    stats: [
      { label: "Codes are single-use" },
      { label: "Expires in 15 minutes" },
      { label: "Encrypted & secure" },
    ],
  },
  reset: {
    headline: "Set your new",
    headlineAccent: "password.",
    description:
      "Choose a strong password to protect your monitors and alert settings.",
    stats: [
      { label: "Minimum 6 characters" },
      { label: "Mix of letters & numbers" },
      { label: "All sessions signed out after reset" },
    ],
  },
};

export const TRUST_BADGES = [
  { icon: Bell, text: "Instant downtime alerts" },
  { icon: Globe, text: "Global edge checks" },
  { icon: Shield, text: "SOC2-ready security" },
] as const;
