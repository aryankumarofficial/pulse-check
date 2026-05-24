import { NextResponse } from "next/server";
import { razorpay, RAZORPAY_PLAN_IDS } from "@/lib/razorpay";
import { createClient } from "@insforge/sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planName, billingPeriod = "monthly", tenantId } = body;

    if (!planName || !tenantId) {
      return NextResponse.json({ error: "Missing planName or tenantId" }, { status: 400 });
    }

    if (planName === "free") {
      return NextResponse.json({ error: "Free plan does not require payment" }, { status: 400 });
    }

    const planIds = RAZORPAY_PLAN_IDS[planName as keyof typeof RAZORPAY_PLAN_IDS];
    if (!planIds) {
      return NextResponse.json({ error: `Invalid plan: ${planName}` }, { status: 400 });
    }

    const razorpayPlanId = billingPeriod === "annual" ? planIds.annual : planIds.monthly;

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: `Razorpay plan ID not configured for ${planName}/${billingPeriod}. Set RAZORPAY_PLAN_${planName.toUpperCase()}_${billingPeriod.toUpperCase()} in .env` },
        { status: 500 }
      );
    }

    // Create a Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: billingPeriod === "annual" ? 10 : 120, // Max billing cycles
      quantity: 1,
      notes: {
        tenant_id: tenantId,
        plan_name: planName,
        billing_period: billingPeriod,
      },
    });

    return NextResponse.json({
      subscription_id: subscription.id,
      razorpay_key: process.env.RAZORPAY_KEY_ID,
      plan_name: planName,
      billing_period: billingPeriod,
    });
  } catch (error: any) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
