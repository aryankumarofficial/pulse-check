import { create } from "zustand";
import type { Tenant, TenantMember, Plan } from "@/types/tenant";

interface TenantState {
  currentTenant: Tenant | null;
  membership: TenantMember | null;
  plan: Plan | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setMembership: (membership: TenantMember | null) => void;
  setPlan: (plan: Plan | null) => void;
  reset: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: null,
  membership: null,
  plan: null,
  setCurrentTenant: (currentTenant) => set({ currentTenant }),
  setMembership: (membership) => set({ membership }),
  setPlan: (plan) => set({ plan }),
  reset: () =>
    set({ currentTenant: null, membership: null, plan: null }),
}));
