"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { AgeingChip } from "@/components/status-chip";
import { api, ApiError } from "@/lib/api";
import type { ChallengeCategory, DtOutage, UserSummary } from "@/lib/types";

export default function RestoreDtPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [outages, setOutages] = useState<DtOutage[]>([]);
  const [challenges, setChallenges] = useState<ChallengeCategory[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [challengeId, setChallengeId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState<DtOutage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<UserSummary>("/me"), api.get<DtOutage[]>("/outages?status=OUT"), api.get<ChallengeCategory[]>("/lookups/challenge-categories")]).then(([u, o, c]) => {
      setUser(u); setOutages(o); setChallenges(c); setSelectedId(o[0]?.outageId ?? "");
      const now = new Date(); setDate(now.toISOString().slice(0, 10)); setTime(now.toTimeString().slice(0, 5));
    }).catch(() => setError("Active outages could not be loaded."));
  }, []);

  const filtered = useMemo(() => outages.filter((o) => `${o.dtCodeSnapshot} ${o.outageRef} ${o.faultDescription}`.toLowerCase().includes(query.toLowerCase())), [outages, query]);
  const selected = outages.find((o) => o.outageId === selectedId);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!selected || !date || !time || !remarks.trim()) return;
    setSubmitting(true); setError("");
    try {
      const response = await api.patch<DtOutage>(`/outages/${selected.outageId}/restore`, { restorationDate: date, restorationTime: time, restorationRemarks: remarks.trim(), ...(challengeId === "" ? {} : { challengeId }) });
      setRestored(response); setOutages((items) => items.filter((o) => o.outageId !== selected.outageId));
    } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Restoration could not be saved."); }
    finally { setSubmitting(false); }
  }

  return <AppShell title="Restore DT" subtitle={user ? `${user.fullName} — ${user.role} · ${user.businessUnit ?? "All business units"}` : "Loading active outages…"}>
    {restored ? <div className="flex flex-col items-center gap-space-md px-margin py-space-xl text-center"><Icon name="check_circle" size={48} filled className="text-success" /><h2 className="text-headline-md">DT Restored</h2><p className="text-body-sm text-on-surface-variant">{restored.dtCodeSnapshot} is back online. Audit entry logged.</p><button onClick={() => router.push("/dashboard")} className="min-h-[48px] px-space-lg bg-primary text-on-primary rounded-xl text-body-lg font-bold">Return to Dashboard</button></div> : <form data-tutorial="restore-form" onSubmit={submit} className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl">
      <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-sm"><Icon name="search" size={20} className="text-outline mx-space-xs" /><input className="w-full bg-transparent px-space-sm text-body-lg focus:outline-none" placeholder="Search active DT or outage ref…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <div className="flex flex-col gap-space-sm">{filtered.map((o) => <button type="button" key={o.outageId} onClick={() => setSelectedId(o.outageId)} className={`text-left bg-surface-container-lowest rounded-xl p-space-md shadow-sm border-2 ${selectedId === o.outageId ? "border-primary" : "border-transparent"}`}><div className="flex justify-between"><div><span className="text-label-sm text-on-surface-variant">{o.outageRef}</span><h3 className="text-body-lg font-semibold">{o.dtCodeSnapshot}</h3></div><AgeingChip ageDays={o.ageDays} /></div><p className="text-body-sm text-on-surface-variant mt-1">{o.faultCategory} — {o.faultDescription}</p></button>)}</div>
      {selected && <><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><SummaryRow label="Feeder" value={selected.feederSnapshot} /><SummaryRow label="Fault" value={selected.faultCategory} /><SummaryRow label="Reported" value={new Date(selected.outageDatetime).toLocaleString()} /></div><Field label="Restoration date and time" required><div className="grid grid-cols-2 gap-space-sm"><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-lg border border-outline-variant bg-surface px-2" /><input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-12 rounded-lg border border-outline-variant bg-surface px-2" /></div></Field><Field label="Restoration remarks" required><textarea required className="w-full min-h-[80px] rounded-lg border border-outline-variant bg-surface p-space-sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="What was done to restore the DT?" /></Field><Field label="Challenge faced"><select value={challengeId} onChange={(e) => setChallengeId(Number(e.target.value) || "")} className="h-12 rounded-lg border border-outline-variant bg-surface px-2"><option value="">No change</option>{challenges.map((c) => <option key={c.challengeId} value={c.challengeId}>{c.challengeName}</option>)}</select></Field><button type="submit" disabled={submitting || !remarks.trim()} className="min-h-[52px] rounded-xl bg-primary text-on-primary text-body-lg font-bold disabled:opacity-40">{submitting ? "Saving…" : "Confirm Restoration"}</button></>}
      {error && <p className="text-body-sm text-error text-center">{error}</p>}
    </form>}
  </AppShell>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div className="flex flex-col gap-space-xs"><label className="text-label-md uppercase text-on-surface-variant">{label}{required && " *"}</label>{children}</div>; }
function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between text-body-sm"><span className="text-on-surface-variant">{label}</span><span>{value}</span></div>; }
