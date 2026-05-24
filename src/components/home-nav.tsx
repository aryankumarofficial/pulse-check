"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export function HomeNav() {
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">PulseCheck</span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && isAuthenticated ? (
              <Link href={ROUTES.dashboard}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href={ROUTES.signIn}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link href={ROUTES.signUp}>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
