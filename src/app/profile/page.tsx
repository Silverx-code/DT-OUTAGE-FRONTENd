"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { api } from "@/lib/api";
import { useStaleData } from "@/lib/use-stale-data";
import type { Role, UserSummary } from "@/lib/types";

const roleInfo: Record<Role, { label: string; summary: string; access: string[] }> = {
  USER: { label: "Field User", summary: "Submit transformer outage reports and record restorations for your business unit.", access: ["View the live operations dashboard", "Report transformer outages", "Record transformer restorations", "Review outage history"] },
  PAT: { label: "PAT · Reporting & Analytics", summary: "Review and analyze submitted outage data across business units.", access: ["View system-wide outage dashboards", "Search and filter outage records", "Export filtered reports", "Read-only access to operational data"] },
  ADMIN: { label: "Administrator", summary: "Oversee outage operations and maintain Gridline user and reference data.", access: ["Monitor operational dashboards", "Manage user access", "Maintain transformer and lookup data", "Review and export outage history"] },
  SUPERADMIN: { label: "Super Administrator", summary: "Full access to Gridline administration and outage operations.", access: ["All Administrator capabilities", "Full system user and role administration", "System-wide operational oversight"] },
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");
  useStaleData("/me", setUser);
  useEffect(() => { api.get<UserSummary>("/me").then(setUser).catch(() => setError("Your profile could not be loaded.")); }, []);
  const info = user ? roleInfo[user.role] : null;

  return <AppShell title="My Profile" subtitle="Your Gridline account and access">
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-margin py-space-lg lg:px-10">
      {error && <p role="alert" className="rounded-xl bg-error-container p-4 text-on-error-container">{error}</p>}
      {user && info && <>
        <section className="flex flex-col gap-5 rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary"><Icon name="person" size={34}/></div>
          <div className="min-w-0 flex-1"><p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Account profile</p><h2 className="mt-1 text-headline-md font-bold">{user.fullName}</h2><p className="mt-1 break-all text-body-md text-on-surface-variant">{user.email}</p></div>
          <span className="w-fit rounded-full bg-primary-fixed px-4 py-2 text-label-md font-bold text-on-primary-fixed-variant">{info.label}</span>
        </section>
        <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary"><Icon name="badge" size={22}/><h3 className="text-label-lg font-bold">Your role</h3></div>
          <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">{info.summary}</p>
          <h4 className="mt-6 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Access included</h4>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">{info.access.map((item) => <li key={item} className="flex items-start gap-2 text-body-md"><Icon name="check_circle" size={18} className="mt-0.5 shrink-0 text-success"/>{item}</li>)}</ul>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm"><p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Business unit</p><p className="mt-2 text-body-lg font-semibold">{user.businessUnit || "All business units"}</p></div>
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm"><p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Account status</p><p className="mt-2 flex items-center gap-2 text-body-lg font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${user.isActive ? "bg-success" : "bg-error"}`}/>{user.isActive ? "Active" : "Inactive"}</p></div>
        </section>
        <a href="/forgot-password" className="flex min-h-14 items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-5 text-body-md font-semibold text-primary"><span>Change or reset your password</span><Icon name="arrow_forward" size={20}/></a>
      </>}
    </div>
  </AppShell>;
}
