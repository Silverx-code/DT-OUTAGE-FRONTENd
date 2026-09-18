import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { OnboardingTour } from "@/components/onboarding-tour";

export const metadata: Metadata = {
  title: "Gridline — DT Outage Reporting",
  description:
    "Distribution transformer outage reporting and restoration tracking for field crews and dispatch.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded via <link> rather than next/font/google so the
          build doesn't require network access to fonts.googleapis.com at
          build time (next/font fetches + self-hosts at build time). Swap
          this for next/font once the app is running somewhere with normal
          internet access - it's the better long-term choice for
          performance and privacy.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface text-body-md flex flex-col min-h-screen antialiased">
        <AuthProvider>{children}<OnboardingTour /></AuthProvider>
      </body>
    </html>
  );
}
