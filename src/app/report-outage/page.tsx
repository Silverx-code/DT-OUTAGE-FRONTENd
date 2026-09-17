"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { api, ApiError } from "@/lib/api";
import type { ChallengeCategory, DtMaster, FaultCategory, ReportOutagePayload, UserSummary } from "@/lib/types";

export default function ReportOutagePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [selectedDt, setSelectedDt] = useState<DtMaster | null>(null);
  const [dtQuery, setDtQuery] = useState("");
  const [dtResults, setDtResults] = useState<DtMaster[]>([]);
  const [faultCategoryId, setFaultCategoryId] = useState<number | "">("");
  const [faultDescription, setFaultDescription] = useState("");
  const [challengeId, setChallengeId] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [faultCategories, setFaultCategories] = useState<FaultCategory[]>([]);
  const [challengeCategories, setChallengeCategories] = useState<ChallengeCategory[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredFilled = Boolean(selectedDt) && faultCategoryId !== "" && faultDescription.trim().length >= 10;

  useEffect(() => {
    api.get<UserSummary>("/me").then(setCurrentUser).catch(() => undefined);
    Promise.all([api.get<FaultCategory[]>("/lookups/fault-categories"), api.get<ChallengeCategory[]>("/lookups/challenge-categories")])
      .then(([faults, challenges]) => { setFaultCategories(faults); setChallengeCategories(challenges); })
      .catch(() => setError("Could not load reporting categories. Check your connection."));
  }, []);

  useEffect(() => {
    const query = dtQuery.trim();
    if (!query) { setDtResults([]); return; }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try { setDtResults(await api.get<DtMaster[]>(`/dt-master/search?q=${encodeURIComponent(query)}`)); }
      catch { setError("Transformer search is unavailable right now."); }
      finally { setSearching(false); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [dtQuery]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!requiredFilled) return;
    setSubmitting(true); setError(null);
    const now = new Date();
    const payload: ReportOutagePayload = { dtId: selectedDt!.dtId, outageDate: now.toISOString().slice(0, 10), outageTime: now.toTimeString().slice(0, 8), faultCategoryId: faultCategoryId as number, faultDescription: faultDescription.trim(), ...(challengeId === "" ? {} : { challengeId }), ...(comment.trim() ? { additionalComment: comment.trim() } : {}) };
    try { const response = await api.post<{ outageRef: string }>("/outages", payload); setSubmitted(response.outageRef); }
    catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? "This transformer already has an active outage report." : "The report could not be submitted. Please try again."); }
    finally { setSubmitting(false); }
  }

  return (
    <AppShell title="Report Outage" subtitle={currentUser ? `${currentUser.fullName} — ${currentUser.role}, ${currentUser.businessUnit ?? "No business unit"}` : "Loading signed-in user…"}>
      <form data-tutorial="report-form" onSubmit={handleSubmit} className="flex flex-col w-full px-margin py-space-md gap-space-lg pb-space-xl">
        <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-space-xs rounded-full self-start"><Icon name="bolt" size={16} filled className="text-primary" /><span className="text-label-sm text-primary uppercase tracking-wider">Active Mode</span></div>
        <section className="flex flex-col gap-space-xs">
          <Field label="Distribution Transformer (DT) Lookup" required />
          <div className="flex items-center bg-surface-container-lowest rounded-xl p-space-sm shadow-md focus-within:shadow-xl"><div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0"><Icon name="electric_meter" size={22} className="text-on-primary-fixed" /></div><input className="w-full bg-transparent px-space-sm text-on-surface text-headline-md leading-tight focus:outline-none placeholder:text-outline" placeholder="Search DT by code, name, street or feeder..." value={selectedDt ? `${selectedDt.dtCode} — ${selectedDt.dtName}` : dtQuery} onChange={(e) => { setSelectedDt(null); setDtQuery(e.target.value); setError(null); }} aria-label="Search distribution transformer" /><button type="button" aria-label="Clear transformer selection" onClick={() => { setSelectedDt(null); setDtQuery(""); }} className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary shrink-0"><Icon name="close" size={20} /></button></div>
          {searching && <span className="text-label-sm text-on-surface-variant">Searching transformer master…</span>}
          {!searching && dtQuery.trim() && !selectedDt && <div className="flex max-h-56 flex-col overflow-y-auto rounded-xl bg-surface-container-lowest shadow-md">{dtResults.map((dt) => <button key={dt.dtId} type="button" onClick={() => { setSelectedDt(dt); setDtQuery(""); setError(null); }} className="flex flex-col items-start gap-1 border-b border-outline-variant px-space-md py-space-sm text-left last:border-0 hover:bg-surface-container-low"><span className="text-body-md font-semibold">{dt.dtCode} — {dt.dtName}</span><span className="text-label-sm text-on-surface-variant">{dt.businessUnit} · {dt.undertaking} · {dt.feeder}</span></button>)}{!dtResults.length && <span className="px-space-md py-space-sm text-body-sm text-on-surface-variant">No active transformer matches that search.</span>}</div>}
        </section>
        <div className="flex items-start gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-sm"><div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0"><Icon name="verified" size={18} className="text-on-primary" /></div><div><div className="flex items-center gap-space-xs"><span className="text-label-md text-primary tracking-wide">{selectedDt ? "Verified active asset" : "Select an asset to continue"}</span>{selectedDt && <span className="text-label-sm bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>}</div><p className="text-body-sm text-on-surface-variant mt-0.5">{selectedDt ? "The selected transformer is ready for reporting. The server will prevent duplicate active outages." : "Search by DT code, name, street, or feeder above."}</p></div></div>
        <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-md gap-space-sm"><div className="flex items-center gap-space-xs pb-space-xs"><Icon name="lock_reset" size={20} className="text-tertiary" /><span className="text-label-md text-on-surface uppercase tracking-wider font-bold">DT Master Snapshot (Immutable)</span></div><div className="grid grid-cols-2 gap-space-sm"><SnapshotField label="Business Unit" value={selectedDt?.businessUnit ?? "—"} /><SnapshotField label="Undertaking" value={selectedDt?.undertaking ?? "—"} /><SnapshotField label="Primary Feeder Circuit" value={selectedDt?.feeder ?? "—"} span2 highlight /><SnapshotField label="Capacity" value={selectedDt ? `${selectedDt.capacityKva} kVA` : "—"} /><SnapshotField label="Supply Band" value={selectedDt?.supplyBand ?? "—"} /></div></div>
        <Field label="Fault Category" required><select required className="w-full h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant" value={faultCategoryId} onChange={(e) => setFaultCategoryId(Number(e.target.value) || "")}><option value="">Select a fault category…</option>{faultCategories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></Field>
        <Field label="Fault Description" required><textarea required minLength={10} maxLength={250} className="w-full min-h-[96px] bg-surface-container-lowest rounded-lg p-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant resize-none" placeholder="Describe what happened…" value={faultDescription} onChange={(e) => setFaultDescription(e.target.value)} /><span className="text-label-sm text-on-surface-variant self-end">{faultDescription.length} / 250</span></Field>
        <Field label="Restoration Challenge (if known)"><select className="w-full h-12 bg-surface-container-lowest rounded-lg px-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant" value={challengeId} onChange={(e) => setChallengeId(Number(e.target.value) || "")}><option value="">Not yet known — can be added at restoration</option>{challengeCategories.map((c) => <option key={c.challengeId} value={c.challengeId}>{c.challengeName}</option>)}</select></Field>
        <Field label="Additional Comment (optional)"><textarea className="w-full min-h-[72px] bg-surface-container-lowest rounded-lg p-space-sm text-body-lg text-on-surface shadow-sm border border-outline-variant resize-none" placeholder="Anything else worth flagging…" value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
        <button type="submit" disabled={!requiredFilled || submitting} className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-sm disabled:opacity-40">{submitting ? "Submitting…" : "Submit Report"}</button>
        {error && <p className="text-body-sm text-error text-center" role="alert">{error}</p>}
      </form>
      {submitted && <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter bg-inverse-surface/40"><div className="flex flex-col w-full max-w-sm bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl gap-space-md text-center"><Icon name="check_circle" size={48} filled className="text-primary mx-auto" /><span className="text-headline-md">Outage Ticket Created</span><span className="text-label-lg text-primary font-bold">{submitted}</span><button type="button" onClick={() => router.push("/dashboard")} className="w-full min-h-[48px] bg-primary text-on-primary rounded-xl text-body-lg font-bold">Return to Dashboard</button></div></div>}
    </AppShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children?: React.ReactNode }) { return <div className="flex flex-col gap-space-xs"><label className="text-label-md uppercase tracking-wider text-on-surface-variant">{label}{required && <span className="text-secondary font-bold"> *</span>}</label>{children}</div>; }
function SnapshotField({ label, value, span2, highlight }: { label: string; value: string; span2?: boolean; highlight?: boolean }) { return <div className={`flex flex-col p-space-sm bg-surface-container-low rounded-lg ${span2 ? "col-span-2" : ""}`}><span className="text-label-sm uppercase text-on-surface-variant">{label}</span><span className={`text-label-md font-bold ${highlight ? "text-primary" : "text-on-surface"}`}>{value}</span></div>; }
