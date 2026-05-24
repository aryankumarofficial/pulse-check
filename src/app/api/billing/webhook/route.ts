import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@insforge/sdk";

// Razorpay sends webhooks as POST with JSON body + x-razorpay-signature header
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // HMAC-SHA256 verification
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    // Create a service client to bypass RLS
    const client = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || "",
      anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
    });

    switch (eventType) {
      case "subscription.activated":
      case "subscription.charged": {
        const sub = event.payload.subscription.entity;
        const tenantId = sub.notes?.tenant_id;
        const planName = sub.notes?.plan_name;
        const billingPeriod = sub.notes?.billing_period || "monthly";

        if (tenantId && planName) {
          await client.database.rpc("sync_subscription", {
            p_tenant_id: tenantId,
            p_plan_name: planName,
            p_razorpay_subscription_id: sub.id,
            p_razorpay_customer_id: sub.customer_id || null,
            p_status: "active",
            p_billing_period: billingPeriod,
            p_period_start: sub.current_start ? new Date(sub.current_start * 1000).toISOString() : new Date().toISOString(),
            p_period_end: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
          });

          console.log(`Subscription activated for tenant ${tenantId}: ${planName}`);
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload.subscription.entity;
        const tenantId = sub.notes?.tenant_id;

        if (tenantId) {
          // Downgrade to free plan
          await client.database.rpc("sync_subscription", {
            p_tenant_id: tenantId,
            p_plan_name: "free",
            p_razorpay_subscription_id: sub.id,
            p_razorpay_customer_id: sub.customer_id || null,
            p_status: "cancelled",
            p_billing_period: "monthly",
          });

          console.log(`Subscription cancelled for tenant ${tenantId}`);
        }
        break;
      }

      case "subscription.paused": {
        const sub = event.payload.subscription.entity;
        const tenantId = sub.notes?.tenant_id;

        if (tenantId) {
          // Keep current plan but mark as paused
          const planName = sub.notes?.plan_name || "free";
          await client.database.rpc("sync_subscription", {
            p_tenant_id: tenantId,
            p_plan_name: planName,
            p_razorpay_subscription_id: sub.id,
            p_razorpay_customer_id: sub.customer_id || null,
            p_status: "paused",
            p_billing_period: sub.notes?.billing_period || "monthly",
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        console.error("Payment failed:", payment.id, payment.error_description);
        // Could send a notification to the user here
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
