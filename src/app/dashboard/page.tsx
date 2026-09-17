"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { Icon } from "@/components/icon";
import { AgeingChip, OutageStatusChip } from "@/components/status-chip";
import { api } from "@/lib/api";
import type { DashboardSummary, UserSummary } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get<UserSummary>("/me").then((u) => { setUser(u); const scoped = u.role === "USER" && u.businessUnit ? `?businessUnit=${encodeURIComponent(u.businessUnit)}` : ""; return api.get<DashboardSummary>(`/dashboard/summary${scoped}`); }).then(setSummary).catch(() => setError("Dashboard data could not be loaded.")); }, []);
  const total = summary?.ageingBuckets.reduce((sum, bucket) => sum + bucket.count, 0) ?? 0;
  return <AppShell title="Dashboard" subtitle={user ? `${user.fullName} — ${user.role} · ${user.businessUnit ?? "All business units"}` : "Loading live outage data…"}>
    <div data-tutorial="dashboard-summary" className="flex flex-col w-full pb-8"><div className="px-gutter pt-space-sm pb-space-xs flex items-center justify-between"><div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-full"><Icon name="location_city" size={18} className="text-primary" /><span className="text-label-md">{user?.businessUnit ?? "All business units"}</span></div><button type="button" onClick={() => window.dispatchEvent(new Event("gridline-open-tutorial"))} className="flex items-center gap-1 rounded-full bg-primary-fixed px-space-sm py-1.5 text-label-sm font-bold text-on-primary-fixed-variant"><Icon name="help" size={16} /> Tutorial</button></div>
      {summary && <><div className="px-gutter mt-space-sm grid grid-cols-3 gap-2"><MetricCard label="Out Now" value={summary.outNow} sublabel="Active transformers" tone="critical" /><MetricCard label="Restored" value={summary.restoredToday} sublabel="Today" icon={<Icon name="verified" size={18} className="text-surface-tint" />} /><MetricCard label="Oldest" value={<>{summary.oldestOutageAgeDays}<span className="text-label-md">d</span></>} sublabel={summary.oldestOutageDtCode} icon={<Icon name="timer_off" size={18} className="text-secondary" />} /></div><div className="px-gutter mt-space-md"><div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm"><div className="flex justify-between mb-3"><h2 className="text-label-lg font-bold uppercase">Outage Ageing Stack</h2><span className="text-label-sm">{total} active</span></div><div className="flex flex-wrap gap-x-3 gap-y-1">{summary.ageingBuckets.map((b) => <span key={b.label} className="text-label-sm text-on-surface-variant">{b.label} · {b.count}</span>)}</div></div></div><div className="px-gutter mt-space-md flex flex-col gap-space-sm"><div className="flex justify-between"><h2 className="text-label-lg font-bold uppercase">Active Outages</h2><Link href="/outages" className="text-label-sm text-primary font-bold">View all</Link></div>{summary.activeOutages.map((o) => <Link href="/outages" key={o.outageId} className="bg-surface-container-lowest p-3 rounded-xl shadow-sm"><div className="flex justify-between"><div><span className="text-label-sm text-on-surface-variant">{o.outageRef}</span><h3 className="text-body-lg font-semibold">{o.dtCodeSnapshot}</h3></div><OutageStatusChip status={o.status} /></div><p className="text-body-sm text-on-surface-variant mt-1">{o.faultCategory} — {o.feederSnapshot}</p><div className="mt-2 flex justify-between"><span className="text-body-sm">{o.businessUnitSnapshot}</span><AgeingChip ageDays={o.ageDays} /></div></Link>)}</div></>}
      {error && <p className="px-gutter py-space-xl text-center text-body-sm text-error">{error}</p>}
    </div>
  </AppShell>;
}
