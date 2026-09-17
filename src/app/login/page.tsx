"use client";

import { useState } from "react";
import { startLogin } from "@/lib/msal";

export default function LoginPage() {
  const [error, setError] = useState("");
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID && process.env.NEXT_PUBLIC_AZURE_AD_API_SCOPE);

  async function login() {
    setError("");
    try { await startLogin(); } catch (loginError) { setError(loginError instanceof Error ? loginError.message : "Microsoft sign-in could not start."); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
            <span className="text-2xl font-bold">G</span>
          </div>
          <div>
            <p className="text-label-sm font-bold uppercase tracking-[0.2em] text-primary">Gridline</p>
            <p className="text-body-sm text-on-surface-variant">DT Outage Operations</p>
          </div>
        </div>

        <section className="rounded-2xl bg-surface-container-lowest p-7 shadow-[0_8px_30px_rgba(28,27,31,0.08)]">
          <p className="text-label-sm font-bold uppercase tracking-widest text-primary">Secure workspace</p>
          <h1 className="mt-2 text-headline-lg font-bold text-on-surface">Sign in to Gridline</h1>
          <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
            Access outage reporting, restoration tracking, and operational dashboards using your organization account.
          </p>

          <button onClick={login} disabled={!isConfigured} className={`mt-7 flex h-12 w-full items-center justify-center rounded-xl text-body-md font-bold transition-colors ${isConfigured ? "bg-primary text-on-primary hover:opacity-90" : "cursor-not-allowed bg-surface-container text-on-surface-variant"}`}>
            <span className="mr-2 text-lg">▣</span>
            Continue with Microsoft
          </button>

          <a href={process.env.NEXT_PUBLIC_ENTRA_PASSWORD_RESET_URL ?? "https://passwordreset.microsoftonline.com/"} target="_blank" rel="noreferrer" className="mt-5 block text-center text-label-md font-semibold text-primary underline underline-offset-2">
            Forgot your password?
          </a>

          {!isConfigured && <p className="mt-5 rounded-lg bg-secondary-container p-3 text-label-sm text-on-secondary-container">Microsoft sign-in is not configured yet. Add the Entra client ID, tenant ID, and redirect URI to the frontend environment.</p>}
          {error && <p className="mt-5 rounded-lg bg-error-container p-3 text-label-sm text-on-error-container">{error}</p>}

        </section>
        <p className="mt-6 text-center text-label-sm text-on-surface-variant">Authorized operations personnel only</p>
      </div>
    </main>
  );
}
