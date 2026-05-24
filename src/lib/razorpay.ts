import Razorpay from "razorpay";

// Server-side only — never import this in client components
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "mock_key_for_build",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret_for_build",
});

// Plan name → Razorpay Plan ID mapping
// You must create these plans in Razorpay Dashboard first
// and fill in the IDs here or in .env
export const RAZORPAY_PLAN_IDS: Record<string, { monthly: string; annual: string }> = {
  pro: {
    monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY || "",
    annual: process.env.RAZORPAY_PLAN_PRO_ANNUAL || "",
  },
  business: {
    monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY || "",
    annual: process.env.RAZORPAY_PLAN_BUSINESS_ANNUAL || "",
  },
};

// Prices in paise (INR smallest unit)
export const PLAN_PRICES = {
  free: { monthly: 0, annual: 0 },
  pro: { monthly: 1900_00, annual: 19000_00 },      // ₹1,900/mo or ₹19,000/yr
  business: { monthly: 4900_00, annual: 49000_00 },  // ₹4,900/mo or ₹49,000/yr
} as const;
