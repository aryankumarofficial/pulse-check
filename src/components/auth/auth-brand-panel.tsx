import Link from "next/link";
import { Activity } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/constants";
import {
  AUTH_BRAND_CONTENT,
  TRUST_BADGES,
  type AuthBrandVariant,
} from "./auth-config";

interface AuthBrandPanelProps {
  variant: AuthBrandVariant;
}

export function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  const content = AUTH_BRAND_CONTENT[variant];

  return (
    <div className="relative hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col overflow-hidden">
      <div className="absolute inset-0 gradient-primary" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/85 to-purple-800/80" />
      <div className="absolute inset-0 gradient-mesh opacity-60 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,transparent_55%)]" />

      <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-12 text-white">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-3 w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-opacity hover:opacity-90"
        >
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-black/10">
            <Activity className="h-5 w-5" aria-hidden />
          </div>
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <div className="space-y-8 max-w-md">
          <div className="space-y-4">
            <h1 className="text-3xl xl:text-4xl font-bold leading-[1.15] tracking-tight">
              {content.headline}
              {content.headlineAccent && (
                <>
                  <br />
                  <span className="text-white/90">{content.headlineAccent}</span>
                </>
              )}
            </h1>
            <p className="text-base text-white/75 leading-relaxed">
              {content.description}
            </p>
          </div>

          {variant === "sign-up" ? (
            <div className="grid grid-cols-2 gap-2.5 max-w-xs">
              {content.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2.5 text-sm font-medium"
                >
                  {stat.icon && (
                    <stat.icon className="h-4 w-4 text-white/80 shrink-0" />
                  )}
                  {stat.label}
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {content.stats.map((stat) => (
                <li
                  key={stat.label}
                  className="flex items-center gap-2.5 text-sm text-white/80"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
                  {stat.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {TRUST_BADGES.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 text-xs text-white/55"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {text}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>

      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/[0.06] blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-16 -right-16 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none"
        aria-hidden
      />
    </div>
  );
}
