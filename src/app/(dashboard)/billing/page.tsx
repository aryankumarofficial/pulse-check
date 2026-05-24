"use client";

import { useState } from "react";
import { Check, Zap, Building2, Crown, Loader2, CreditCard, Smartphone, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { useTenantStore } from "@/stores/tenant-store";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    name: "free",
    display: "Free",
    icon: Zap,
    description: "For hobbyists and personal projects",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "5 monitors",
      "1-minute check interval",
      "7 days data retention",
      "Email alerts",
      "SSL monitoring",
    ],
    limitations: [
      "No Discord/Slack alerts",
      "No status pages",
      "No API access",
    ],
    color: "text-muted-foreground",
    borderColor: "border-border",
    popular: false,
  },
  {
    name: "pro",
    display: "Pro",
    icon: Crown,
    description: "For growing teams and businesses",
    priceMonthly: 1900,
    priceAnnual: 19000,
    features: [
      "50 monitors",
      "30-second check interval",
      "90 days data retention",
      "Email + Discord + Slack alerts",
      "Public status pages",
      "API access",
      "SSL monitoring",
      "Priority support",
    ],
    limitations: [],
    color: "text-purple-500",
    borderColor: "border-purple-500",
    popular: true,
  },
  {
    name: "business",
    display: "Business",
    icon: Building2,
    description: "For large teams and enterprises",
    priceMonthly: 4900,
    priceAnnual: 49000,
    features: [
      "500 monitors",
      "15-second check interval",
      "1 year data retention",
      "All alert channels + Webhooks",
      "Team members",
      "Advanced analytics",
      "Custom domains",
      "API access",
      "Dedicated support",
    ],
    limitations: [],
    color: "text-amber-500",
    borderColor: "border-amber-500",
    popular: false,
  },
];

export default function BillingPage() {
  const { currentTenant, plan: currentPlan } = useTenantStore();
  const { user } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [subscribing, setSubscribing] = useState<string | null>(null);

  // Fetch usage quota
  const { data: quota } = useQuery({
    queryKey: ["quota", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await insforge.database.rpc("validate_monitor_quota", {
        p_tenant_id: currentTenant!.id,
      });
      if (error) throw error;
      return typeof data === "string" ? JSON.parse(data) : data;
    },
    enabled: !!currentTenant,
  });

  // Fetch current subscription
  const { data: subscription } = useQuery({
    queryKey: ["subscription", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await insforge.database
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", currentTenant!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!currentTenant,
  });

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.head.appendChild(script);
    });
  };

  const handleSubscribe = async (planName: string) => {
    if (!currentTenant || !user) return;
    if (planName === "free") return;
    if (planName === currentPlan?.name) return;

    setSubscribing(planName);

    try {
      // 1. Create subscription on server
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          billingPeriod,
          tenantId: currentTenant.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Load Razorpay checkout
      await loadRazorpayScript();

      const options = {
        key: data.razorpay_key,
        subscription_id: data.subscription_id,
        name: "PulseCheck",
        description: `${data.plan_name} Plan — ${data.billing_period}`,
        prefill: {
          email: user.email,
          name: user.profile?.name || "",
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          confirm_close: true,
        },
        // UPI as preferred method, then cards
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [{ method: "upi" }],
              },
              card: {
                name: "Cards",
                instruments: [{ method: "card" }],
              },
            },
            sequence: ["block.upi", "block.card"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: any) => {
          // 3. Verify payment on server
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              tenant_id: currentTenant.id,
              plan_name: planName,
              billing_period: billingPeriod,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.verified) {
            toast.success(`Upgraded to ${planName} plan! 🎉`);
            // Reload to refresh plan data
            window.location.reload();
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (paise: number) => {
    if (paise === 0) return "Free";
    return `₹${(paise / 100).toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Choose the plan that fits your monitoring needs. All plans include core monitoring features.
        </p>
      </div>

      {/* Usage meter */}
      {quota && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Monitor Usage</p>
                <p className="text-xs text-muted-foreground">
                  {quota.current} / {quota.max} monitors used on <span className="font-medium">{quota.plan_name}</span> plan
                </p>
              </div>
              <div className="w-48">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      quota.current / quota.max > 0.8 ? "bg-red-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(100, (quota.current / quota.max) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing period toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border p-1 bg-muted/50">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              billingPeriod === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              billingPeriod === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Annual <Badge className="ml-1 bg-emerald-500/10 text-emerald-500 text-[10px]">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Payment methods indicator */}
      <div className="flex justify-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> UPI</span>
        <span>•</span>
        <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Mastercard</span>
        <span>•</span>
        <span>RuPay</span>
        <span>•</span>
        <span>Visa</span>
        <span>•</span>
        <span>Net Banking</span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.name === plan.name;
          const price = billingPeriod === "annual" ? plan.priceAnnual : plan.priceMonthly;

          return (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col transition-all hover:shadow-lg",
                plan.popular && "ring-2 ring-purple-500",
                isCurrent && "ring-2 ring-primary"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className={cn("h-5 w-5", plan.color)} />
                  <CardTitle className="text-lg">{plan.display}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-3">
                  <span className="text-3xl font-bold">{formatPrice(price)}</span>
                  {price > 0 && (
                    <span className="text-muted-foreground text-sm">
                      /{billingPeriod === "annual" ? "year" : "month"}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", plan.color)} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-sm text-muted-foreground/60 line-through">
                      <span className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.name === "free" ? (
                    <Button variant="outline" className="w-full" disabled={currentPlan?.name === "free"}>
                      {currentPlan?.name === "free" ? "Current Plan" : "Downgrade"}
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "w-full",
                        plan.popular && "bg-purple-600 hover:bg-purple-700"
                      )}
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={subscribing !== null}
                    >
                      {subscribing === plan.name ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      {isCurrent ? "Current" : currentPlan && plans.findIndex(p => p.name === currentPlan.name) > plans.findIndex(p => p.name === plan.name) ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscription info */}
      {subscription && subscription.status !== "cancelled" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={subscription.status === "active" ? "default" : "secondary"} className={subscription.status === "active" ? "bg-emerald-500/10 text-emerald-500" : ""}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Billing</p>
                <p className="font-medium capitalize">{subscription.billing_period}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Razorpay ID</p>
                <p className="font-mono text-xs">{subscription.razorpay_subscription_id || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Billing</p>
                <p className="font-medium">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
