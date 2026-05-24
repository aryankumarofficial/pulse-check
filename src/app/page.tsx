import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Globe,
  Bell,
  BarChart3,
  Bot,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { HomeNav } from "@/components/home-nav";

const features = [
  {
    icon: Globe,
    title: "Website Monitoring",
    description: "Monitor any HTTP/HTTPS endpoint with 60-second check intervals.",
  },
  {
    icon: Zap,
    title: "API Monitoring",
    description: "Track REST and GraphQL APIs with custom headers and body payloads.",
  },
  {
    icon: Bot,
    title: "AI Endpoint Monitoring",
    description: "Monitor LLM and AI service endpoints for availability and response times.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified via in-app, email, or webhooks the moment things go down.",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description: "Track uptime, response times, P95/P99 latencies, and historical trends.",
  },
  {
    icon: Shield,
    title: "SSL Monitoring",
    description: "Get warned before your SSL certificates expire to prevent downtime.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["5 Monitors", "60s check interval", "30-day retention", "In-app alerts"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹19",
    period: "/month",
    features: [
      "50 Monitors",
      "60s check interval",
      "90-day retention",
      "Email & webhook alerts",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "₹49",
    period: "/month",
    features: [
      "200 Monitors",
      "60s check interval",
      "180-day retention",
      "All Pro features",
      "Team members",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              Now monitoring 10,000+ endpoints worldwide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Monitor everything.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Miss nothing.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time uptime monitoring for websites, APIs, and AI endpoints.
              Get instant alerts when things go down. Track performance
              with detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.signUp}>
                <span className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground text-base font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                  Start Monitoring — Free
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-border text-base font-medium hover:bg-accent transition-colors"
              >
                See Features
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              {["No credit card", "5 free monitors", "60s intervals"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Everything you need to stay online</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Comprehensive monitoring tools to keep your services running and your users happy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-4">
              Start free. Upgrade as you grow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border ${
                  plan.highlighted
                    ? "border-primary shadow-xl shadow-primary/10 scale-105"
                    : "border-border"
                } bg-card`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={ROUTES.signUp} className="block mt-8">
                  <span
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border hover:bg-accent"
                    }`}
                  >
                    {plan.cta}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Downtime Detector</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Downtime Detector. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
