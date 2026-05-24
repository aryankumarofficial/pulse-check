export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  max_monitors: number;
  check_interval_seconds: number;
  data_retention_days: number;
  features: Record<string, unknown>;
  price_monthly: number;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: "active" | "past_due" | "cancelled" | "paused";
  billing_period: "monthly" | "annual";
  razorpay_subscription_id?: string | null;
  current_period_end?: string | null;
  created_at: string;
}
