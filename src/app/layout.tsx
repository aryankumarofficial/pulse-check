import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PulseCheck — Website & API Monitoring",
    template: "%s | PulseCheck",
  },
  description:
    "Monitor websites, APIs, and AI endpoints. Get instant alerts when things go down. Track uptime, response times, and incidents in real-time.",
  keywords: [
    "uptime monitoring",
    "website monitoring",
    "API monitoring",
    "downtime detection",
    "incident management",
    "status page",
    "SaaS",
  ],
  authors: [{ name: "PulseCheck Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pulsecheck.com",
    title: "PulseCheck — Website & API Monitoring",
    description: "Monitor websites, APIs, and AI endpoints. Get instant alerts when things go down. Track uptime, response times, and incidents in real-time.",
    siteName: "PulseCheck",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseCheck — Website & API Monitoring",
    description: "Monitor websites, APIs, and AI endpoints. Get instant alerts when things go down.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
