"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { ROUTES } from "@/lib/constants";

const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.signIn,
  ROUTES.signUp,
  ROUTES.verifyEmail,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, user, refreshTrigger } = useAuthStore();
  const { setCurrentTenant, setMembership, setPlan } = useTenantStore();
  const router = useRouter();
  const pathname = usePathname();

  const loadTenant = useCallback(
    async (userId: string) => {
      const { data: members } = await insforge.database
        .from("tenant_members")
        .select("*, tenants(*)")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (members) {
        const tenant = (members as Record<string, unknown>).tenants as Record<string, unknown> | null;
        if (tenant) {
          setCurrentTenant(tenant as unknown as import("@/types/tenant").Tenant);
          setMembership({
            id: members.id as string,
            tenant_id: members.tenant_id as string,
            user_id: members.user_id as string,
            role: members.role as "owner" | "admin" | "member",
            created_at: members.created_at as string,
          });


          const { data: plan } = await insforge.database
            .from("plans")
            .select("*")
            .eq("id", (tenant as Record<string, unknown>).plan_id)
            .single();

          if (plan) {
            setPlan(plan as import("@/types/tenant").Plan);
          }

          // Fetch active subscription
          const { data: subscription, error: subError } = await insforge.database
            .from("subscriptions")
            .select("*")
            .eq("tenant_id", (tenant as Record<string, unknown>).id)
            .maybeSingle();

          if (subscription) {
            useTenantStore.getState().setSubscription(subscription as import("@/types/tenant").Subscription);
          } else {
            useTenantStore.getState().setSubscription(null);
          }
        }
      } else {
        // Auto-create default tenant for new users
        const { data: freePlan, error: planError } = await insforge.database
          .from("plans")
          .select("id")
          .eq("name", "free")
          .single();

        if (freePlan) {
          const tenantId = crypto.randomUUID();

          const { error: tenantError } = await insforge.database
            .from("tenants")
            .insert([{
              id: tenantId,
              name: "My Workspace",
              slug: `workspace-${Math.random().toString(36).substring(2, 8)}`,
              owner_id: userId,
              plan_id: freePlan.id,
            }]);

          if (!tenantError) {
            const { error: memberError } = await insforge.database
              .from("tenant_members")
              .insert([{
                tenant_id: tenantId,
                user_id: userId,
                role: "owner",
              }]);
              
            if (memberError) console.error("Failed to add member", memberError);

            // Reload to set states properly
            return loadTenant(userId);
          } else {
            console.error("Failed to create tenant", tenantError);
          }
        } else {
          console.error("Failed to find free plan", planError);
        }
      }
    },
    [setCurrentTenant, setMembership, setPlan]
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            emailVerified: data.user.emailVerified,
            profile: data.user.profile || {},
            metadata: data.user.metadata || {},
          });
          await loadTenant(data.user.id);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    initAuth();
  }, [setUser, setLoading, loadTenant]);

  useEffect(() => {
    // Watch for refresh triggers from the auth store
    if (refreshTrigger > 0 && user?.id) {
      loadTenant(user.id);
    }
  }, [refreshTrigger, user?.id, loadTenant]);

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith("/sign-")
    );

    if (!useAuthStore.getState().isLoading) {
      if (!useAuthStore.getState().isAuthenticated && !isPublicRoute) {
        router.push(ROUTES.signIn);
      }
    }
  }, [pathname, router, user]);

  return <>{children}</>;
}
