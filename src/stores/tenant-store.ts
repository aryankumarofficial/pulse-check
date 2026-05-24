import { create } from "zustand";
import type { Tenant, TenantMember, Plan, Subscription } from "@/types/tenant";

interface TenantState {
  currentTenant: Tenant | null;
  membership: TenantMember | null;
  plan: Plan | null;
  subscription: Subscription | null;
  isAdmin: boolean;
  isPro: boolean;
  isBusiness: boolean;
  
  setCurrentTenant: (tenant: Tenant | null) => void;
  setMembership: (membership: TenantMember | null) => void;
  setPlan: (plan: Plan | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  reset: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: null,
  membership: null,
  plan: null,
  subscription: null,
  isAdmin: false,
  isPro: false,
  isBusiness: false,

  setCurrentTenant: (currentTenant) => set({ currentTenant }),
  setMembership: (membership) => 
    set({ 
      membership, 
      isAdmin: membership?.role === "admin" || membership?.role === "owner" 
    }),
  setPlan: (plan) => 
    set({ 
      plan,
      isPro: plan?.name === "pro" || plan?.name === "business", // business includes pro features
      isBusiness: plan?.name === "business"
    }),
  setSubscription: (subscription) => set({ subscription }),
  reset: () =>
    set({ 
      currentTenant: null, 
      membership: null, 
      plan: null, 
      subscription: null,
      isAdmin: false,
      isPro: false,
      isBusiness: false
    }),
}));
