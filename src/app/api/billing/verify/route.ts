import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@insforge/sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      tenant_id,
      plan_name,
      billing_period,
    } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify signature: HMAC-SHA256(razorpay_payment_id + "|" + razorpay_subscription_id)
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Payment is verified — sync subscription
    if (tenant_id && plan_name) {
      const client = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || "",
        anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
      });

      await client.database.rpc("sync_subscription", {
        p_tenant_id: tenant_id,
        p_plan_name: plan_name,
        p_razorpay_subscription_id: razorpay_subscription_id,
        p_razorpay_customer_id: null,
        p_status: "active",
        p_billing_period: billing_period || "monthly",
      });
    }

    return NextResponse.json({ verified: true, subscription_id: razorpay_subscription_id });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
