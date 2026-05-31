# PulseCheck Design System (Auth Redesign Reference)

## Brand
- Product: PulseCheck — uptime monitoring SaaS
- Personality: Modern premium B2B SaaS, trustworthy, technical but approachable
- Logo: Activity icon in rounded-lg gradient-primary (blue-600 → indigo-600) container

## Colors
- Primary: hsl(221 83% 53%) light / hsl(217 91% 60%) dark — blue
- Hero gradient text: blue-600 → purple-600
- Accent gradients: gradient-primary (blue→indigo), gradient-mesh (subtle radial blues/greens/purples)
- Success: emerald-500 / hsl(142 71% 45%)
- Destructive: red
- Warning: amber
- Background light: white; dark: hsl(224 71% 4%)
- Muted text: hsl(215 16% 47%)

## Typography
- Font: Geist Sans (system fallback)
- H1 hero: text-4xl–6xl font-bold tracking-tight
- Auth headings: text-2xl font-bold tracking-tight
- Body: text-sm/base text-muted-foreground
- Labels: text-sm font-medium

## Spacing & Radius
- --radius: 0.625rem (10px)
- Cards: rounded-xl / rounded-2xl
- Buttons/inputs: rounded-md / rounded-lg
- Section padding: p-8, max-w-md forms

## Components
- Buttons: primary filled with shadow-primary/25 on CTA; outline for secondary/OAuth
- Inputs: h-9–11, border-input, ring on focus, icon left padding pl-10
- Cards: border bg-card, hover:shadow-lg on marketing
- Glass: backdrop-blur-xl for nav
- Alerts: border + tinted bg (red/emerald/blue)

## Layout Pattern (target auth)
- Desktop: 48% brand panel (gradient + mesh + white copy) | 52% form area with subtle gradient-mesh bg
- Form in elevated card (glass-card or white card with shadow-xl)
- Mobile: stacked — logo header, full-width form card
- Theme toggle top-right on auth pages
- OAuth: 2-col grid Google + GitHub with brand icons

## Auth Screens Required
1. Login — email, password, forgot link, OAuth, sign up link
2. Sign Up — OAuth first, name/email/password/confirm, trust badges
3. Forgot Password — email, success state with CTA to reset
4. OTP Verification — 6 digit boxes, resend, verify CTA
5. Reset Password — OTP + new password fields
6. Success Confirmation — password reset / email verified
7. Social Login — loading spinner on OAuth buttons
8. Error States — inline field errors + banner alerts
9. Loading States — button spinners, page skeleton

## Copy Tone
- Clear, concise, conversion-focused
- Example: "Welcome back", "Start monitoring — free", "Check your email"

## Dark Mode
- Full dark mode support via .dark class
- Form cards slightly elevated from bg in dark (border-border, bg-card)
